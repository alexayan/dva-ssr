import Render from './render';
import { searchRoutes } from './utils';

function getPathsFromRoutes(routes) {
  const paths = [];
  searchRoutes(routes, (route) => {
    paths.push(route.props.path);
  });
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
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

export default function preSSRService({
  renderFullPage, createApp, initialState, interval = 10000, onRenderSuccess, routes, timeout=6000, verbose=true
}) {
  const paths = getPathsFromRoutes(routes);
  paths.forEach((path) => {
    new RenderService({
      url: path,
      interval,
      renderOptions: {
        routes,
        url: path,
        renderFullPage,
        createApp,
        initialState,
        onRenderSuccess,
        timeout,
        env: {
          platform: 'pc',
        },
        verbose
      },
    }).run();
    new RenderService({
      url: path,
      interval,
      renderOptions: {
        routes,
        url: path,
        renderFullPage,
        createApp,
        initialState,
        onRenderSuccess,
        timeout,
        env: {
          platform: 'mobile',
        },
        verbose
      },
    }).run();
  });
}
