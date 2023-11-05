import fs from 'fs'
import path from 'path'
import { listP69Files } from './list-files.js'
import { replaceAll as p90 } from '../p90/p90.js'

export const processFileTree = async (file, tokenMaps, options) => {
	const p69Files = await listP69Files(file)

	if (requiresAmalgamation(options)) {
		await fs.rmSync(options.output, { force: true })
	}

	for (const inFile of p69Files) {
		const outFile = replaceExt(inFile, 'css')
		await processFile(inFile, tokenMaps, options)
	}
}

const requiresAmalgamation = (options) => {
	return options.root && options.output
}

const processFile = async (inFile, valueMaps, options) => {
	let css = readFile(inFile, options.stderr)
	if (css === null) {
		return
	}

	css = p90(valueMaps, css, { ...options, filename: inFile })
	css = css.trim()
	writeCssToFile(inFile, css, options)
}

const writeCssToFile = (inFile, css, options) => {
	if (requiresAmalgamation(options)) {
		appendFile(options.output, options.stderr, css + '\n\n')
	} else {
		const outFile = replaceExt(inFile, 'css')
		writeFile(outFile, options.stderr, css + '\n')
	}
}

const readFile = (f, stderr) => {
	try {
		return fs.readFileSync(f, { encoding: 'utf-8' })
	} catch (e) {
		stderr(e)
		return null
	}
}

const replaceExt = (f, newExt) => {
	const currExt = path.extname(f)
	f = f.slice(0, -currExt.length)
	return `${f}.${newExt}`
}

const writeFile = (f, stderr, content) => {
	try {
		fs.writeFileSync(f, content, 'utf-8')
	} catch (e) {
		stderr(e)
	}
}

const appendFile = (f, stderr, content) => {
	try {
		fs.appendFileSync(f, content, 'utf-8')
	} catch (e) {
		stderr(e)
	}
}
