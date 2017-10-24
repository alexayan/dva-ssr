import { matchPath } from 'react-router';

function isArray(element) {
  return Object.prototype.toString.call(element) === '[object Array]';
}

export function searchRoutes(r, callback) {
  function searchPaths(routes) {
    if (isArray(routes)) {
      routes.forEach((route) => {
        searchPaths(route);
      });
    }
    if (typeof routes === 'object' && routes.props && routes.props.children) {
      routes.props.children.forEach((route) => {
        searchPaths(route);
      });
    }
    if (typeof routes === 'object' && routes.props && routes.props.path) {
      callback(routes);
    }
  }
  searchPaths(r);
}


export function findRouteByUrl(routes, url) {
  const rtn = [];
  searchRoutes(routes, (route) => {
    const match = matchPath(url, route.props);
    if (match) {
      rtn.push(route);
    }
  });
  return rtn;
}
