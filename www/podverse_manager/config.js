/**
 * @file Types for podverse configuration.
 */

/**
 * @typedef {Object} RepoBackendConfig - Repo backend configuration.
 * @property {string} root_dir_path - Root directory path.
 */

/** @type {RepoBackendConfig} */
export let RepoBackendConfig;

/**
 * @typedef {Object} RepoConfig - Repo configuration.
 * @property {RepoBackendConfig} backend - backend config.
 */

/** @type {RepoConfig} */
export let RepoConfig;

/**
 * @typedef {{
 *  root_uri: string,
 *  owner_id: string
 * }} StorageSpaceConfig - Storage space configuration.
 */

/** @type {StorageSpaceConfig} */
export let StorageSpaceConfig;

/**
 * @typedef {{
 *  space: StorageSpaceConfig,
 *  repo: RepoConfig
 * }} StorageConfig - Storage configuration.
 */

/** @type {StorageConfig} */
export let StorageConfig;

/**
 * @typedef {{
 *  storage: StorageConfig,
 *  label?: string,
 *  description?: string,
 * }} PodConfig - Pod configuration.
 */

/** @type {PodConfig} */
export let PodConfig;

/**
 * @typedef {{
 *  pods: PodConfig[]
 * }} PodverseConfig - Podverse configuration.
 */

/** @type {PodverseConfig} */
export let PodverseConfig;
