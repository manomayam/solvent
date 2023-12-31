//! I provide storage implementation for the recipe.
//!

use std::sync::Arc;

use manas_repo_opendal::object_store::backend::impl_::fs::FsBackend;
use manas_server::{
    space::RcpStorageSpace,
    storage::{RcpStorage, RcpStorageService, RcpStorageServiceFactory, RcpStorageSetup},
    CW,
};
use manas_space::BoxError;
use name_locker::impl_::InmemNameLocker;
use opendal::services::Fs;
use tracing::error;

use super::{
    config::LRcpStorageConfig,
    repo::{LRcpCNL, LRcpPEP},
};

/// An implementation of [`RcpStorageSetup`] for local proxy storages.
#[derive(Debug, Clone)]
pub struct LocalProxyStorageSetup;

impl RcpStorageSetup for LocalProxyStorageSetup {
    type Backend = FsBackend;

    type ResourceLocker = InmemNameLocker<String>;

    type CNL = LRcpCNL;

    type PEP = LRcpPEP;
}

/// Type of the storages for the recipe.
pub type LRcpStorage = RcpStorage<LocalProxyStorageSetup>;

/// Type of the storage services for the recipe.
pub type LRcpStorageService = RcpStorageService<LocalProxyStorageSetup>;

/// Type of the storage service factories for the recipe.
pub type LRcpStorageServiceFactory = RcpStorageServiceFactory<LocalProxyStorageSetup>;

/// Build storage from config.
pub async fn build_storage(config: LRcpStorageConfig) -> Result<LRcpStorage, BoxError> {
    let mut builder = Fs::default();
    builder.root(config.repo.backend.root_dir_path.to_string_lossy().as_ref());

    // TODO Must not be blocking?
    let backend = FsBackend::try_from(builder).map_err(|e| {
        error!("Error in creating backend. {e}");
        e
    })?;

    let space_config = &config.space;
    let st_descr_uri = format!("{}_/description.ttl", space_config.root_uri.as_str())
        .as_str()
        .parse()
        .unwrap();

    let st_space = CW::<RcpStorageSpace>::new_shared(
        space_config.root_uri.clone(),
        st_descr_uri,
        space_config.owner_id.clone(),
    );

    let storage = LRcpStorage::new(
        st_space,
        backend,
        Default::default(),
        Default::default(),
        Default::default(),
        Arc::new(|_| None),
        Default::default(),
    );

    // // Initialize the repo.
    // storage
    //     .repo
    //     .initialize()
    //     .inspect_err(|e| error!("Error in initializing the repo. Error:\n {}", e))
    //     .await?;

    Ok(storage)
}
