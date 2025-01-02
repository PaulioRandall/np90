import compile from './compile.js'

const joinLines = (...lines) => lines.join('\n')

const doProcessString = (valueMaps, content, config = {}) => {
	return compile(valueMaps, content, {
		filename: 'Test.svelte',
		onError: (e) => {
			throw e
		},
		...config,
	})
}

describe('index.js', () => {
	describe('compile', () => {
		test('performs simple replacement', () => {
			const valueMap = {
				green: 'forestgreen',
			}

			const act = doProcessString(valueMap, `$green`)
			expect(act).toEqual('forestgreen')
		})

		test('performs multiple simple replacements', () => {
			const valueMap = {
				green: 'forestgreen',
				red: 'indianred',
			}

			const act = doProcessString(
				valueMap,
				joinLines(
					'color: $green;',
					'color: $red;',
					'color: $green;',
					'color: orange;'
				)
			)

			expect(act).toEqual(
				joinLines(
					'color: forestgreen;',
					'color: indianred;',
					'color: forestgreen;',
					'color: orange;'
				)
			)
		})

		test('passes correct arguments to users value function', () => {
			let unspecifiedArg = 'something'

			const valueMap = {
				func: (a, b, c, d) => {
					unspecifiedArg = d
					return `${a}-${b}-${c}`
				},
			}

			const act = doProcessString(valueMap, `$func(alpha, beta, charlie)`)
			expect(act).toEqual('alpha-beta-charlie')
			expect(unspecifiedArg).toBeUndefined()
		})
	})
})
