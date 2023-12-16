import StringReader from './StringReader.js'

// Scanner is an iterator class for scanning tokens within .p69 files.
export default class Scanner {
	constructor(content) {
		this._sr = new StringReader(content)

		this._prefix = '$'
		this._escapedPrefix = this._escapeForRegex(this._prefix)
		this._prefixRegex = new RegExp(this._escapedPrefix)
	}

	_escapeForRegex = (s) => {
		return s.replace(/[/\-\.\(\)\[\]\$\^\&\\]/g, '\\$&')
	}

	// NAME := { *alpha-numeric* | "_" | "-" | "." | "$" }
	_scanName() {
		return this._sr.readWhile(/[a-zA-Z0-9_\-\.\$]/)
	}

	// PARAMS := [ "(" ARGS ")" ]
	_scanParams(name) {
		const bookmark = this._sr.makeBookmark()

		this._sr.skipSpaces()
		if (!this._sr.accept(/\(/)) {
			this._sr.gotoBookmark(bookmark)
			return []
		}

		this._sr.skipSpaces()
		if (this._sr.accept(/\)/)) {
			return []
		}

		const args = this._scanArgs(name)
		this._sr.expect(/\)/)

		return args
	}

	// ARGS := [ ARG { "," ARG } ]
	_scanArgs(name) {
		const args = []

		while (true) {
			const arg = this._scanArg(name)
			args.push(arg)

			this._sr.skipSpaces()
			if (!this._sr.accept(/,/)) {
				break
			}
		}

		return args
	}

	// ARG := '"' { *any rune except '"' OR '\'* | '\"' | '\\' } '"'
	// ARG := "'" { *any rune except "'" OR "\"* | "\'" | "\\" } "'"
	// ARG := { *any rune except "\"* | "\\" }
	_scanArg(name) {
		this._sr.skipSpaces()

		const delim = this._sr.accept(/["']/)
		let arg = ''

		if (delim) {
			arg = this._scanQuotedArg(delim, name)
		} else {
			arg = this._sr.readWhile(/[^,)]/)
			arg = arg === '' ? null : arg
		}

		if (arg === null) {
			throw new Error(`Missing argument for '${name}'`)
		}

		return arg
	}

	_scanQuotedArg(delim, name) {
		const readingArg = new RegExp(`[^\\\\${delim}]`)
		const terminatingDelim = new RegExp(delim)

		let result = ''
		let escaped = false

		while (!this._sr.isEmpty()) {
			result += this._sr.readWhile(readingArg)

			const termintor = this._sr.accept(terminatingDelim)

			if (termintor && !escaped) {
				return result
			}

			if (termintor && escaped) {
				result += termintor
				escaped = false
				continue
			}

			const backSlash = this._sr.accept(/\\/)

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
	_scanSuffix() {
		return this._sr.accept(/\s/) || ''
	}

	// nextToken scans and returns the next token or null if the end of file
	// reached.
	nextToken() {
		if (!this._sr.seek(this._prefixRegex)) {
			return null
		}

		const start = this._sr.makeBookmark()
		this._sr.read() // skip prefix

		const name = this._scanName()
		const args = this._scanParams(name)
		const suffix = this._scanSuffix()
		const end = this._sr.makeBookmark()

		return {
			start: start.cpIdx,
			end: end.cpIdx,
			raw: this._sr.slice(start.runeIdx, end.runeIdx),
			suffix: suffix,
			path: name.split('.'),
			args: args,
		}
	}
}

// scanAll is convenience function for scanning all tokens at once.
export const scanAll = (content) => {
	const sc = new Scanner(content)
	const result = []

	let tk = null
	while ((tk = sc.nextToken())) {
		result.push(tk)
	}

	return result
}
