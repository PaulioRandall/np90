import { lookup } from './lookup.js'

describe('lookup.js', () => {
	test('finds simple value & identifies its type', () => {
		const tokenMaps = [
			{
				x: 'prop',
			},
		]

		const act = lookup(tokenMaps, ['x'])
		expect(act).toEqual('prop')
	})

	test('finds nested value & identifies its type', () => {
		const tokenMaps = [
			{
				my: {
					func: () => 'meh',
				},
			},
		]

		const act = lookup(tokenMaps, ['my', 'func'])
		expect(act).toEqual(tokenMaps[0].my.func)
	})

	test('finds array value & identifies it as an array', () => {
		const tokenMaps = [
			{
				list: [1, 2, 3],
			},
		]

		const act = lookup(tokenMaps, ['list'])
		expect(act).toEqual(tokenMaps[0].list)
	})

	test("finds value that's not in the first value map of the set", () => {
		const tokenMaps = [{ a: 'alpha' }, { b: 'beta' }, { c: 'charlie' }]

		const act = lookup(tokenMaps, ['c'])
		expect(act).toEqual('charlie')
	})
})
