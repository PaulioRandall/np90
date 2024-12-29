import fs from 'fs'

import testdata from './testdata.js'
import { p69FilesToCss } from './process.js'

const expectedCSS = [
	{
		path: testdata.testDir + '/alpha/alpha.css',
		content: '.alpha {\n\tcolor: blue;\n}\n',
	},
	{
		path: testdata.testDir + '/alpha/beta/beta.css',
		content: '.beta {\n\tpadding: 2rem;\n}\n',
	},
	{
		path: testdata.testDir + '/alpha/charlie/charlie.css',
		content: '.charlie {\n\tcolor: blue;\n\tpadding: 2rem;\n}\n',
	},
]

describe('files.js', () => {
	test('processes testdata from .p69 to .css', async () => {
		await testdata.reset()

		const tokenMap = {
			color: 'blue',
			pad: '2rem',
		}

		const hasErrors = await p69FilesToCss(tokenMap, {
			src: testdata.testDir,
			out: null,
		})

		expect(hasErrors).toEqual(false)

		for (const f of expectedCSS) {
			await testdata.expectFileContains(f.path, f.content)
		}
	}, 2000)

	test('processes AND amalgamtes testdata from .p69 to .css', async () => {
		await testdata.reset()

		const out = testdata.testDir + '/global.css'
		const tokenMap = {
			color: 'blue',
			pad: '2rem',
		}

		const hasErrors = await p69FilesToCss(tokenMap, {
			src: testdata.testDir,
			out: out,
		})

		expect(hasErrors).toEqual(false)

		const exp = expectedCSS.reduce((acc, f) => {
			return `${acc}${f.content}\n`
		}, '')

		await testdata.expectFileContains(out, exp)
	}, 2000)
})
