import { scanAll } from './scanner/scanner.js'
import { lookup } from './lookup/lookup.js'
import { resolve, identifyType } from './resolve/resolve.js'

export const replaceAll = (valueMaps, content, userOptions = {}) => {
	const options = getOptions(userOptions)

	if (!Array.isArray(valueMaps)) {
		valueMaps = [valueMaps]
	}

	content = content.normalize('NFC')
	return replaceAllTokens(valueMaps, content, options)
}

const getOptions = (userOptions) => {
	return {
		prefix: '$',
		stdout: console.log,
		stderr: console.error,
		throwOnError: false,
		printErrors: true,
		errorNote: '¯\\_(ツ)_/¯', // Filename usually
		...userOptions,
	}
}

const replaceAllTokens = (valueMaps, content, options) => {
	const tokens = scanAll(content, options.prefix)

	// Work from back to front of the content string otherwise replacements at
	// the start will cause later tokens to hold the wrong start & end indexes.
	tokens.reverse()

	for (const tk of tokens) {
		try {
			content = replaceToken(valueMaps, content, tk)
		} catch (e) {
			handleError(e, tk, options)
		}
	}

	return content
}

const replaceToken = (valueMaps, content, tk) => {
	let value = lookup(valueMaps, tk.path)

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
	if (options.printErrors) {
		const tkStr = JSON.stringify(tk, null, 2)

		options.stderr(`P90 error: ${options.errorNote}`)
		options.stdout(`P90 token: ${tkStr}`)
		options.stderr(e)
	}

	if (options.throwOnError) {
		throw e
	}
}
