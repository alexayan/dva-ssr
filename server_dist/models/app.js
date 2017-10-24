'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {

  namespace: 'app',

  state: {
    ENV: 'pc',
    SSR_ENV: {
      platform: 'pc'
    },
    sizeMode: 'lg',
    indexs: [],
    isWechatReady: false,
    isBackFromDetail: false,
    error: null,
    globalMessages: [],
    wpm: false,
    nouns: null
  },

  subscriptions: {},

  effects: {},

  reducers: {}
};