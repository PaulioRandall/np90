import { processFileTree, processFile } from '../files/files.js'

// TODO: Doesn't need to be a class

// P69FileCompiler does what it says. It compiles P69 files into CSS files.
export class P69FileCompiler {
	constructor() {
		this._tokenMaps = []
		this._root = '.'
		this._options = {}
	}

	setTokenMaps(tokenMaps) {
		this._tokenMaps = tokenMaps
		return this
	}

	setRoot(root) {
		this._root = root
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

	async compile(file = null) {
		if (!file || options.output) {
			return await processFileTree(this._root, this._tokenMaps, this._options)
		}

		return await processFile(file, this._tokenMaps, this._options)
	}
}
