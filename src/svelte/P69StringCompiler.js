import { replaceAll as p90 } from '../p90/p90.js'

// TODO: Doesn;t need to be a class

// P69StringCompiler does what it says. It compiles P69 strings into CSS files.
export class P69StringCompiler {
	constructor() {
		this._tokenMaps = []
		this._options = {}
	}

	setTokenMaps(tokenMaps) {
		this._tokenMaps = tokenMaps
		return this
	}

	setOptions(options) {
		this._options = options
		return this
	}

	updateOptions(options) {
		this._options = {
			...this._options,
			...options,
		}

		return this
	}

	async compile(s) {
		return await p90(this._tokenMaps, s, this._options)
	}
}
