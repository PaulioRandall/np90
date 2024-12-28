// Tokens represents a nested mapping of token names to values with a function
// for resolving a value given an object path and, if the value is a function,
// optional function arguments.
export default class Tokens {
	constructor(mappings) {
		this._mappings = mappings
	}

	resolve(pathToToken, funcArgs = []) {
		const value = lookup(this._mappings, pathToToken)
		return convert(value, funcArgs)
	}
}

function lookup(mappings, pathToToken) {
	let value = mappings

	for (const node of pathToToken) {
		if (!isObject(value)) {
			throw new Error(`Unable to find token: '${pathToToken}'.`)
		}

		value = value[node]
	}

	return value
}

function isObject(v) {
	return typeof v === 'object' && !Array.isArray(v) && v !== null
}

// For most types the value is simply stringified. But functions must be
// invoked to acquire the real value which is then stringified.
function convert(value, args = []) {
	const type = identifyType(value)

	switch (type) {
		case 'null':
			value = ''
			break

		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
			value = value.toString()
			break

		case 'array':
			value = value.join(',')
			break

		case 'function':
			value = invokeFunction(value, args)
			break

		default:
			throw new Error(`Type unsupported: '${type}'.`)
	}

	return value
}

// For the most part, the name matches the JavaScript type but nulls and arrays
// return 'null' and 'array' respectively to differentiate themselves from
// objects and each other.
function identifyType(value) {
	if (value === null) {
		return 'null'
	}

	if (Array.isArray(value)) {
		return 'array'
	}

	return typeof value
}

function invokeFunction(func, args) {
	const stringyTypes = ['string', 'number', 'bigint', 'boolean', 'array']
	const value = func(...args)
	const type = identifyType(value)

	if (stringyTypes.includes(type)) {
		return value
	}

	if (type === 'function') {
		throw new Error('Returning a function from a function is not allowed.')
	}

	return convert(value)
}
