/**
 * @file Contains mock data for podverse
 */

/** @type {PodConfig} */
export const MOCK_POD1_CONFIG = {
  id: '123',
  label: 'Test pod',
  description: 'Pod for testing',
  storage: {
    space: {
      root_uri: 'http://localhost:3000/',
      owner_id: 'http://localhost:3000/card#me',
    },
    repo: {
      backend: {
        root_dir_path: '/',
      },
    },
  },
};

/** @type {PodConfig} */
export const MOCK_POD2_CONFIG = {
  id: '1234',
  label: 'a',
  storage: {
    space: {
      root_uri: 'a:',
      owner_id: 'a:',
    },
    repo: {
      backend: {
        root_dir_path: '/',
      },
    },
  },
};


/** @type {PodverseConfig} */
export const MOCK_PODVERSE1_CONFIG = {
  pods: [structuredClone(MOCK_POD1_CONFIG), structuredClone(MOCK_POD2_CONFIG)],
};
