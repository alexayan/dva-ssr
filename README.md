# dva-ssr

![Build Status](https://img.shields.io/travis/alexayan/express-dva-ssr.svg)
![Coverage](https://img.shields.io/coveralls/alexayan/express-dva-ssr.svg)
![Downloads](https://img.shields.io/npm/dm/express-dva-ssr.svg)
![Downloads](https://img.shields.io/npm/dt/express-dva-ssr.svg)
![npm version](https://img.shields.io/npm/v/express-dva-ssr.svg)
![dependencies](https://img.shields.io/david/alexayan/dva-ssr.svg)
![dev dependencies](https://img.shields.io/david/dev/alexayan/dva-ssr.svg)
![License](https://img.shields.io/npm/l/express-dva-ssr.svg)

基于 [dva](https://github.com/dvajs/dva) 的服务器端渲染库。

特性：

- 无需添加额外的服务器端数据获取代码
- 最小化客户端与服务器端渲染的差异

## 依赖

`react@16.x` `react-router@4.x` `dva@2.x`

## 安装

``` bash
$ npm install express-dva-ssr --save
```

## API

### config(options: Object)

配置服务器端渲染参数

``` javascript
import ssr from 'express-dva-ssr';

ssr.config({
	timeout: 6 * 1000, // 等待异步操作的超时时间

	/**
	 * 异步操作超时后，是否终止渲染，并抛出异常
	 *
	 * true：忽略超时，停止等待异步操作，直接返回渲染结果
	 * false：终止渲染，并抛出异常，渲染失败
	 */
	ignoreTimeout: true,

	verbose: true, // console 输出日志

	staticMarkup: false, // 是否创建额外的DOM属性
});

```

### render(options: Object): Promise(RenderResult)

服务器端渲染核心函数

``` javascript
import ssr from 'express-dva-ssr';

const result:RenderResult = ssr.render({
	url: 'https://www.example.com/users/alexyan', // 需要渲染的路由

	/**
	 * 服务器端环境数据。
	 * 在服务器端会在 namespace 为 ssr 的 model 中注入
	 * 可以传入 http 请求中的 useragent 等请求相关信息，方便对渲染进行控制
	 *
	 * 注意!!!: 出于安全考虑，请不要传入服务器敏感信息
	 */
	env: { platform: 'mobile' },

	/**
	 * 配置初始化 state
	 */
	initialState: {

	},

	/**
	 * 初始化 dva app, 注册 model, 返回 dva 实例
   *
   * 如果指定 createApp, models 将不生效
	 */
	createApp: function(opts) {
		const app = dva(opts);
  		app.model(require('./models/app'));
  		app.model(require('./models/user'));
  		return app;
	},

	/**
	 * 配置 Routes, 参数详见 react-router
	 */
	routes: [<Route path="/" render={() => <div>/</div>} />,
		<Route path="/user" render={() => <div>/tech</div>} />
  ],

  /**
	 * 配置 models, 详见 dva model
	 */
	models: [
    Model
  ],

	/**
	 * 生成完整网页
	 *
	 * html: 服务器端渲染片段
	 * state: 渲染后的 state
	 * context: 服务器端渲染上下文
	 */
	renderFullPage: async ({html, state, context}) => {
		const ssrHtml = `
		  <div id="root">
		  ${html}
		  </div>
		  <script>
		  window.__INITIAL_STATE__ = ${JSON.stringify(state)};
		  </script>
		`;
		return indexHtml.replace(`<div id="root"></div>`, ssrHtml);
	}

	/**
	 * 完成最终渲染页面后调用，可以在这个阶段进行结果缓存等操作
	 *
	 * html: 服务器端渲结果
	 * url: 渲染路由
	 * state: 渲染后的 state
	 * env: 服务器端环境数据
	 */
	onRenderSuccess: async (html, url, env, state) => {

	}
});

```

### type RenderResult

服务器端渲染结果类型描述

``` javascript
{
	/**
	 * 渲染结果状态码
	 *
	 * 200: 渲染成功
	 * 404: 渲染失败，url 无法找到匹配的 route
	 * 500: 渲染失败
	 */
	code: 200,

	url: 'https://www.example.com/users/alexyan', // 渲染的路由

	env: {}, // 服务器端环境数据

	html: '<html></html>', // 服务器端渲染最终页面

	error: new Error('error') // 渲染异常，当 code 为 500 时存在
}
```

### runtimeSSRMiddle({routes, renderFullPage, createApp, initialState, onRenderSuccess})

返回 `Express` 中间件

> 参数介绍见 render() 函数

``` javascript
const exporesMiddleware = ssr.runtimeSSRMiddle({
  routes,
  createApp,
  renderFullPage,
  onRenderSuccess,
  initialState
});

const app = express();

app.use(exporesMiddleware);

```

### route sync property

设置 sync 强制跳过异步操作，直接进行渲染

`<Route path="/" sync component={Index} />`

## 写一个简单的服务器端渲染中间件

```
function runtimeSSRMiddle({
  routes, renderFullPage, createApp, initialState, onRenderSuccess
}) {
  return async (req, res, next) => {
    const result = await render({
      url: req.url,
      env: { ua: req.headers['user-agent'] },
      routes,
      renderFullPage,
      createApp,
      initialState,
      onRenderSuccess
    });
    switch (result.code) {
      case 200:
        return res.end(result.html);
      case 302:
        return res.redirect(302, result.redirect);
      case 404:
        next();
        break;
      case 500:
        next(result.error);
        break;
      default:
        next();
        break;
    }
  };
}
```

## DEMO

[dva-example-user-dashboard-ssr](https://github.com/alexayan/dva-example-user-dashboard-ssr)




