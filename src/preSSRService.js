import Render from './render';
import { createMemoryHistory } from 'dva/router';

export default function preSSRService({ renderFullPage, createApp, initialState, interval = 10000, onRenderSuccess }) {
  const history = createMemoryHistory();
  const app = createApp({history, initialState});
  const paths = getPathsFromApp(app);
  paths.forEach(path => {
    new RenderService({
      url: path,
      interval,
      renderOptions: {
        url: path,
        renderFullPage,
        app,
        onRenderSuccess,
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
        renderFullPage,
        app,
        onRenderSuccess,
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

function getPathsFromRoutes(app) {
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
  routes = app._router();
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
    const res = await Render(this.renderOptions);
    this.timer = setTimeout(this.run.bind(this), this.timeout);
  }

  run() {
    this.render();
  }

  stop() {
    this.timer && clearTimeout(this.timer);
  }
}
