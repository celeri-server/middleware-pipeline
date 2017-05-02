
const props = new WeakMap();

export class MiddlewarePipeline {
	constructor() {
		props.set(this, {
			middlewares: [ ]
		});
	}

	use(middleware) {
		props.get(this).middlewares.push({ middleware, isCatch: false });
		return this;
	}

	catch(middleware) {
		props.get(this).middlewares.push({ middleware, isCatch: true });
		return this;
	}

	run(input) {
		let error;
		const { middlewares } = props.get(this);

		return new Promise(async (resolve, reject) => {
			for (let i = 0; i < middlewares.length; i++) {
				const { isCatch, middleware } = middlewares[i];

				// Only allow appropriate middlewares to run
				// (catch for errors, use for normal state)
				if (! error === isCatch) {
					continue;
				}

				try {
					if (error) {
						await middleware(Object.assign({ }, input, { error }));
						error = null;
					}
				}

				catch (err) {
					error = err;
				}
			}

			if (error) {
				reject(error);
			}
			else {
				resolve();
			}
		});
	}
}
