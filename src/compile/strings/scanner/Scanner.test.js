import Scanner from './Scanner.js'

const newToken = (start, end, raw, path = [], args = [], suffix = '') => {
	return {
		start,
		end,
		raw,
		suffix,
		path,
		args,
	}
}

describe('scanner.js', () => {
	test('given string with no tokens returns a function, which returns null', () => {
		const sc = new Scanner('abc')
		expect(sc.nextToken()).toEqual(null)
	})

	test('given multiple tokens, resolves all', () => {
		const sc = new Scanner('$abc;$efg;$hij')

		let exp = newToken(0, 4, '$abc', ['abc'])
		expect(sc.nextToken()).toEqual(exp)

		exp = newToken(5, 9, '$efg', ['efg'])
		expect(sc.nextToken()).toEqual(exp)

		exp = newToken(10, 14, '$hij', ['hij'])
		expect(sc.nextToken()).toEqual(exp)

		expect(sc.nextToken()).toEqual(null)
	})

	test('given multiple tokens between normal text, finds all tokens', () => {
		const given = 'color: $green; font-size: $lg; font-family: $nunito;'
		const sc = new Scanner(given)

		let exp = newToken(7, 13, '$green', ['green'])
		expect(sc.nextToken()).toEqual(exp)

		exp = newToken(26, 29, '$lg', ['lg'])
		expect(sc.nextToken()).toEqual(exp)

		exp = newToken(44, 51, '$nunito', ['nunito'])
		expect(sc.nextToken()).toEqual(exp)

		expect(sc.nextToken()).toEqual(null)
	})

	test('given token to nested value, finds token', () => {
		const sc = new Scanner('color: $color.green;')
		const exp = newToken(7, 19, '$color.green', ['color', 'green'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token to deep nested value, finds token', () => {
		const sc = new Scanner('color: $theme.light.color.base;')
		const exp = newToken(7, 30, '$theme.light.color.base', [
			'theme',
			'light',
			'color',
			'base',
		])

		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with empty args, parses whole token', () => {
		const sc = new Scanner('$func()')
		const exp = newToken(0, 7, '$func()', ['func'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with one arg, parses whole token', () => {
		const sc = new Scanner('$func(abc)')
		const exp = newToken(0, 10, '$func(abc)', ['func'], ['abc'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with multiple args, parses whole token', () => {
		const sc = new Scanner('$func(1,2,3)')
		const exp = newToken(0, 12, '$func(1,2,3)', ['func'], ['1', '2', '3'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with string args, parses token args correclty', () => {
		const sc = new Scanner('$func(abc,efg,hij)')
		const exp = newToken(
			0,
			18,
			'$func(abc,efg,hij)',
			['func'],
			['abc', 'efg', 'hij']
		)
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with empty args, parses whole token', () => {
		const sc = new Scanner('$func(1, 2, 3)')
		const exp = newToken(0, 14, '$func(1, 2, 3)', ['func'], ['1', '2', '3'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with empty string arg, parses arg correctly', () => {
		const sc = new Scanner('$func("")')
		const exp = newToken(0, 9, '$func("")', ['func'], [''])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with delimiter string arg, parses arg correctly', () => {
		const sc = new Scanner('$func("abc")')
		const exp = newToken(0, 12, '$func("abc")', ['func'], ['abc'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with delimited string arg containing spaces, parses arg correctly', () => {
		const sc = new Scanner('$func("abc   xyz")')
		const exp = newToken(0, 18, '$func("abc   xyz")', ['func'], ['abc   xyz'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with string arg containing escaped delimiter, parses arg correctly', () => {
		const sc = new Scanner('$func("a\\"b")')
		const exp = newToken(0, 13, '$func("a\\"b")', ['func'], ['a"b'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with string arg containing escaped escape delimiters, parses arg correctly', () => {
		const sc = new Scanner('$func("a\\\\b")')
		const exp = newToken(0, 13, '$func("a\\\\b")', ['func'], ['a\\b'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with string arg containing multiple escaped escape delimiters, parses arg correctly', () => {
		const sc = new Scanner('$func("\\\\\\\\")')
		const exp = newToken(0, 13, '$func("\\\\\\\\")', ['func'], ['\\\\'])
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with unterminated string arg, throws error', () => {
		const sc = new Scanner('$func(")')
		expect(sc.nextToken).toThrow(Error)
	})

	test('given token with string arg with delimiter final eleimiter (unterminated), throws error', () => {
		const sc = new Scanner('$func("\\")')
		expect(sc.nextToken).toThrow(Error)
	})

	test('given token with string arg with complex escaped final delimiter (unterminated), throws error', () => {
		const sc = new Scanner('$func("\\\\\\")')
		expect(sc.nextToken).toThrow(Error)
	})

	test('given token with string arg with unescaped delimiter (unterminated), throws error', () => {
		const sc = new Scanner('$func(""")')
		expect(sc.nextToken).toThrow(Error)
	})

	test('given token with space suffix, parsed token includes suffix', () => {
		const sc = new Scanner('$color ')
		const exp = newToken(0, 7, '$color ', ['color'], [], ' ')
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with multiple space suffix, parsed token includes correct suffix', () => {
		const sc = new Scanner('$color   ')
		const exp = newToken(0, 7, '$color ', ['color'], [], ' ')
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given token with whitespace suffix, parsed token includes correct suffix', () => {
		const sc = new Scanner('$color\t ')
		const exp = newToken(0, 7, '$color\t', ['color'], [], '\t')
		expect(sc.nextToken()).toEqual(exp)
	})

	test('given surrogate pair rune, parsed tokens include correct indexes', () => {
		const act = Scanner.scanAll('$color; 🫀; $color;')
		// 🫀 counts as two characters

		expect(act).toEqual([
			newToken(0, 6, '$color', ['color'], []),
			newToken(12, 18, '$color', ['color'], []),
		])
	})
})
