import Tokens from './Tokens.js'

describe('class Tokens', () => {
	describe('resolve', () => {
		test('passes when picks the right value', () => {
			const tokens = new Tokens({
				a: 'bad',
				b: 'good',
				c: 'bad',
			})

			const act = tokens.resolve(['b'])
			expect(act).toEqual('good')
		})

		test('passes given deep mapping', () => {
			const tokens = new Tokens({
				a: {
					b: {
						c: 'good',
					},
				},
			})

			const act = tokens.resolve(['a', 'b', 'c'])
			expect(act).toEqual('good')
		})

		test('passes when value is a string', () => {
			const tokens = new Tokens({
				k: 'string',
			})

			const act = tokens.resolve(['k'])
			expect(act).toEqual('string')
		})

		test('passes when value is a number', () => {
			const tokens = new Tokens({
				k: 9,
			})

			const act = tokens.resolve(['k'])
			expect(act).toEqual('9')
		})

		test('passes when value is a bigint', () => {
			const tokens = new Tokens({
				k: BigInt('12345678987654321'),
			})

			const act = tokens.resolve(['k'])
			expect(act).toEqual('12345678987654321')
		})

		test('passes when value is a bool', () => {
			const tokens = new Tokens({
				k: true,
			})

			const act = tokens.resolve(['k'])
			expect(act).toEqual('true')
		})

		test('passes when value is an array', () => {
			const tokens = new Tokens({
				k: ['a', 'b', 'c'],
			})

			const act = tokens.resolve(['k'])
			expect(act).toEqual('a,b,c')
		})

		test('passes when value is a function without args', () => {
			const tokens = new Tokens({
				k: () => 'return value',
			})

			const act = tokens.resolve(['k'])
			expect(act).toEqual('return value')
		})

		test('passes when value is a function with args', () => {
			const tokens = new Tokens({
				k: (a, b, c) => '' + a + b + c,
			})

			const act = tokens.resolve(['k'], ['a', 'b', 'c'])
			expect(act).toEqual('abc')
		})

		test('throws when value is missing', () => {
			const tokens = new Tokens({})

			const f = () => tokens.resolve(['k'])
			expect(f).toThrow(Error)
		})

		test('throws when value is an object', () => {
			const tokens = new Tokens({
				k: {},
			})

			const f = () => tokens.resolve(['k'])
			expect(f).toThrow(Error)
		})

		test('throws when function returns a function', () => {
			const tokens = new Tokens({
				k: () => () => 'value',
			})

			const f = () => tokens.resolve(['k'])
			expect(f).toThrow(Error)
		})
	})
})
