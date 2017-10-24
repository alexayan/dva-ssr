'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dva = require('dva');

var _dva2 = _interopRequireDefault(_dva);

var _app = require('./models/app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createApp(opts) {
  const app = (0, _dva2.default)(opts);

  app.model(_app2.default);

  return app;
}

exports.default = createApp;