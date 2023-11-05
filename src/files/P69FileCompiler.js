import { processFileTree } from '../files/files.js'

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

	async compile() {
		return await processFileTree(this._root, this._tokenMaps, this._options)
	}
}
