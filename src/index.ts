
const props = new WeakMap();

export interface MiddlewareFunction<T> {
	(input: T): Promise<void>
}

export interface ErrorMiddlewareFunction<T> {
	(input: T & { error: Error }): Promise<void>
}

export class MiddlewarePipeline<T extends object> {
	constructor() {
		props.set(this, {
			middlewares: [ ]
		});
	}

	use(middleware: MiddlewareFunction<T>) : this {
		props.get(this).middlewares.push({ middleware, isCatch: false });
		return this;
	}

	catch(middleware: ErrorMiddlewareFunction<T>) : this {
		props.get(this).middlewares.push({ middleware, isCatch: true });
		return this;
	}

	run(input: T) : Promise<void> {
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
					else {
						await middleware(Object.assign({ }, input));
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
