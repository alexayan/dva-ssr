import dva from 'dva';

import appModel from './models/app';

function createApp(opts) {
  const app = dva(opts);

  app.model(appModel);

  return app;
}

export default createApp;
