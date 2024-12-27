import { scanAll } from '../scanner/Scanner.js'
import { lookup } from './lookup.js'
import { resolve, identifyType } from './resolve.js'
import { stdout, stderr } from '../shared/writers.js'

export const stringP69 = (tokenMaps, content, options = {}) => {
	options = getOptions(options)

	if (!Array.isArray(tokenMaps)) {
		tokenMaps = [tokenMaps]
	}

	content = content.normalize('NFC')
	return replaceAllTokens(tokenMaps, content, options)
}

const getOptions = (userOptions) => {
	return {
		ref: '¯\\_(ツ)_/¯',
		throwIfMissing: true,
		onError: (e, tk, options) => {
			if (options.ref) {
				stderr('[P69]', options.ref)
			}
			stderr('[P69]', e)
			stdout('[P69]', JSON.stringify(tk, null, 2))
		},
		...userOptions,
	}
}

const replaceAllTokens = (tokenMaps, content, options) => {
	const tokens = scanAll(content)

	// Work from back to front of the content string otherwise replacements at
	// the start will cause later tokens to hold the wrong start & end indexes.
	tokens.reverse()

	for (const tk of tokens) {
		let tokenFound = false

		try {
			;[content, tokenFound] = replaceToken(tokenMaps, content, tk)
		} catch (e) {
			options.onError(e, tk, options)
		}

		if (!tokenFound) {
			const e = new Error(`Missing or invalid token: ${tk.path.join('.')}`)
			options.onError(e, tk, options)

			if (options.throwIfMissing) {
				throw e
			}
		}
	}

	return content
}

const replaceToken = (tokenMaps, content, tk) => {
	let value = lookup(tokenMaps, tk.path)

	if (value === undefined) {
		return [content, false]
	}

	value = resolve(value, tk.args)
	value = appendSuffix(value, tk.suffix)

	content = replaceValue(content, value, tk.start, tk.end)
	return [content, true]
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
