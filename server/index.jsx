import React from 'react';
import { Route } from 'react-router';
import ssr from '../lib';

import createApp from './createApp';

const routes = (
  <div>
    <Route exact sync path="/" render={() => <div>/</div>} />
    <Route exact path="/news" sync render={() => <div>/news</div>} />
    <Route exact path="/tech" render={() => <div>/tech</div>} />
    <Route exact path="/browser" render={() => <div>/browser</div>} />
  </div>
);

function onRenderSuccess({ html, url, env }) {
  console.log(html, url, env);
}

ssr.preSSRService({
  interval: 10000,
  routes,
  createApp,
  initialState: {
    app: {
      sizeMode: 'lg',
      globalMessages: [],
      ads: [],
      isWechatReady: false,
    },
  },
  renderFullPage: html => html,
  onRenderSuccess,
});
