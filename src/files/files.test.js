import fs from 'fs'
import testdata from './testdata.js'
import { processFileTree } from '../files/files.js'

const expectedCSS = [
	{
		path: './src/files/testdata/alpha/alpha.css',
		content: '.alpha {\n\tcolor: blue;\n}\n',
	},
	{
		path: './src/files/testdata/alpha/beta/beta.css',
		content: '.beta {\n\tpadding: 2rem;\n}\n',
	},
	{
		path: './src/files/testdata/alpha/charlie/charlie.css',
		content: '.charlie {\n\tcolor: blue;\n\tpadding: 2rem;\n}\n',
	},
]

const output = './src/files/testdata/global.css'

describe('files', () => {
	test('#1', async () => {
		await testdata.reset()

		const tokenMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree(testdata.root, tokenMap, {
			root: null,
			output: null,
		})

		for (const f of expectedCSS) {
			await testdata.expectFileContains(f.path, f.content)
		}
	}, 2000)
})

describe('files', () => {
	test('#2', async () => {
		await testdata.reset()

		const tokenMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree(testdata.root, tokenMap, {
			root: testdata.root,
			output: output,
		})

		const exp = expectedCSS.reduce((acc, f) => {
			return `${acc}${f.content}\n`
		}, '')

		await testdata.expectFileContains(output, exp)
	}, 2000)
})
