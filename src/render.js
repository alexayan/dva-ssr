import { match, createMemoryHistory, Route, IndexRoute } from 'dva/router';
import merge from 'lodash.merge';
import uid from 'uid';
import dvaServerSync from './dvaServerSync';
import block from './block';
import { renderToStaticMarkup } from 'react-dom/server';

export default async function render({ url, env, routes, renderFullPage, createApp, initialState, asyncActions, onRenderSuccess }) {
  return new Promise((resolve, reject) => {
    try {
      match({
        routes,
        location: url,
      }, async (err, redirectLocation, renderProps) => {
        if (err) {
          resolve({ code: 500, url, env, error: err });
        } else if (redirectLocation) {
          resolve({ code: 302, url, env, redirect: redirectLocation.pathname + redirectLocation.search });
        } else if (renderProps) {
          const pathname = renderProps.location.pathname;
          const state = merge({}, initialState, {
            app: {
              SSR_ENV: env
            }
          });
          const fragment = await renderFragment(createApp, renderProps, state, asyncActions);
          const html = await renderFullPage(fragment);
          if (onRenderSuccess) {
            await onRenderSuccess({html, url, env})
          }
          resolve({ code: 200, url, env, html });
        } else {
          resolve({ code: 404, url, env });
        }
      });
    } catch (err) {
      resolve({ code: 500, url, env, error: err });
    }
  });
};

async function renderFragment(createApp, renderProps, initialState, asyncActions) {
  const history = createMemoryHistory();
  const id = uid(10);
  const app = createApp({
    history,
    initialState,
  }, id);
  app.use(dvaServerSync(id, action => {
    if (asyncActions.indexOf(action.type) > -1) {
      return true;
    }
    return false;
  }, block));
  const appDOM = app.start()({ renderProps });
  let html = renderToStaticMarkup(appDOM);
  return await new Promise((resolve, reject) => {
    block.wait(id, () => {
      const curState = appDOM.props.store.getState();
      html = renderToStaticMarkup(appDOM);
      resolve({ html, state: curState });
    });
  });
}
