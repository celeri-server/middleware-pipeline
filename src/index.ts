
type Middleware<T extends object> = {
	middleware: MiddlewareFunction<T>,
	isCatch: false
} | {
	middleware: ErrorMiddlewareFunction<T>,
	isCatch: true
};

interface PrivateStorage<T extends object> {
	middlewares: Array<Middleware<T>>
}

export interface MiddlewareFunction<T> {
	(input: T): void | Promise<void>;
}

export interface ErrorMiddlewareFunction<T> {
	(input: T & { error: Error }): void | Promise<void>
}

const props: WeakMap<MiddlewarePipeline<any>, PrivateStorage<any>> = new WeakMap();

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
				const middleware = middlewares[i] as Middleware<T>;

				// Only allow appropriate middlewares to run
				// (catch for errors, use for normal state)
				if (! error === middleware.isCatch) {
					continue;
				}

				try {
					if (middleware.isCatch) {
						await middleware.middleware(Object.assign({ }, input, { error }));
						error = null;
					}

					else {
						await middleware.middleware(Object.assign({ }, input, { error: void 0 }));
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
