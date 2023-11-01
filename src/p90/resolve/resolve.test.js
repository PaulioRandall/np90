import { resolve } from './resolve.js'

describe('resolve', () => {
	test('simple value returns the value as a string', () => {
		const act = resolve(123)
		expect(act).toEqual('123')
	})

	test('null returns empty string', () => {
		const act = resolve(null)
		expect(act).toEqual('')
	})

	test('undefined thorws an error', () => {
		const promise = async () => resolve(undefined)
		expect(promise).rejects.toBeInstanceOf(Error)
	})

	test('func with arguments returns the result of ivoking the function', () => {
		const func = (...propNameParts) => propNameParts.join('-')
		const args = ['background', 'color']
		const act = resolve(func, args)
		expect(act).toEqual('background-color')
	})

	test('func that returns null returns an empty string', () => {
		const func = () => null
		const act = resolve(func)
		expect(act).toEqual('')
	})

	test('func that returns undefined throws an error', () => {
		const func = () => undefined
		const promise = async () => resolve(given.prop, given)
		expect(promise).rejects.toBeInstanceOf(Error)
	})

	test('func that returns another func throws an error', () => {
		const func = () => {
			return () => 'Not allowed to return functions'
		}

		const promise = async () => resolve(func)
		expect(promise).rejects.toBeInstanceOf(Error)
	})
})
