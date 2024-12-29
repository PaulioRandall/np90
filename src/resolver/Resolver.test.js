import Resolver from './Resolver.js'

describe('Resolver', () => {
	describe('resolve', () => {
		test('passes when picks the right value', () => {
			const resolver = new Resolver({
				a: 'bad',
				b: 'good',
				c: 'bad',
			})

			const act = resolver.resolve(['b'])
			expect(act).toEqual('good')
		})

		test('passes given deep mapping', () => {
			const resolver = new Resolver({
				a: {
					b: {
						c: 'good',
					},
				},
			})

			const act = resolver.resolve(['a', 'b', 'c'])
			expect(act).toEqual('good')
		})

		test('passes when value is a string', () => {
			const resolver = new Resolver({
				k: 'string',
			})

			const act = resolver.resolve(['k'])
			expect(act).toEqual('string')
		})

		test('passes when value is a number', () => {
			const resolver = new Resolver({
				k: 9,
			})

			const act = resolver.resolve(['k'])
			expect(act).toEqual('9')
		})

		test('passes when value is a bigint', () => {
			const resolver = new Resolver({
				k: BigInt('12345678987654321'),
			})

			const act = resolver.resolve(['k'])
			expect(act).toEqual('12345678987654321')
		})

		test('passes when value is a bool', () => {
			const resolver = new Resolver({
				k: true,
			})

			const act = resolver.resolve(['k'])
			expect(act).toEqual('true')
		})

		test('passes when value is an array', () => {
			const resolver = new Resolver({
				k: ['a', 'b', 'c'],
			})

			const act = resolver.resolve(['k'])
			expect(act).toEqual('a,b,c')
		})

		test('passes when value is a function without args', () => {
			const resolver = new Resolver({
				k: () => 'return value',
			})

			const act = resolver.resolve(['k'])
			expect(act).toEqual('return value')
		})

		test('passes when value is a function with args', () => {
			const resolver = new Resolver({
				k: (a, b, c) => '' + a + b + c,
			})

			const act = resolver.resolve(['k'], ['a', 'b', 'c'])
			expect(act).toEqual('abc')
		})

		test('throws when value is missing', () => {
			const resolver = new Resolver({})

			const f = () => resolver.resolve(['k'])
			expect(f).toThrow(Error)
		})

		test('throws when value is an object', () => {
			const resolver = new Resolver({
				k: {},
			})

			const f = () => resolver.resolve(['k'])
			expect(f).toThrow(Error)
		})

		test('throws when function returns a function', () => {
			const resolver = new Resolver({
				k: () => () => 'value',
			})

			const f = () => resolver.resolve(['k'])
			expect(f).toThrow(Error)
		})
	})
})
