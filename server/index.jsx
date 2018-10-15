import React from 'react';
import { Route } from 'react-router';
import ssr from '../lib';

import createApp from './createApp';

const routes = (
  <div>
    <Route exact path="/" render={() => <div>/</div>} />
    <Route exact path="/news" sync render={() => <div>/news</div>} />
    <Route exact path="/tech" render={() => <div>/tech</div>} />
    <Route exact path="/browser" render={() => <div>/browser</div>} />
  </div>
);

function onRenderSuccess({ html, url, env }) {
  console.log('on render success')
}

ssr.render({
  url: '/',
  routes,
  createApp,
  env: {
  },
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
}).then((result) => {
  console.log(result)
})
