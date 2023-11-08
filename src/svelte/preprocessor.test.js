import preprocessor from './preprocessor.js'

describe('svelte', () => {
	test('Integration', async () => {
		const processor = await preprocessor('./preprocessor.test.token-map.js', {
			root: null,
			output: null,
		})

		const given = {
			content: '$color',
			attributes: { lang: 'p69' },
			filename: 'Test.svelte',
		}

		const exp = {
			code: 'blue',
		}

		const promise = processor.style(given)
		expect(promise).resolves.toEqual(exp)
	})
})
