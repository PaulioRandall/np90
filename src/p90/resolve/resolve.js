const implicitTypes = ['string', 'number', 'bigint', 'boolean', 'array']

export const resolve = (value, args = []) => {
	let type = identifyType(value)

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

export const identifyType = (value) => {
	if (value === undefined) {
		return 'undefined'
	}

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
			"To avoid inifinite recursion, you can't return a function from a function."
		)
	}

	return resolve(value)
}
