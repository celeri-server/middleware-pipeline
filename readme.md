
```bash
$ npm install --save @celeri/middleware-pipeline
```



### Import

#### ES6 Modules

```javascript
import { MiddlewarePipeline } from '@celeri/middleware-pipeline';
```

#### CommonJS Modules

```javascript
const { MiddlewarePipeline } = require('@celeri/middleware-pipeline');
```



### Usage

```javascript
const pipieline = new MiddlewarePipeline();

pipeline
	// Middlewares can be async functions to be awaited
	.use(async (url) => await httpGet(url))
	// Or they can be normal functions
	.use((body) => JSON.parse(body))
	// Error handling middleware can be placed with catch
	.catch({ error } => console.error(error))
	// A catch implies that the error was handled (unless it also throws),
	// so following middleware will still run
	.use(() => {
		// This runs regardless of whether the first two steps passed
	});

pipeline.run('http://www.example.com');
```
