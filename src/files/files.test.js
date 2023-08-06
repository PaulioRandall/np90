import fs from 'fs'
import { stdout, stderr } from '../writers/writers.js'
import { processFileTree } from '../files/files.js'

const options = {
	stdout,
	stderr,
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
	test('Integration', async () => {
		const valueMap = {
			color: 'blue',
			pad: '2rem',
		}

		await processFileTree('./src/files/testdata', valueMap, options)
		await sleep(1000)

		checkFileContents(
			'./src/files/testdata/alpha/alpha.css',
			'.alpha {\n\tcolor: blue;\n}\n'
		)

		checkFileContents(
			'./src/files/testdata/alpha/beta/beta.css',
			'.beta {\n\tpadding: 2rem;\n}\n'
		)

		checkFileContents(
			'./src/files/testdata/alpha/charlie/charlie.css',
			'.charlie {\n\tcolor: blue;\n\tpadding: 2rem;\n}\n'
		)
	}, 5000)
})
