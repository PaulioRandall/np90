import path from 'path'

import os from './os.js'
import listP69Files from './list.js'

import engine from '../engine/engine.js'
import { stdout, stderr } from '../shared/writers.js'

export const processTree = async (file, tokenMaps, options) => {
	const p69Files = await listP69Files(file)

	if (options.output) {
		await os.deleteFile(options.output)
	}

	const hasErrors = false

	for (const f of p69Files) {
		await processFile(f, tokenMaps, {
			reference: f,
			...options,
		}).catch((e) => {
			hasErrors = true
			stderr(e, '\n')
		})
	}

	return hasErrors
}

export const processFile = async (p69File, tokenMaps, options) => {
	let [css, ok] = await os.readWholeFile(p69File)

	if (!ok) {
		throw new Error(`Unable to read file: ${p69File}`)
		return
	}

	css = engine(tokenMaps, css, options)
	css = css.trim()

	await writeCssToFile(p69File, css, options)
}

const writeCssToFile = async (p69File, css, options) => {
	if (options.output) {
		await os.appendToFile(options.output, css + '\n\n')
		return
	}

	const cssFile = os.replaceFileExt(p69File, 'css')
	await os.createOrReplaceFile(cssFile, css + '\n')
}
