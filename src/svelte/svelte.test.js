import sveltePreprocessor from './svelte.js'

describe('svelte', () => {
	test('Integration', () => {
		const processor = sveltePreprocessor('./svelte.test.token-map.js', {
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
