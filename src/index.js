
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
		let isError;
		let nextInput = input;
		const { middlewares } = props.get(this);

		return new Promise(async (resolve, reject) => {
			for (let i = 0; i < middlewares.length; i++) {
				const { isCatch, middleware } = middlewares[i];

				// Only allow appropriate middlewares to run
				// (catch for errors, use for normal state)
				if (isError !== isCatch) {
					continue;
				}

				try {
					isError = false;
					nextInput = await middleware(input);

					if (nextInput == null) {
						break;
					}
				}

				catch (error) {
					isError = true;
					nextInput = Object.assign(nextInput || { }, { error });
				}
			}

			if (isError) {
				reject(nextInput);
			}
			else {
				resolve(nextInput);
			}
		});
	}
}
