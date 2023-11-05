import fs from 'fs'
import { stdout, stderr } from '../svelte/writers.js'
import { processFileTree } from '../files/files.js'

const testdataDir = './src/files/testdata'
const output = './src/files/testdata/global.css'

const testdata = [
	{
		file: './src/files/testdata/alpha/alpha.css',
		data: '.alpha {\n\tcolor: blue;\n}\n',
	},
	{
		file: './src/files/testdata/alpha/beta/beta.css',
		data: '.beta {\n\tpadding: 2rem;\n}\n',
	},
	{
		file: './src/files/testdata/alpha/charlie/charlie.css',
		data: '.charlie {\n\tcolor: blue;\n\tpadding: 2rem;\n}\n',
	},
]

const resetTestdata = async () => {
	await fs.rmSync(output, { force: true })
	for (const f of testdata) {
		await fs.rmSync(f.file, { force: true })
	}
}

const amalgamateTestdata = () => {
	let data = ''
	for (let i = 0; i < testdata.length; i++) {
		data += testdata[i].data + '\n'
	}
	return data
}

const readFile = (f) => {
	try {
		return fs.readFileSync(f, { encoding: 'utf-8' })
	} catch (e) {
		stderr(e)
		return null
	}
}

const sleep = async (timeout) => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout)
	})
}

const checkFileContents = (f, contents) => {
	const data = readFile(f)
	expect(data).toEqual(contents)
}

describe('files', () => {
	test('#1', async () => {
		await resetTestdata()
		await sleep(500)

		const tokenMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree(testdataDir, tokenMap, {
			stdout,
			stderr,
			root: null,
			output: null,
		})
		await sleep(500)

		for (const f of testdata) {
			checkFileContents(f.file, f.data)
		}
	}, 3000)
})

describe('files', () => {
	test('#2', async () => {
		await resetTestdata()
		await sleep(500)

		const valueMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree(testdataDir, valueMap, {
			stdout,
			stderr,
			root: testdataDir,
			output: output,
		})
		await sleep(500)

		const data = amalgamateTestdata()
		checkFileContents(output, data)
	}, 3000)
})
