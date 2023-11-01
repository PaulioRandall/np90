import { lookup } from './lookup.js'

describe('lookup', () => {
	test('finds simple value & identifies its type', () => {
		const valueMaps = [
			{
				x: 'prop',
			},
		]

		const act = lookup(valueMaps, ['x'])
		expect(act).toEqual('prop')
	})

	test('finds nested value & identifies its type', () => {
		const valueMaps = [
			{
				my: {
					func: () => 'meh',
				},
			},
		]

		const act = lookup(valueMaps, ['my', 'func'])
		expect(act).toEqual(valueMaps[0].my.func)
	})

	test('finds array value & identifies it as an array', () => {
		const valueMaps = [
			{
				list: [1, 2, 3],
			},
		]

		const act = lookup(valueMaps, ['list'])
		expect(act).toEqual(valueMaps[0].list)
	})

	test("finds value that's not in the first value map of the set", () => {
		const valueMaps = [{ a: 'alpha' }, { b: 'beta' }, { c: 'charlie' }]

		const act = lookup(valueMaps, ['c'])
		expect(act).toEqual('charlie')
	})
})
