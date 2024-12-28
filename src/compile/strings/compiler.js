import Scanner from './scanner/Scanner.js'
import Tokens from './Tokens.js'
import { stdout, stderr } from '../writers.js'

export const p69StringToCss = (mappings, content, options = {}) => {
	options = getOptions(options)

	if (Array.isArray(mappings)) {
		throw new Error('Multiple mapping objects not yet supported')
	}

	const mapper = new Tokens(mappings)

	content = content.normalize('NFC')
	return replaceAllTokens(mapper, content, options)
}

const getOptions = (userOptions) => {
	return {
		onError: (e, tk, options) => {
			stderr('[P69] ', e)
			stdout('[P69] ', JSON.stringify(tk, null, 2))
		},
		...userOptions,
	}
}

const replaceAllTokens = (mapper, content, options) => {
	const tokens = Scanner.scanAll(content)

	// Work from back to front of the content string otherwise replacements at
	// the start will fuck up start & end indexes.
	tokens.reverse()

	for (const tk of tokens) {
		let tokenFound = false

		try {
			let value = mapper.resolve(tk.path, tk.args)
			value = appendSuffix(value, tk.suffix)
			content = replaceValue(content, value, tk.start, tk.end)
		} catch (e) {
			options.onError(e, tk, options)
		}
	}

	return content
}

const appendSuffix = (value, suffix) => {
	if (value === undefined || value === null) {
		return value
	}
	return value + suffix
}

const replaceValue = (content, value, start, end) => {
	const prefix = content.slice(0, start)
	const postfix = content.slice(end, content.length)
	return `${prefix}${value}${postfix}`
}
