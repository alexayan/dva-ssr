export default {

  namespace: 'app',

  state: {
    ENV: 'pc',
    SSR_ENV: {
      platform: 'pc',
    },
    sizeMode: 'lg',
    indexs: [],
    isWechatReady: false,
    isBackFromDetail: false,
    error: null,
    globalMessages: [],
    wpm: false,
    nouns: null,
  },

  subscriptions: {
  },

  effects: {
    * fetchNewTopicCount({}, { select, put, call }) {
      console.log(123)
    }
  },

  reducers: {
  },
};
