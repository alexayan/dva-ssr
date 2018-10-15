import assign from 'lodash.assign';

const cfg = {
  timeout: 6 * 1000, // render timeout
  verbose: process.NODE_ENV !== 'production' ? true : false,
  staticMarkup: false,
  ignoreTimeout: true,
  __DEV__: process.NODE_ENV === 'development' ? true : false
};

export function config(config) {
  assign(cfg, config || {});
}

export function getConfig() {
  return cfg;
}
