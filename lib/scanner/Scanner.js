import RuneReader from './RuneReader.js'

// Scanner is an iterator class for scanning tokens within .p69 files.
export default class Scanner {
	constructor(p69_css) {
		this._rr = new RuneReader(p69_css)

		this._prefix = '$'
		this._escapedPrefix = this._escapeForRegex(this._prefix)
		this._prefixRegex = new RegExp(this._escapedPrefix)
	}

	_escapeForRegex = (s) => {
		return s.replace(/[/\-\.\(\)\[\]\$\^\&\\]/g, '\\$&')
	}

	// NAME := { *alpha-numeric* | "_" | "-" | "." | "$" }
	_scanName() {
		return this._rr.readWhile(/[a-zA-Z0-9_\-\.\$]/)
	}

	// PARAMS := [ "(" ARGS ")" ]
	_scanParams(name) {
		const bookmark = this._rr.makeBookmark()

		this._rr.skipSpaces()
		if (!this._rr.accept(/\(/)) {
			this._rr.gotoBookmark(bookmark)
			return []
		}

		this._rr.skipSpaces()
		if (this._rr.accept(/\)/)) {
			return []
		}

		const args = this._scanArgs(name)
		this._rr.expect(/\)/)

		return args
	}

	// ARGS := [ ARG { "," ARG } ]
	_scanArgs(name) {
		const args = []

		while (true) {
			const arg = this._scanArg(name)
			args.push(arg)

			this._rr.skipSpaces()
			if (!this._rr.accept(/,/)) {
				break
			}
		}

		return args
	}

	// ARG := '"' { *any rune except '"' OR '\'* | '\"' | '\\' } '"'
	// ARG := "'" { *any rune except "'" OR "\"* | "\'" | "\\" } "'"
	// ARG := { *any rune except "\"* | "\\" }
	_scanArg(name) {
		this._rr.skipSpaces()

		const delim = this._rr.accept(/["']/)
		let arg = ''

		if (delim) {
			arg = this._scanQuotedArg(delim, name)
		} else {
			arg = this._rr.readWhile(/[^,)]/)
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

		while (!this._rr.isEmpty()) {
			result += this._rr.readWhile(readingArg)

			const termintor = this._rr.accept(terminatingDelim)

			if (termintor && !escaped) {
				return result
			}

			if (termintor && escaped) {
				result += termintor
				escaped = false
				continue
			}

			const backSlash = this._rr.accept(/\\/)

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
		return this._rr.accept(/\s/) || ''
	}

	// nextToken scans and returns the next token or null if the end of file
	// reached.
	nextToken() {
		if (!this._rr.seek(this._prefixRegex)) {
			return null
		}

		const start = this._rr.makeBookmark()
		this._rr.read() // skip prefix

		const name = this._scanName()
		const args = this._scanParams(name)
		const suffix = this._scanSuffix()
		const end = this._rr.makeBookmark()

		return {
			start: start.cpIdx,
			end: end.cpIdx,
			raw: this._rr.slice(start.runeIdx, end.runeIdx),
			suffix: suffix,
			path: name.split('.'),
			args: args,
		}
	}

	// scanAll is convenience function returning all tokens, in order of
	// appearence,
	static scanAll(p69_css) {
		const sc = new Scanner(p69_css)
		const result = []

		let tk = null
		while ((tk = sc.nextToken())) {
			result.push(tk)
		}

		return result
	}
}
