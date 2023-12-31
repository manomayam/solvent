//! I provide types to represent podverse proxy recipes.
//!  

use std::{convert::Infallible, net::SocketAddr, path::PathBuf, sync::Arc};

use futures::{future::BoxFuture, TryFutureExt};
use http_uri::invariant::AbsoluteHttpUri;
use hyper::{service::make_service_fn, Server};
use manas_http::service::impl_::NormalValidateTargetUri;
use manas_server::CW;
use manas_space::{resource::uri::SolidResourceUri, BoxError};
use manas_storage::service::cors::LiberalCors;
use once_cell::sync::OnceCell;
use secrecy::Secret;
use tauri::Config;
use tokio::sync::{RwLock, RwLockReadGuard};
use tower_http::catch_panic::{CatchPanic, DefaultResponseForPanic};
use tracing::error;

use crate::podverse_manager::{
    config::{load_podverse_config, write_podverse_config},
    podverse::build_podset,
};

use self::{
    config::{LRcpPodConfig, LRcpPodverseConfig},
    lproxy::{LProxyConfig, LProxyService},
    podverse::{LRcpPodServiceFactory, LRcpPodSet, LRcpPodSetService},
};

pub mod config;
pub mod lproxy;
pub mod podverse;
pub mod repo;
pub mod storage;

/// Type of proxy service
type ProxyService = CatchPanic<
    LiberalCors<LProxyService<NormalValidateTargetUri<LRcpPodSetService>>>,
    DefaultResponseForPanic,
>;

/// A struct for representing pod key.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct PodKey(SolidResourceUri, PathBuf);

/// Podverse manager.
#[derive(Clone)]
pub struct PodverseManager {
    app_config: Arc<Config>,
    podverse_config: Arc<RwLock<LRcpPodverseConfig>>,
    proxy_session_secret_token: Secret<String>,
    proxy_port: OnceCell<u16>,
    proxy_endpoint: OnceCell<AbsoluteHttpUri>,
    proxy_service: Arc<RwLock<ProxyService>>,
    dev_mode: bool,
}

impl std::fmt::Debug for PodverseManager {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("PodverseManager")
            .field("app_config", &self.app_config)
            .field("podverse_config", &self.podverse_config)
            .field(
                "proxy_session_secret_token",
                &self.proxy_session_secret_token,
            )
            .field("proxy_port", &self.proxy_port)
            .field("proxy_endpoint", &self.proxy_endpoint)
            .field("dev_mode", &self.dev_mode)
            .finish()
    }
}

impl PodverseManager {
    /// Create a new [`Recipe`].
    pub async fn new(app_config: Arc<Config>, dev_mode: bool) -> Result<Self, BoxError> {
        let persisted_podverse_config = load_podverse_config(&app_config)
            .inspect_err(|e| {
                error!("Error in loading podverse configuration. {e}");
            })
            .await?;

        let proxy_session_secret_token = Secret::new(uuid::Uuid::new_v4().to_string());

        let this = Self {
            app_config,
            proxy_port: Default::default(),
            proxy_endpoint: Default::default(),
            podverse_config: Arc::new(RwLock::new(LRcpPodverseConfig { pods: vec![] })),
            proxy_service: Arc::new(RwLock::new(Self::_make_proxy_svc(
                Arc::new(LRcpPodSet::new(vec![])),
                Secret::new(Default::default()),
                dev_mode,
            ))),
            proxy_session_secret_token,
            dev_mode,
        };

        this._invalidate_podverse(persisted_podverse_config).await?;

        Ok(this)
    }

    /// Get the proxy session secret token.
    pub fn proxy_session_secret_token(&self) -> &Secret<String> {
        &self.proxy_session_secret_token
    }

    /// Get the port proxy is running at.
    pub fn proxy_port(&self) -> u16 {
        *self
            .proxy_port
            .get_or_init(|| portpicker::pick_unused_port().expect("No ports free"))
    }

    /// Get the proxy endpoint.
    pub fn proxy_endpoint(&self) -> &AbsoluteHttpUri {
        self.proxy_endpoint.get_or_init(|| {
            format!("http://localhost:{}/", self.proxy_port())
                .parse()
                .expect("Must be valid")
        })
    }

    /// Get the podverse configuration.
    pub async fn podverse_config(&self) -> RwLockReadGuard<'_, LRcpPodverseConfig> {
        self.podverse_config.read().await
    }

    fn _make_proxy_svc(
        podset: Arc<LRcpPodSet>,
        secret_token: Secret<String>,
        dev_mode: bool,
    ) -> ProxyService {
        CatchPanic::new(LiberalCors::new(LProxyService::new(
            LProxyConfig { secret_token },
            NormalValidateTargetUri::new(LRcpPodSetService {
                pod_set: podset,
                pod_service_factory: Arc::new(CW::<LRcpPodServiceFactory>::new(dev_mode)),
            }),
        )))
    }

    /// Serve the proxy.
    pub fn serve_proxy(&self) -> BoxFuture<'static, Result<(), BoxError>> {
        let addr = SocketAddr::from(([127, 0, 0, 1], self.proxy_port()));

        let service_cell = self.proxy_service.clone();
        let make_svc = make_service_fn(move |_conn| {
            let service_cell = service_cell.clone();
            async move { Ok::<_, Infallible>(service_cell.read().await.clone()) }
        });

        let server = Server::bind(&addr).serve(make_svc);
        Box::pin(server.map_err(|e| e.into()))
    }

    /// Reload the config.
    async fn _invalidate_podverse(
        &self,
        new_podverse_config: LRcpPodverseConfig,
    ) -> Result<(), BoxError> {
        let new_podset = Arc::new(
            build_podset(&new_podverse_config)
                .inspect_err(|e| error!("Error in podset initialization. {e}"))
                .await?,
        );

        // Acquire locks.
        let mut podverse_config_guard = self.podverse_config.write().await;
        let mut service_guard = self.proxy_service.write().await;

        // Update podverse config.
        *podverse_config_guard = new_podverse_config;
        // Update service.
        *service_guard = Self::_make_proxy_svc(
            new_podset,
            self.proxy_session_secret_token.clone(),
            self.dev_mode,
        );

        // Drop guards.
        drop(service_guard);
        drop(podverse_config_guard);

        Ok(())
    }

    /// Provision a new pod.
    pub async fn provision_pod(&self, new_pod_config: LRcpPodConfig) -> Result<(), BoxError> {
        // Construct updated podverse config.
        let mut podverse_config = self.podverse_config.read().await.clone();
        // TODO deduplicate.
        podverse_config.pods.push(new_pod_config);

        // Persist the new podverse config.
        write_podverse_config(&self.app_config, &podverse_config)
            .inspect_err(|e| error!("Error in writing the new podverse config. {e}"))
            .await?;

        // Invalidate the podverse.
        self._invalidate_podverse(podverse_config).await?;

        Ok(())
    }

    /// Deprovision a new pod.
    pub async fn deprovision_pod(&self, _pod_key: PodKey) -> Result<(), BoxError> {
        // Construct updated podverse config.
        let mut _podverse_config = self.podverse_config.read().await.clone();

        todo!()
    }
}
