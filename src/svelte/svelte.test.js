import { sveltePreprocessor } from './svelte.js'

describe('svelte', () => {
	test('Integration', () => {
		const valueMap = {
			color: 'blue',
		}

		const processor = sveltePreprocessor(valueMap)

		const given = {
			content: '$color',
			attributes: { lang: 'p90' },
			filename: 'Test.svelte',
		}

		const exp = {
			code: 'blue',
		}

		const promise = processor.style(given)
		expect(promise).resolves.toEqual(exp)
	})
})
