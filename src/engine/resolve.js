const implicitTypes = ['string', 'number', 'bigint', 'boolean', 'array']

// resolve accepts a value sourced from a token map and returns a value ready
// for output.
//
// For most types the value is simply stringified. But functions must be
// invoked to acquire the real value which is then stringified.
export const resolve = (value, args = []) => {
	const type = identifyType(value)

	switch (type) {
		case 'null':
			value = ''
			break

		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'array':
			value = value.toString()
			break

		case 'function':
			value = invokeFunction(value, args)
			break

		default:
			throw new Error(`'${type}' type unsupported.`)
	}

	return value
}

// identifyType returns the name of the type of the value.
//
// For the most part the name matches the JavaScript type but nulls and arrays
// return 'null' and 'array' respectively to differentiate themselves from
// objects and each other.
export const identifyType = (value) => {
	if (value === null) {
		return 'null'
	}

	if (Array.isArray(value)) {
		return 'array'
	}

	return typeof value
}

const invokeFunction = (func, args) => {
	const value = func(...args)
	const type = identifyType(value)

	if (implicitTypes.includes(type)) {
		return value
	}

	if (type === 'function') {
		throw new Error(
			'Naughty! Returning a function from a function is not allowed.'
		)
	}

	return resolve(value)
}
