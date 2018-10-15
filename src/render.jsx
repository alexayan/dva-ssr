import React from 'react';
import uid from 'uid';
import { StaticRouter } from 'react-router';
import { createMemoryHistory } from 'history';
import merge from 'lodash.merge';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import ssrModel from './ssrModel';
import { findRouteByUrl } from './utils';
import dvaServerSync from './dvaServerSync';
import block from './block';
import {getConfig} from './config';

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

async function renderFragment(createApp, routes, url, initialState, timeout, staticMarkup, ignoreTimeout) {
  let asyncTime = 0;
  let isTimeout = false;
  const render = staticMarkup ? renderToStaticMarkup : renderToString;
  const history = createMemoryHistory();
  history.push(url);
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
    const isLocked = block.isLocked(id);
    if (isLocked) {
      const asyncStartTime = Date.now();
      try {
        const result = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('render timeout'));
          }, timeout)
          block.wait(id, () => {
            asyncTime = Date.now() - asyncStartTime;
            clearTimeout(timer);
            const curState = appDOM.props.store.getState();
            const html = render(appDOM);
            resolve({ html, state: curState, context, performance: {
              asyncTime
            }});
          });
        });
        return result;
      } catch (e) {
        isTimeout = true;
        if (!ignoreTimeout) {
          throw e;
        }
      }
    }
    const html = render(appDOM);
    const curState = appDOM.props.store.getState();
    return { html, state: curState, context, performance: {
      asyncTime
    }, isTimeout};
  }
  const appDOM = app.start()({
    context,
  });
  const html = render(appDOM);
  const curState = appDOM.props.store.getState();
  return { html, state: curState, context, performance: {
    asyncTime
  }};
}

export default async function render({
  url, env, routes, renderFullPage, createApp, initialState, onRenderSuccess
}) {
  const config = getConfig();
  try {
    const startTime = Date.now();
    const state = merge({}, initialState || {}, {
      ssr: {
        env,
      }
    });
    const fragment = await renderFragment(createApp, routes, url, state, config.timeout, config.staticMarkup, config.ignoreTimeout);
    const context = fragment.context;
    if (!context) {
      if (config.verbose || config.__DEV__) {
        console.log(`fail to match url '${url}', please check routes`, env);
      }
      return { code: 404, url, env };
    } else if (context.url) {
      if (config.verbose || config.__DEV__) {
        console.log(`redirect to url '${context.url}'`, env);
      }
      return await render({
        url: context.url, env, routes, renderFullPage, createApp, initialState, onRenderSuccess
      })
    }
    let html = fragment.html;
    if (renderFullPage) {
      html = await renderFullPage(fragment);
    }
    if (fragment.isTimeout) {
      console.log(`render url '${url}' timeout`, env);
    } else if (config.verbose || config.__DEV__) {
      console.log(`render url '${url}' success in ${Date.now() - startTime} ms`, env);
      if (fragment.performance.asyncTime) {
        console.log(`async time: ${fragment.performance.asyncTime} ms\n`);
      }
    }
    if (onRenderSuccess) {
      await onRenderSuccess({
        html, url, env, state: fragment.state,
      });
    }
    return {
      code: 200, url, env, html,
    };
  } catch (e) {
    console.log(`render url '${url}' error`, env);
    console.error(e);
    return {
      code: 500, url, env, error: e,
    };
  }
}
