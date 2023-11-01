import { scanAll, scanFunc } from './scanner.js'

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

describe('scanFunc', () => {
	test('given string with no tokens returns a function, which returns null', () => {
		const f = scanFunc('abc', '$')
		expect(typeof f).toBe('function')
		expect(f()).toEqual(null)
	})

	test('given string with tokens returns function, which returns not null', () => {
		const f = scanFunc('$abc', '$')
		expect(typeof f).toBe('function')

		let exp = newToken(0, 4, '$abc', ['abc'])
		expect(f() === null).toEqual(false)
	})

	test('given multiple tokens, resolves all', () => {
		const f = scanFunc('$abc;$efg;$hij', '$')

		let exp = newToken(0, 4, '$abc', ['abc'])
		expect(f()).toEqual(exp)

		exp = newToken(5, 9, '$efg', ['efg'])
		expect(f()).toEqual(exp)

		exp = newToken(10, 14, '$hij', ['hij'])
		expect(f()).toEqual(exp)

		expect(f()).toEqual(null)
	})

	test('given multiple tokens between normal text, finds all tokens', () => {
		const given = 'color: $green; font-size: $lg; font-family: $nunito;'
		const f = scanFunc(given, '$')

		let exp = newToken(7, 13, '$green', ['green'])
		expect(f()).toEqual(exp)

		exp = newToken(26, 29, '$lg', ['lg'])
		expect(f()).toEqual(exp)

		exp = newToken(44, 51, '$nunito', ['nunito'])
		expect(f()).toEqual(exp)

		expect(f()).toEqual(null)
	})

	test('given token to nested value, finds token', () => {
		const f = scanFunc('color: $color.green;', '$')
		const exp = newToken(7, 19, '$color.green', ['color', 'green'])
		expect(f()).toEqual(exp)
	})

	test('given token to deep nested value, finds token', () => {
		const f = scanFunc('color: $theme.light.color.base;', '$')
		const exp = newToken(7, 30, '$theme.light.color.base', [
			'theme',
			'light',
			'color',
			'base',
		])

		expect(f()).toEqual(exp)
	})

	test('given token with empty args, parses whole token', () => {
		const f = scanFunc('$func()', '$')
		const exp = newToken(0, 7, '$func()', ['func'])
		expect(f()).toEqual(exp)
	})

	test('given token with one arg, parses whole token', () => {
		const f = scanFunc('$func(abc)', '$')
		const exp = newToken(0, 10, '$func(abc)', ['func'], ['abc'])
		expect(f()).toEqual(exp)
	})

	test('given token with multiple args, parses whole token', () => {
		const f = scanFunc('$func(1,2,3)', '$')
		const exp = newToken(0, 12, '$func(1,2,3)', ['func'], ['1', '2', '3'])
		expect(f()).toEqual(exp)
	})

	test('given token with string args, parses token args correclty', () => {
		const f = scanFunc('$func(abc,efg,hij)', '$')
		const exp = newToken(
			0,
			18,
			'$func(abc,efg,hij)',
			['func'],
			['abc', 'efg', 'hij']
		)
		expect(f()).toEqual(exp)
	})

	test('given token with empty args, parses whole token', () => {
		const f = scanFunc('$func(1, 2, 3)', '$')
		const exp = newToken(0, 14, '$func(1, 2, 3)', ['func'], ['1', '2', '3'])
		expect(f()).toEqual(exp)
	})

	test('given token with empty string arg, parses arg correctly', () => {
		const f = scanFunc('$func("")', '$')
		const exp = newToken(0, 9, '$func("")', ['func'], [''])
		expect(f()).toEqual(exp)
	})

	test('given token with delimiter string arg, parses arg correctly', () => {
		const f = scanFunc('$func("abc")', '$')
		const exp = newToken(0, 12, '$func("abc")', ['func'], ['abc'])
		expect(f()).toEqual(exp)
	})

	test('given token with delimited string arg containing spaces, parses arg correctly', () => {
		const f = scanFunc('$func("abc   xyz")', '$')
		const exp = newToken(0, 18, '$func("abc   xyz")', ['func'], ['abc   xyz'])
		expect(f()).toEqual(exp)
	})

	test('given token with string arg containing escaped delimiter, parses arg correctly', () => {
		const f = scanFunc('$func("a\\"b")', '$')
		const exp = newToken(0, 13, '$func("a\\"b")', ['func'], ['a"b'])
		expect(f()).toEqual(exp)
	})

	test('given token with string arg containing escaped escape delimiters, parses arg correctly', () => {
		const f = scanFunc('$func("a\\\\b")', '$')
		const exp = newToken(0, 13, '$func("a\\\\b")', ['func'], ['a\\b'])
		expect(f()).toEqual(exp)
	})

	test('given token with string arg containing multiple escaped escape delimiters, parses arg correctly', () => {
		const f = scanFunc('$func("\\\\\\\\")', '$')
		const exp = newToken(0, 13, '$func("\\\\\\\\")', ['func'], ['\\\\'])
		expect(f()).toEqual(exp)
	})

	test('given token with unterminated string arg, throws error', () => {
		const f = scanFunc('$func(")', '$')
		expect(f).toThrow(Error)
	})

	test('given token with string arg with delimiter final eleimiter (unterminated), throws error', () => {
		const f = scanFunc('$func("\\")', '$')
		expect(f).toThrow(Error)
	})

	test('given token with string arg with complex escaped final delimiter (unterminated), throws error', () => {
		const f = scanFunc('$func("\\\\\\")', '$')
		expect(f).toThrow(Error)
	})

	test('given token with string arg with unescaped delimiter (unterminated), throws error', () => {
		const f = scanFunc('$func(""")', '$')
		expect(f).toThrow(Error)
	})

	test('given token with space suffix, parsed token includes suffix', () => {
		const f = scanFunc('$color ', '$')
		const exp = newToken(0, 7, '$color ', ['color'], [], ' ')
		expect(f()).toEqual(exp)
	})

	test('given token with multiple space suffix, parsed token includes correct suffix', () => {
		const f = scanFunc('$color   ', '$')
		const exp = newToken(0, 7, '$color ', ['color'], [], ' ')
		expect(f()).toEqual(exp)
	})

	test('given token with whitespace suffix, parsed token includes correct suffix', () => {
		const f = scanFunc('$color\t ', '$')
		const exp = newToken(0, 7, '$color\t', ['color'], [], '\t')
		expect(f()).toEqual(exp)
	})

	test('given surrogate pair rune, parsed tokens include correct indexes', () => {
		const act = scanAll('$color; 🫀; $color;', '$')
		// 🫀 counts as two characters

		expect(act).toEqual([
			newToken(0, 6, '$color', ['color'], []),
			newToken(12, 18, '$color', ['color'], []),
		])
	})
})
