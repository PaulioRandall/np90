import { scanAll } from './Scanner.js'
import { lookup } from './lookup.js'
import { resolve, identifyType } from './resolve.js'
import { stdout, stderr } from '../shared/writers.js'

const replaceAll = (tokenMaps, content, userOptions = {}) => {
	const options = getOptions(userOptions)

	if (!Array.isArray(tokenMaps)) {
		tokenMaps = [tokenMaps]
	}

	content = content.normalize('NFC')
	return replaceAllTokens(tokenMaps, content, options)
}

const getOptions = (userOptions) => {
	return {
		throwOnError: false,
		errorNote: '¯\\_(ツ)_/¯', // Filename usually
		...userOptions,
	}
}

const replaceAllTokens = (tokenMaps, content, options) => {
	const tokens = scanAll(content)

	// Work from back to front of the content string otherwise replacements at
	// the start will cause later tokens to hold the wrong start & end indexes.
	tokens.reverse()

	for (const tk of tokens) {
		try {
			content = replaceToken(tokenMaps, content, tk)
		} catch (e) {
			handleError(e, tk, options)
		}
	}

	return content
}

const replaceToken = (tokenMaps, content, tk) => {
	let value = lookup(tokenMaps, tk.path)

	if (value === undefined) {
		return content
	}

	value = resolve(value, tk.args)
	value = appendSuffix(value, tk.suffix)

	return replaceValue(content, value, tk.start, tk.end)
}

const replaceValue = (content, value, start, end) => {
	const prefix = content.slice(0, start)
	const postfix = content.slice(end, content.length)
	return `${prefix}${value}${postfix}`
}

const appendSuffix = (value, suffix) => {
	const dontSuffix = value === undefined || value === null
	return dontSuffix ? value : value + suffix
}

const handleError = (e, tk, options) => {
	const tkStr = JSON.stringify(tk, null, 2)

	stderr(`P90 error: ${options.errorNote}`)
	stdout(`P90 token: ${tkStr}`)
	stderr(e)

	if (options.throwOnError) {
		throw e
	}
}

export default replaceAll
