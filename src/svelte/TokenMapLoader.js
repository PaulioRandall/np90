// TokenMapLoader does what it says. It loads and caches the token map or maps
// specified as default export in the passed JavaScript module file.
export class TokenMapLoader {
	constructor() {
		this._tokenFile = null
		this._tokenMaps = []
		this._dirty = false
	}

	setFile(tokenFile) {
		this._tokenFile = tokenFile
		this._dirty = true
		return this
	}

	dirty() {
		this._dirty = true
		return this
	}

	isDirty() {
		return this._dirty
	}

	get() {
		return this._tokenMaps
	}

	reload() {
		return import(this._tokenFile)
			.then((m) => {
				this._tokenMaps = m.default
				this._dirty = false
				return this._tokenMaps
			})
			.catch((e) => {
				console.error('Failed to reload token map')
				throw e
			})
	}
}
