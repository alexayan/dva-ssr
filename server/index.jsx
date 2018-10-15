import React from 'react';
import { Route } from 'react-router';
import ssr from '../lib';

import appModel from './models/app';

const routes = [
    <Route exact key="index" path="/" render={() => <div>/</div>} />,
    <Route exact key="news" path="/news" sync render={() => <div>/news</div>} />,
    <Route exact key="tech" path="/tech" render={() => <div>/tech</div>} />,
    <Route exact key="browser" path="/browser" render={() => <div>/browser</div>} />
];

function onRenderSuccess({ html, url, env }) {
  console.log('on render success')
}

ssr.render({
  url: '/',
  routes,
  models: [
    appModel
  ],
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
