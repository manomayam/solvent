/**
 * @file Types for podverse configuration.
 */

/**
 * @typedef {Object} RepoBackendConfig - Repo backend configuration.
 * @property {string} root_dir_path - Root directory path.
 */

/**
 * @typedef {Object} RepoConfig - Repo configuration.
 * @property {RepoBackendConfig} backend - backend config.
 */

/**
 * @typedef {{
 *  root_uri: string,
 *  owner_id: string
 * }} StorageSpaceConfig - Storage space configuration.
 */

/**
 * @typedef {{
 *  space: StorageSpaceConfig,
 *  repo: RepoConfig
 * }} StorageConfig - Storage configuration.
 */

/**w
 * @typedef {{
 *  storage: StorageConfig,
 *  label?: string,
 *  description?: string,
 * }} PodConfig - Pod configuration.
 */

/**
 * @typedef {{
 *  pods: PodConfig[]
 * }} PodverseConfig - Podverse configuration.
 */
