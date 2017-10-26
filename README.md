## express-dva-ssr

dva server side render middleware for express

support `dva@2.0.0` `react-router@4.x`

`react` `isomorphism` `dva`

## Demo

[dva-example-user-dashboard-ssr](https://github.com/alexayan/dva-example-user-dashboard-ssr)

## requirement

`dva@2.0.0` `react-router@4.x`

## Install

``` bash
$ npm install express-dva-ssr --save

```
## Usage

### options

Option | Type | Require | Description
:--- | :---: | :---: | :--- 
routes | ReactElement | yes | react-router routes
createApp | options:Object => app:DvaApp | yes | function init Dva App and return it
renderFullPage | {html:String, state:Object} => fullHtml:String | yes | use html fragment and state into a complete html page
initialState | Object | no | custom initialState for render
onRenderSuccess | ({ html:String, url:String, env:Object, state:Object}) => void | no | a hook to add custom cache logic
interval | Number | no | used in preSSRService with default 10000

### inject ssr model

Used to distinguish whether the mobile or pc

`ssr: { env: { platform: 'pc' } }`

### route sync property

If you are sure that the rendering of the page does not depend on the asynchronous operation, please provide the `sync` property on `<Route>` definition

`<Route path="/" sync component={Index} />`

### render on request

``` node
import ssr from 'express-dva-ssr';

......

const routes = (
  <div>
  	<Route path="/" sync component={Index} />
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
	initialState: {},
	renderFullPage: renderFullPage,
	onRenderSuccess: onRenderSuccess
}));

......


```

### Pre-rendering

```node
import ssr from 'express-dva-ssr';

ssr.preSSRService({
	interval: 10000,
	routes: routes,
	createApp: createApp,
	initialState: {},
	renderFullPage: renderFullPage,
	onRenderSuccess: onRenderSuccess
})

```

### Example

[Pre-rendering](https://readhub.me/)

[render on request](https://readhub.me/topic/2TbaNZPwbxM)



