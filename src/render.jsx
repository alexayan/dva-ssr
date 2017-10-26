import React from 'react';
import uid from 'uid';
import { StaticRouter } from 'react-router';
import { createMemoryHistory } from 'history';
import merge from 'lodash.merge';
import { renderToStaticMarkup } from 'react-dom/server';
import ssrModel from './ssrModel';
import { findRouteByUrl } from './utils';
import dvaServerSync from './dvaServerSync';
import block from './block';

function existSSRModel(app) {
  try {
    let model = null;
    app._models.forEach((m) => {
      if (m.namespace === 'ssr') {
        model = m;
      }
    });
    return !!model;
  } catch (e) {
    return false;
  }
}

function getAsyncActions(app) {
  try {
    let actions = [];
    app._models.forEach((model) => {
      if (model.effects) {
        actions = actions.concat(Object.keys(model.effects));
      }
    });
    return actions;
  } catch (e) {
    return [];
  }
}

function findSync(branch) {
  let sync = false;
  branch.forEach((b) => {
    sync = !!b.props.sync;
  });
  return sync;
}

async function renderFragment(createApp, routes, url, initialState) {
  const history = createMemoryHistory();
  const context = {};
  const app = createApp({
    history,
    initialState,
  });
  if (!existSSRModel(app)) {
    app.model(ssrModel);
  }
  app.router(options => (<StaticRouter location={url} context={options.context}>
    <div>
      {routes}
    </div>
  </StaticRouter>));
  const asyncActions = getAsyncActions(app);
  const branch = findRouteByUrl(routes, url);
  if (branch.length === 0) {
    return {};
  }
  const sync = findSync(branch);
  if (!sync && asyncActions && asyncActions.length > 0) {
    const id = uid(10);
    app.use(dvaServerSync(id, (action) => {
      if (asyncActions.indexOf(action.type) > -1) {
        return true;
      }
      return false;
    }, block));
    const appDOM = app.start()({
      context,
    });
    let html = renderToStaticMarkup(appDOM);
    const result = await new Promise((resolve) => {
      block.wait(id, () => {
        const curState = appDOM.props.store.getState();
        html = renderToStaticMarkup(appDOM);
        resolve({ html, state: curState, context });
      });
    });
    return result;
  }
  const appDOM = app.start()({
    context,
  });
  const html = renderToStaticMarkup(appDOM);
  const curState = appDOM.props.store.getState();
  return { html, state: curState, context };
}

export default async function render({
  url, env, routes, renderFullPage, createApp, initialState, onRenderSuccess,
}) {
  try {
    const state = merge({}, initialState || {}, {
      ssr: {
        env,
      },
      app: {
        SSR_ENV: env,
      },
    });
    const fragment = await renderFragment(createApp, routes, url, state);
    const context = fragment.context;
    if (!context) {
      return { code: 404, url, env };
    } else if (context.url) {
      return {
        code: 302, url, env, redirect: context.url,
      };
    }
    const html = await renderFullPage(fragment);
    if (onRenderSuccess) {
      await onRenderSuccess({
        html, url, env, state: fragment.state,
      });
    }
    return {
      code: 200, url, env, html,
    };
  } catch (e) {
    console.error(e);
    return {
      code: 500, url, env, error: e,
    };
  }
}
