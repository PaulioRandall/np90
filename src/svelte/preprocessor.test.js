import { svelteP69 } from './preprocessor.js'

describe('svelte', () => {
	test('Integration', async () => {
		const tokenMap = {
			color: 'blue',
			shape: 'hexagon',
		}

		const processor = await svelteP69(tokenMap, {
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
