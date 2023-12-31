//! I provide implementation of local pod proxy service layer.
//!

use std::{
    collections::HashMap,
    task::{Context, Poll},
};

use futures::future::{self, Either, Ready};
use http::{Request, Response, StatusCode};
use http_api_problem::ApiError;
use http_uri::invariant::AbsoluteHttpUri;
use hyper::Body;
use secrecy::{ExposeSecret, Secret};
use tower::Service;
use tracing::error;

/// Configuration for local pod proxy.
#[derive(Debug, Clone)]
pub struct LProxyConfig {
    /// Secret token.
    pub secret_token: Secret<String>,
}

/// An implementation of [`HtpService`] that handle local pod proxying.
#[derive(Debug, Clone)]
pub struct LProxyService<S> {
    config: LProxyConfig,
    inner: S,
}

impl<S> Service<Request<Body>> for LProxyService<S>
where
    S: Service<Request<Body>, Response = Response<Body>> + Clone,
{
    type Response = Response<Body>;

    type Error = S::Error;

    type Future = Either<S::Future, Ready<Result<Self::Response, Self::Error>>>;

    #[inline]
    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut req: Request<Body>) -> Self::Future {
        let q_params = form_urlencoded::parse(req.uri().query().unwrap_or("").as_bytes())
            .into_owned()
            .collect::<HashMap<_, _>>();

        if !q_params
            .get("token")
            .is_some_and(|token_str| self.config.secret_token.expose_secret() == token_str)
        {
            error!("Invalid secret token.");
            // Return error response.
            return Either::Right(future::ready(Ok(ApiError::builder(
                StatusCode::BAD_REQUEST,
            )
            .message("Invalid secret token.")
            .finish()
            .into_hyper_response())));
        }

        if let Some(original_res_uri) = q_params
            .get("res")
            .and_then(|res_uri_str| AbsoluteHttpUri::try_new_from(res_uri_str.as_str()).ok())
        {
            req.extensions_mut().insert(original_res_uri);
            // Delegate to inner service.
            Either::Left(self.inner.call(req))
        } else {
            error!("Invalid original resource uri.");
            Either::Right(future::ready(Ok(ApiError::builder(
                StatusCode::BAD_REQUEST,
            )
            .message("Invalid original resource uri.")
            .finish()
            .into_hyper_response())))
        }
    }
}

impl<S> LProxyService<S> {
    /// Create a new [`LProxyService`].
    #[inline]
    pub fn new(config: LProxyConfig, inner: S) -> Self {
        Self { config, inner }
    }
}
