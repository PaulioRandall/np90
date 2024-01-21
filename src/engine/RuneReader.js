// RuneReader is a class for reading a string, rune by rune, using regular
// expressions.
//
// A rune (AKA symbol), terminology borrowed from the Go programming language,
// is a alias for a unicode symbol. JavaScript engines all use UTF-16 (AFAIK)
// meaning symbols may be composed of either one or two code points. Functions
// in this file assume the input string is well formed UTF-16.
//
// This implementation works on runes but keeps a track of code points
// because that's what the users will need for manipulating JavaScript strings.
//
// RuneReader acts as an iterator with various query and read operations.
export default class RuneReader {
	constructor(s) {
		this._runes = Array.from(s)
		this._len = this._runes.length

		// These indexes need to be incremented together so always use the
		// increment function; never increment manually!

		// Tracks index in the rune array (AKA symbol index).
		//
		// Use this index when with RuneReader functions.
		this._runeIdx = 0

		// Tracks code point index in the CSS string.
		//
		// Use this index when with standard JavaScript string functions.
		this._cpIdx = 0

		return this
	}

	// runeIndex returns the rune (symbol) index.
	runeIndex() {
		return this._runeIdx
	}

	// codePointIndex returns the code point index.
	codePointIndex() {
		return this._cpIdx
	}

	// reset doesn't need explanation.
	reset() {
		this._runeIdx = 0
		this._cpIdx = 0
	}

	// isEmpty doesn't need explanation.
	isEmpty() {
		return this._runeIdx >= this._len
	}

	// increment the indexes ensuring cpIdx is incremented twice for surrogate
	// pairs.
	increment() {
		const cp = this._runes[this._runeIdx].codePointAt(0)

		this._runeIdx++
		this._cpIdx++

		const hasTwoCodePoints = cp >= 0x10000
		if (hasTwoCodePoints) {
			this._cpIdx++
		}
	}

	// haveEnough returns true if there is at least n unread runes.
	haveEnough(n) {
		return this._runeIdx + n <= this._len
	}

	// match returns true if there is a regex match on the next rune.
	match(regex) {
		return !this.isEmpty() && this._runes[this._runeIdx].match(regex)
	}

	// slice returns a sub string using absolute indexes. It's interface is
	// identical to Array.slice.
	//
	// Using absolute indexes means it works on the whole string; ignoring the
	// iterator aspect of the scanner.
	//
	// It's intended for slicing parts of the string that have been iterated.
	slice(start, end) {
		return this._runes.slice(start, end).join('')
	}

	// makeBookmark returns the indexes as an array. Pass them to gotoBookmark
	// to jump back to a bookmarked location.
	//
	// Do not manually modify the bookmark!!
	makeBookmark() {
		return {
			runeIdx: this._runeIdx,
			cpIdx: this._cpIdx,
		}
	}

	// gotoBookmark jumps to a bookmarked location. Only use bookmarks created
	// by makeBookmark.
	//
	// Never use a manually modified bookmarks!!
	gotoBookmark(bookmark) {
		this._runeIdx = bookmark.runeIdx
		this._cpIdx = bookmark.cpIdx
	}

	// seek advances the iterator until a rune matches the regex.
	seek(regex) {
		while (this._runeIdx < this._len) {
			if (this._runes[this._runeIdx].match(regex)) {
				return true
			}
			this.increment()
		}
		return false
	}

	// read returns the next rune; incrementing the index.
	read() {
		if (this.isEmpty()) {
			throw new Error(`Can't read because EOF`)
		}

		const ru = this._runes[this._runeIdx]
		this.increment()
		return ru
	}

	// accept reads and returns the next rune if there is a regex match. Null is
	// returned otherwise.
	accept(regex) {
		return this.match(regex) ? this.read() : null
	}

	// expect reads and returns the next rune if there is a regex match. An error
	// is thrown otherwise.
	expect(regex) {
		const ru = this.accept(regex)
		if (ru === null) {
			const got = this.isEmpty() ? 'EOF' : this._runes[this._runeIdx]
			throw new Error(`Expected ${regex} but got ${got}`)
		}
		return ru
	}

	// readWhile reads runes until the regex fails to match; returns the matched
	// runes as a sub string.
	readWhile(regex) {
		const result = []
		while (this.match(regex)) {
			result.push(this._runes[this._runeIdx])
			this.increment()
		}
		return result.join('')
	}

	// skipSpaces reads until a non-whitespace rune or EOF is encountered.
	skipSpaces() {
		return this.readWhile(/\s/)
	}
}
