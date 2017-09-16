import { match, createMemoryHistory, Route, IndexRoute } from 'dva/router';
import merge from 'lodash.merge';
import uid from 'uid';
import dvaServerSync from './dvaServerSync';
import block from './block';
import { renderToStaticMarkup } from 'react-dom/server';
import ssrModel from './ssrModel';

export default async function render({ url, env, routes, renderFullPage, createApp, initialState, onRenderSuccess }) {
  initialState = initialState || {};
  return new Promise((resolve, reject) => {
    match({
      routes,
      location: url,
    }, async (err, redirectLocation, renderProps) => {
      if (err) {
        resolve({ code: 500, url, env, error: err });
      } else if (redirectLocation) {
        resolve({ code: 302, url, env, redirect: redirectLocation.pathname + redirectLocation.search });
      } else if (renderProps) {
        try {
          const pathname = renderProps.location.pathname;
          const state = merge({}, initialState, {
            ssr: {
              env,
            }
          });
          const fragment = await renderFragment(createApp, renderProps, state);
          const html = await renderFullPage(fragment);
          if (onRenderSuccess) {
            await onRenderSuccess({ html, url, env, state: fragment.state })
          }
          resolve({ code: 200, url, env, html });
        } catch (e) {
          console.error(e);
          resolve({ code: 500, url, env, error: err });
        }
      } else {
        resolve({ code: 404, url, env });
      }
    });

  });
};

async function renderFragment(createApp, renderProps, initialState) {
  const history = createMemoryHistory();
  const id = uid(10);
  const app = createApp({
    history,
    initialState,
  }, id);
  if (!existSSRModel(app)) {
    app.model(ssrModel);
  }
  const asyncActions = getAsyncActions(app);
  const sync = renderProps.routes[1].sync;
  if (!sync && asyncActions && asyncActions.length > 0) {
    app.use(dvaServerSync(id, action => {
      if (asyncActions.indexOf(action.type) > -1) {
        return true;
      }
      return false;
    }, block));
    const appDOM = app.start()({ renderProps });
    history.push(renderProps.location.pathname);
    let html = renderToStaticMarkup(appDOM);
    return await new Promise((resolve, reject) => {
      block.wait(id, () => {
        const curState = appDOM.props.store.getState();
        html = renderToStaticMarkup(appDOM);
        resolve({ html, state: curState });
      });
    });
  } else {
    const appDOM = app.start()({ renderProps });
    history.push(renderProps.location.pathname);
    const html = renderToStaticMarkup(appDOM);
    const curState = appDOM.props.store.getState();
    return { html, state: curState };
  }
}

function existSSRModel(app) {
  try {
    let model = null;
    app._models.forEach((m) => {
      if (m.namespace === 'ssr') {
        model = m;
      }
    })
    return !!model;
  } catch(e) {
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
    })
    return actions;
  } catch (e) {
    return []
  }
}