import Render from './render';
import { createRoutes } from 'dva/router';

export default function preSSRService({ routes, renderFullPage, createApp, initialState, asyncActions, interval = 10000 }) {
  const paths = getPathsFromRoutes(routes);
  paths.forEach(path => {
    new RenderService({
      url: path,
      interval,
      renderOptions: {
        url: path,
        routes,
        renderFullPage,
        createApp,
        initialState,
        asyncActions,
        env: {
          platform: 'pc'
        }
      },
    }).run();
    new RenderService({
      url: path,
      interval,
      renderOptions: {
        url: path,
        routes,
        renderFullPage,
        createApp,
        initialState,
        asyncActions,
        env: {
          platform: 'mobile'
        }
      },
    }).run();
  });
}

function isArray(element) {
  return Object.prototype.toString.call(element) === '[object Array]';
}

function getPathsFromRoutes(routes) {
  function searchPaths(routes, paths) {
    if (isArray(routes)) {
      routes.forEach(route => {
        searchPaths(route, paths);
      });
    }
    if (typeof routes === 'object' && routes.childRoutes) {
      routes.childRoutes.forEach(route => {
        searchPaths(route, paths);
      });
    }
    if (typeof routes === 'object' && routes.path) {
      paths.push(routes.path);
    }
  }
  routes = createRoutes(routes);
  const paths = [];
  searchPaths(routes, paths);
  return paths;
}

export class RenderService {
  constructor({ url, interval, renderOptions }) {
    this.url = url;
    this.timeout = interval;
    this.renderOptions = renderOptions;
  }

  async render() {
    await Render(this.renderOptions);
    this.timer = setTimeout(this.run.bind(this), this.timeout);
  }

  run() {
    this.render();
  }

  stop() {
    this.timer && clearTimeout(this.timer);
  }
}
