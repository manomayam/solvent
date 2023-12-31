//! I provide podset implementation for the recipe.
//!

use std::sync::Arc;

use futures::{stream::FuturesUnordered, TryFutureExt, TryStreamExt};
use manas_server::podverse::static_::{
    RcpPod, RcpPodService, RcpPodServiceFactory, RcpStaticPodSet, RcpStaticPodSetService,
};
use manas_space::BoxError;

use crate::podverse_manager::storage::build_storage;

use super::{config::LRcpPodverseConfig, storage::LocalProxyStorageSetup};

/// Type of pods for the recipe.
pub type LRcpPod = RcpPod<LocalProxyStorageSetup>;

/// Type of pod services for the recipe.
pub type LRcpPodService = RcpPodService<LocalProxyStorageSetup>;

/// Type of pod service factories for the recipe.
pub type LRcpPodServiceFactory = RcpPodServiceFactory<LocalProxyStorageSetup>;

/// Type of the podsets for the recipe.
pub type LRcpPodSet = RcpStaticPodSet<LocalProxyStorageSetup>;

/// Type of the podset services for the recipe.
pub type LRcpPodSetService = RcpStaticPodSetService<LocalProxyStorageSetup>;

/// Build podset from config.
pub async fn build_podset(config: &LRcpPodverseConfig) -> Result<LRcpPodSet, BoxError> {
    let pods = config
        .pods
        .iter()
        .cloned()
        .map(|pod_config| {
            build_storage(pod_config.storage).map_ok(|storage| {
                Arc::new(LRcpPod {
                    storage: Arc::new(storage),
                })
            })
        })
        .collect::<FuturesUnordered<_>>()
        .try_collect::<Vec<_>>()
        .await?;

    Ok(LRcpPodSet::new(pods))
}
