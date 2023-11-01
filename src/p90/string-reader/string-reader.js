// newStringReader creates an object with functions for reading a string,
// rune by rune, using regular expressions.
//
// A rune (AKA symbol), terminology borrowed from the Go programming language,
// is a alias for a unicode symbol. JavaScript engines all use UTF-16 (AFAIK)
// meaning symbols may be composed of either one or two code points. Functions
// in this file assume the input string is well formed UTF-16.
//
// This implementation works on runes but keeps a track of code points
// because that's what the reader's users will need for manipulating
// JavaScript strings.
//
// The reader acts as an iterator with various query and read operations.
export const newStringReader = (s) => {
	const runes = Array.from(s)
	const len = runes.length

	// These indexes need to be incremented together so always use the
	// increment function; never increment manually!

	// Tracks index in the rune array (AKA symbol index).
	//
	// Use this index when with StringReader functions.
	let runeIdx = 0

	// Tracks code point index in the CSS string.
	//
	// Use this index when with standard JavaScript string functions.
	let cpIdx = 0

	// runeIndex returns the rune (symbol) index.
	const runeIndex = () => runeIdx

	// codePointIndex returns the code point index.
	const codePointIndex = () => cpIdx

	// reset doesn't need explanation.
	const reset = () => {
		runeIdx = 0
		cpIdx = 0
	}

	// isEmpty doesn't need explanation.
	const isEmpty = () => runeIdx >= len

	// increment the indexes ensuring cpIdx is incremented twice for surrogate
	// pairs.
	const increment = () => {
		const cp = runes[runeIdx].codePointAt(0)

		runeIdx++
		cpIdx++

		const hasTwoCodePoints = cp >= 0x10000
		if (hasTwoCodePoints) {
			cpIdx++
		}
	}

	// haveEnough returns true if there is at least n unread runes.
	const haveEnough = (n) => runeIdx + n <= len

	// match returns true if there is a regex match on the next rune.
	const match = (regex) => !isEmpty() && runes[runeIdx].match(regex)

	// slice returns a sub string using absolute indexes. It's interface is
	// identical to Array.slice.
	//
	// Using absolute indexes means it works on the whole string; ignoring the
	// iterator aspect of the scanner.
	//
	// It's intended for slicing parts of the string that have been iterated.
	const slice = (start, end) => {
		return runes.slice(start, end).join('')
	}

	// makeBookmark returns the indexes as an array. Pass them to gotoBookmark
	// to jump back to a bookmarked location.
	//
	// Do not manually modify the bookmark!!
	const makeBookmark = () => {
		return [runeIdx, cpIdx]
	}

	// gotoBookmark jumps to a bookmarked location. Only use bookmarks created
	// by makeBookmark.
	//
	// Never use a manually modified bookmarks!!
	const gotoBookmark = (bookmark) => {
		runeIdx = bookmark[0]
		cpIdx = bookmark[1]
	}

	// seek advances the iterator until a rune matches the regex.
	const seek = (regex) => {
		while (runeIdx < len) {
			if (runes[runeIdx].match(regex)) {
				return true
			}
			increment()
		}
		return false
	}

	// read returns the next rune; incrementing the index.
	const read = () => {
		if (isEmpty()) {
			throw new Error(`Can't read because EOF`)
		}

		const ru = runes[runeIdx]
		increment()
		return ru
	}

	// accept reads and returns the next rune if there is a regex match. Null is
	// returned otherwise.
	const accept = (regex) => {
		return match(regex) ? read() : null
	}

	// expect reads and returns the next rune if there is a regex match. An error
	// is thrown otherwise.
	const expect = (regex) => {
		const ru = accept(regex)
		if (ru === null) {
			const got = isEmpty() ? 'EOF' : runes[runeIdx]
			throw new Error(`Expected ${regex} but got ${got}`)
		}
		return ru
	}

	// readWhile reads runes until the regex fails to match; returns the matched
	// runes as a sub string.
	const readWhile = (regex) => {
		const result = []
		while (match(regex)) {
			result.push(runes[runeIdx])
			increment()
		}
		return result.join('')
	}

	// skipSpaces reads until a non-whitespace rune or EOF is encountered.
	const skipSpaces = () => readWhile(/\s/)

	return {
		runeIndex,
		codePointIndex,
		reset,
		isEmpty,
		haveEnough,
		match,
		slice,
		makeBookmark,
		gotoBookmark,
		seek,
		read,
		accept,
		expect,
		readWhile,
		skipSpaces,
	}
}
