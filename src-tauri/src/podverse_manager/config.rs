//! I provide types to represent configuration for the recipe.
//!

use std::{
    io::{self, ErrorKind},
    path::PathBuf,
};

use futures::TryFutureExt;
use http_uri::invariant::HierarchicalTrailingSlashHttpUri;
use tauri::{api::path::app_config_dir, Config};
use tracing::{error, info, warn};
use uuid::Uuid;
use webid::WebId;

/// Repo backend config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LRcpRepoBackendConfig {
    /// Backend root dir path.
    pub root_dir_path: PathBuf,
}

/// Repo config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LRcpRepoConfig {
    /// Backend config.
    pub backend: LRcpRepoBackendConfig,
}

/// Storage space config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct StorageSpaceConfig {
    /// Root uri of the storage space.
    pub root_uri: HierarchicalTrailingSlashHttpUri,

    /// Owner id of the storage space.
    pub owner_id: WebId,
}

/// Storage config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LRcpStorageConfig {
    /// Config of space.
    pub space: StorageSpaceConfig,

    /// Repo config.
    pub repo: LRcpRepoConfig,
}

/// Pod config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LRcpPodConfig {
    /// Id of the pod.
    pub id: Uuid,

    /// Storage config.
    pub storage: LRcpStorageConfig,

    /// Label of the pod.
    pub label: Option<String>,

    /// Description of the pod.
    pub description: Option<String>,
}

/// Un provisioned pod config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LRcpUnProvisionedPodConfig {
    /// Storage config.
    pub storage: LRcpStorageConfig,

    /// Label of the pod.
    pub label: Option<String>,

    /// Description of the pod.
    pub description: Option<String>,
}

/// Podverse config struct.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LRcpPodverseConfig {
    /// List of storages.
    pub pods: Vec<LRcpPodConfig>,
}

/// Resolve podverse config file path.
pub fn podverse_config_file_path(app_config: &Config) -> Option<PathBuf> {
    app_config_dir(app_config).map(|config_dir| config_dir.join("podverse.config.json"))
}

/// Load podverse config.
/// If config file doesn't exist already, it will create one.
pub async fn load_podverse_config(app_config: &Config) -> Result<LRcpPodverseConfig, ConfigError> {
    let config_file_path =
        podverse_config_file_path(app_config).ok_or(ConfigError::UnresolvedPath)?;

    info!("Resolved podverse config file path: {:?}", config_file_path);

    match tokio::fs::read(&config_file_path).await {
        Ok(content) => match serde_json::from_slice::<LRcpPodverseConfig>(&content) {
            Ok(config) => Ok(config),
            Err(e) => {
                warn!("Invalid podverse configuration. {e}");
                init_podverse_config(app_config).await
            }
        },
        Err(e) if e.kind() == ErrorKind::NotFound => {
            info!("Podverse config file doesn't exist.");
            init_podverse_config(app_config).await
        }
        Err(e) => {
            error!("unknown io error in reading podverse configuration. {e}");
            Err(ConfigError::UnknownIoError(e))
        }
    }
}

/// Initialize podverse config.
pub async fn init_podverse_config(app_config: &Config) -> Result<LRcpPodverseConfig, ConfigError> {
    let config = LRcpPodverseConfig { pods: vec![] };
    write_podverse_config(app_config, &config)
        .await
        .map(|_| config)
}

/// Write podverse config.
pub async fn write_podverse_config(
    app_config: &Config,
    podverse_config: &LRcpPodverseConfig,
) -> Result<(), ConfigError> {
    let config_file_path =
        podverse_config_file_path(app_config).ok_or(ConfigError::UnresolvedPath)?;

    info!("Resolved podverse config file path: {:?}", config_file_path);

    let config_json_bytes = serde_json::to_vec_pretty(podverse_config).expect("Must succeed.");

    tokio::fs::create_dir_all(config_file_path.parent().unwrap())
        .and_then(|_| tokio::fs::write(&config_file_path, config_json_bytes))
        .await
        .map_err(|e| {
            error!("Error in writing podverse configuration. {e}");
            ConfigError::UnknownIoError(e)
        })
}

/// Configuration errors.
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    /// Unresolved config path.
    #[error("Unresolved config path.")]
    UnresolvedPath,

    /// Unknown io error.
    #[error("Unknown io error.")]
    UnknownIoError(io::Error),
}
