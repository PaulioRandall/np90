import fs from 'fs'
import path from 'path'
import { stdout, stderr } from '../svelte/writers.js'
import { listP69Files } from './list-files.js'
import { replaceAll as p90 } from '../p90/p90.js'

export const processFileTree = async (file, tokenMaps, options) => {
	const p69Files = await listP69Files(file)

	if (options.output) {
		await deleteFile(options.output)
	}

	for (const f of p69Files) {
		await processFile(f, tokenMaps, options)
	}
}

export const processFile = async (p69File, tokenMaps, options) => {
	let [css, ok] = await readWholeFile(p69File)

	if (!ok) {
		return
	}

	css = p90(tokenMaps, css, prepOptions(options, p69File))
	css = css.trim()

	await writeCssToFile(p69File, css, options)
}

const prepOptions = (userOptions, filename) => {
	return {
		...userOptions,
		stdout,
		stderr,
		filename,
	}
}

const writeCssToFile = async (p69File, css, options) => {
	if (options.output) {
		await appendToFile(options.output, css + '\n\n')
		return
	}

	const cssFile = replaceFileExt(p69File, 'css')
	await createOrReplaceFile(cssFile, css + '\n')
}

const replaceFileExt = (f, newExt) => {
	const currExt = path.extname(f)
	f = f.slice(0, -currExt.length)
	return `${f}.${newExt}`
}

const readWholeFile = (f) => {
	return fs.promises
		.readFile(f, { encoding: 'utf-8' })
		.then(handleOK)
		.catch(handleErr)
}

const createOrReplaceFile = (f, content) => {
	return fs.promises
		.writeFile(f, content, { encoding: 'utf-8' })
		.then(handleOK)
		.catch(handleErr)
}

const appendToFile = (f, content) => {
	return fs.promises
		.appendFile(f, content, { encoding: 'utf-8' })
		.then(handleOK)
		.catch(handleErr)
}

const deleteFile = (f) => {
	return fs.promises.rm(f, { force: true }).then(handleOK).catch(handleErr)
}

const handleOK = (result) => {
	return [result, true]
}

const handleErr = (err) => {
	stderr(e)
	return [null, false]
}
