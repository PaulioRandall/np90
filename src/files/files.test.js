import fs from 'fs'
import { stdout, stderr } from '../writers/writers.js'
import { processFileTree } from '../files/files.js'

const amalgamate = './src/files/testdata/global.css'
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

const options = {
	stdout,
	stderr,
}

const resetTestdata = async () => {
	await fs.rmSync(amalgamate, { force: true })
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
		await sleep(1000)

		const valueMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree('./src/files/testdata', valueMap, options)
		await sleep(1000)

		for (const f of testdata) {
			checkFileContents(f.file, f.data)
		}
	}, 5000)
})

describe('files', () => {
	test('#2', async () => {
		await resetTestdata()
		await sleep(1000)

		const valueMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree('./src/files/testdata', valueMap, {
			...options,
			amalgamate,
		})
		await sleep(1000)

		const data = amalgamateTestdata()
		checkFileContents(amalgamate, data)
	}, 5000)
})
