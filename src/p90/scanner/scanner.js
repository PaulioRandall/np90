import { newStringReader } from '../string-reader/string-reader.js'

const escapeForRegex = (s) => {
	return s.replace(/[/\-\.\(\)\[\]\$\^\&\\]/g, '\\$&')
}

export const scanAll = (content, prefix) => {
	const f = scanFunc(content, prefix)
	const result = []
	let tk = null

	while ((tk = f()) !== null) {
		result.push(tk)
	}

	return result
}

export const scanFunc = (content, prefix) => {
	const sr = newStringReader(content)
	const escapedPrefix = escapeForRegex(prefix)
	const prefixRegex = new RegExp(escapedPrefix)

	const scanTokenFunc = () => {
		if (!sr.seek(prefixRegex)) {
			return null
		}

		const [start, startCp] = sr.makeBookmark()

		const startRune = sr.read()
		if (sr.accept(prefixRegex)) {
			const suffix = scanSuffix()
			const [end, endCp] = sr.makeBookmark()

			return {
				start: startCp,
				end: endCp,
				raw: sr.slice(start, end),
				suffix: suffix,
				path: [prefix],
				args: [],
			}
		}

		const name = scanName()
		const args = scanParams(name)
		const suffix = scanSuffix()

		const [end, endCp] = sr.makeBookmark()

		return {
			start: startCp,
			end: endCp,
			raw: sr.slice(start, end),
			suffix: suffix,
			path: name.split('.'),
			args: args,
		}
	}

	// NAME := { *alpha-numeric* | "_" | "-" | "." | "$" }
	const scanName = () => {
		return sr.readWhile(/[a-zA-Z0-9_\-\.\$]/)
	}

	// PARAMS := [ "(" ARGS ")" ]
	const scanParams = (name) => {
		const bookmark = sr.makeBookmark()

		sr.skipSpaces()
		if (!sr.accept(/\(/)) {
			sr.gotoBookmark(bookmark)
			return []
		}

		sr.skipSpaces()
		if (sr.accept(/\)/)) {
			return []
		}

		const args = scanArgs(name)
		sr.expect(/\)/)

		return args
	}

	// ARGS := [ ARG { "," ARG } ]
	const scanArgs = (name) => {
		const args = []

		while (true) {
			const arg = scanArg(name)
			args.push(arg)

			sr.skipSpaces()
			if (!sr.accept(/,/)) {
				break
			}
		}

		return args
	}

	// ARG := '"' { *any rune except '"' OR '\'* | '\"' | '\\' } '"'
	// ARG := "'" { *any rune except "'" OR "\"* | "\'" | "\\" } "'"
	// ARG := { *any rune except "\"* | "\\" }
	const scanArg = (name) => {
		sr.skipSpaces()

		const delim = sr.accept(/["']/)
		let arg = ''

		if (delim) {
			arg = scanQuotedArg(delim, name)
		} else {
			arg = sr.readWhile(/[^,)]/)
			arg = arg === '' ? null : arg
		}

		if (arg === null) {
			throw new Error(`Missing argument for '${name}'`)
		}

		return arg
	}

	const scanQuotedArg = (delim, name) => {
		const readingArg = new RegExp(`[^\\\\${delim}]`)
		const terminatingDelim = new RegExp(delim)

		let result = ''
		let escaped = false

		while (!sr.isEmpty()) {
			result += sr.readWhile(readingArg)

			const termintor = sr.accept(terminatingDelim)

			if (termintor && !escaped) {
				return result
			}

			if (termintor && escaped) {
				result += termintor
				escaped = false
				continue
			}

			const backSlash = sr.accept(/\\/)

			if (backSlash && !escaped) {
				escaped = true
				continue
			}

			if (backSlash && escaped) {
				result += backSlash
				escaped = false
				continue
			}
		}

		throw new Error(`Unterminated string for argument of '${name}'`)
	}

	// SUFFIX := *white-space*
	const scanSuffix = () => {
		return sr.accept(/\s/) || ''
	}

	return scanTokenFunc
}
