## express-dva-ssr

dva server side render middleware for express

`react` `isomorphism` `dva`

## Install

``` bash
$ npm install express-dva-ssr

```
## Usage

### render on request

``` node
import ssr from 'express-dva-ssr';

......

const routes = (
  <div>
    <Route path="/topic/:id" component={TopicDetail} />
  </div>
);

function createApp(options) {
	const app = dva(opts);
	
	... // config
	
	return app
}

function renderFullPage({state, html}) {
	// build complete html page use html and state
}

function onRenderSuccess({ html, url, env }) {
	// add custom cache logic
}

app.use(ssr.runtimeSSRMiddle({
	routes: routes,
	createApp: createApp,
	initialState: {}, // custom initialState
	asyncActions: ['topic/fetchTopic', ...], // async actions in dva
	renderFullPage: renderFullPage,
	onRenderSuccess: onRenderSuccess
}));

......


```

### Pre-rendering

```node
import ssr from 'express-dva-ssr';

ssr.preSSRService({
	interval: 10000, // render interval
	routes: routes,
	createApp: createApp,
	initialState: {}, // custom initialState
	asyncActions: ['topic/fetchTopic', ...], // async actions in dva
	renderFullPage: renderFullPage,
	onRenderSuccess: onRenderSuccess
})

```

### Example

[Pre-rendering](https://readhub.me/)

[render on request](https://readhub.me/topic/2TbaNZPwbxM)



