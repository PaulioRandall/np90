function isObject(v) {
	return typeof v === 'object' && !Array.isArray(v) && v !== null
}

// Resolver resolves token paths into token values.
export default class Resolver {
	constructor(...mappings) {
		this._mappings = mappings
	}

	resolve(tokenPath, args = []) {
		const value = this._lookup(tokenPath)
		return this._stringify(value, args)
	}

	_lookup(tokenPath) {
		for (const m of this._mappings) {
			const tokenValue = this._findToken(m, tokenPath)
			if (tokenValue !== undefined) {
				return tokenValue
			}
		}

		throw new Error(`Unable to find token: '${tokenPath}'.`)
	}

	_findToken(mapping, tokenPath) {
		let value = mapping

		for (const node of tokenPath) {
			if (!isObject(value)) {
				return undefined
			}

			value = value[node]
		}

		return value
	}

	// For most types the value is simply stringified. But functions must be
	// invoked to acquire the real value which is then stringified.
	_stringify(tokenValue, args = []) {
		const type = this._identifyType(tokenValue)

		switch (type) {
			case 'null':
				tokenValue = ''
				break

			case 'string':
			case 'number':
			case 'bigint':
			case 'boolean':
				tokenValue = tokenValue.toString()
				break

			case 'array':
				tokenValue = tokenValue.join(',')
				break

			case 'function':
				tokenValue = this._invokeFunction(tokenValue, args)
				break

			default:
				throw new Error(`Type unsupported: '${type}'.`)
		}

		return tokenValue
	}

	// For the most part, the name matches the JavaScript type but nulls and arrays
	// return 'null' and 'array' respectively to differentiate themselves from
	// objects and each other.
	_identifyType(tokenValue) {
		if (tokenValue === null) {
			return 'null'
		}

		if (Array.isArray(tokenValue)) {
			return 'array'
		}

		return typeof tokenValue
	}

	_invokeFunction(func, args) {
		const stringyTypes = ['string', 'number', 'bigint', 'boolean', 'array']
		const value = func(...args)
		const type = this._identifyType(value)

		if (stringyTypes.includes(type)) {
			return value
		}

		if (type === 'function') {
			throw new Error('Returning a function from a function is not allowed.')
		}

		return this._stringify(value)
	}
}
