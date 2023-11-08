// PreprocessorState loads and holds state for preprocessor.
export default class PreprocessorState {
	constructor() {
		this._reloadRequired = true
		this._tokenFile = null
		this._options = {}
		this._tokenMaps = []
	}

	outOfDate() {
		this._reloadRequired = true
		return this
	}

	setOptions(options) {
		this._options = options
		return this
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

	async apply(f) {
		if (this._reloadRequired) {
			await this._reloadTokenMaps()
		}

		return f(this._tokenMaps, this._options)
	}

	_reloadTokenMaps() {
		// Note that this causes a tiny memory leak per reload that accumaltes over
		// time. There's nothing we can do about it at the moment because modules
		// aren't supposed to change once imported.
		//
		// However, the leak should be miniscule per reload unless you've got a
		// huge dataset inside of your token file. In the extremely unlikely
		// event that your development machine goes OOM during an extra long
		// programming session you can just restart dev mode; that or close a
		// Chrome tab.
		//
		// Unfortunately, the files the token file depend on probably won't be
		// reimported. I've solved half the problem and that's good enough for 80%
		// of development.
		//
		// TODO: Try using a worker:
		//       https://github.com/nodejs/help/issues/1399#issuecomment-1007130183
		const modulePath = `${this._tokenFile}?cache_id=${Date.now()}`

		return import(modulePath).then((m) => {
			this._tokenMaps = m.default
			this._reloadRequired = false
			return this._tokenMaps
		})
	}
}
