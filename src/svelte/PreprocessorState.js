// PreprocessorState loads and holds state for preprocessor.
export class PreprocessorState {
	constructor() {
		this._requireTokenMapReload = true
		this._options = {}
		this._tokenFile = null
		this._tokenMaps = []
	}

	setReloadRequired() {
		this._requireTokenMapReload = true
		return this
	}

	isReloadRequired() {
		return this._requireTokenMapReload
	}

	setOptions(options) {
		this._options = options
		return this
	}

	getOptions(extra = {}) {
		return {
			...this._options,
			...extra,
		}
	}

	getRoot() {
		return this._options.root
	}

	acceptsMimeType(lang) {
		return this._options.mimeTypes.includes(lang)
	}

	hasOutputFile() {
		return !!this._options.output
	}

	isFileProcessingEnabled() {
		return !!this._options.root
	}

	isFileWatchEnabled() {
		return !!this._options.root && !!this._options.watch
	}

	setTokenFile(tokenFile) {
		this._tokenFile = tokenFile
		return this
	}

	getTokenMaps() {
		return this._tokenMaps
	}

	reloadTokenMaps() {
		return import(this._tokenFile)
			.then((m) => {
				this._tokenMaps = m.default
				this._requireTokenMapReload = false
				return this
			})
			.catch((e) => {
				console.error('Failed to reload token map', e)
				return this
			})
	}
}
