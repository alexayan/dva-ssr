import { matchPath } from 'react-router';
import React from 'react';

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
      React.Children.forEach(routes.props.children, (route) => {
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
  const queryIndex = url.indexOf('?');
  if (queryIndex > -1) {
    url = url.slice(0, queryIndex);
  }
  if (url.length > 1 && url[url.length - 1] === '/') {
    url = url.slice(0, -1);
  }
  searchRoutes(routes, (route) => {
    const match = matchPath(url, route.props);
    if (match) {
      rtn.push(route);
    }
  });
  return rtn;
}
