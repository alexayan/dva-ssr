'use strict';

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

var _createApp = require('./createApp');

var _createApp2 = _interopRequireDefault(_createApp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ref = _jsx('div', {}, void 0, '/');

var _ref2 = _jsx('div', {}, void 0, '/news');

var _ref3 = _jsx('div', {}, void 0, '/tech');

var _ref4 = _jsx('div', {}, void 0, '/browser');

const routes = _jsx('div', {}, void 0, _jsx(_reactRouter.Route, {
  exact: true,
  sync: true,
  path: '/',
  render: () => _ref
}), _jsx(_reactRouter.Route, {
  exact: true,
  path: '/news',
  sync: true,
  render: () => _ref2
}), _jsx(_reactRouter.Route, {
  exact: true,
  path: '/tech',
  render: () => _ref3
}), _jsx(_reactRouter.Route, {
  exact: true,
  path: '/browser',
  render: () => _ref4
}));

function onRenderSuccess({ html, url, env }) {
  console.log(html, url, env);
}

_lib2.default.preSSRService({
  interval: 10000,
  routes,
  createApp: _createApp2.default,
  initialState: {
    app: {
      sizeMode: 'lg',
      globalMessages: [],
      ads: [],
      isWechatReady: false
    }
  },
  renderFullPage: html => html,
  onRenderSuccess
});