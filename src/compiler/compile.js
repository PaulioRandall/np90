import Scanner from '../scanner/Scanner.js'
import Resolver from '../resolver/Resolver.js'
import compileOptions from './compile_options.js'

export default (mappings, cssWithTokens, options = {}) => {
	options = compileOptions(options)

	if (isObject(mappings)) {
		mappings = [mappings]
	}

	const resolver = new Resolver(...mappings)

	cssWithTokens = cssWithTokens.normalize('NFC')
	return replaceAllTokens(resolver, cssWithTokens, options)
}

const isObject = (v) => {
	return typeof v === 'object' && !Array.isArray(v) && v !== null
}

const replaceAllTokens = (resolver, cssWithTokens, options) => {
	const tokens = Scanner.scanAll(cssWithTokens)

	// Work from back to front of the content string otherwise replacements at
	// the start will fuck up start & end indexes.
	tokens.reverse()

	for (const tk of tokens) {
		let tokenFound = false

		try {
			let value = resolver.resolve(tk.path, tk.args)
			value = appendSuffix(value, tk.suffix)
			cssWithTokens = replaceValue(cssWithTokens, value, tk.start, tk.end)
		} catch (e) {
			options.onError(e, tk)
		}
	}

	return cssWithTokens
}

const appendSuffix = (value, suffix) => {
	if (value === undefined || value === null) {
		return value
	}
	return value + suffix
}

const replaceValue = (cssWithTokens, value, start, end) => {
	const prefix = cssWithTokens.slice(0, start)
	const postfix = cssWithTokens.slice(end, cssWithTokens.length)
	return `${prefix}${value}${postfix}`
}
