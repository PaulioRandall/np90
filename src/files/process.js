import path from 'path'

import engine from '../engine/engine.js'

import os from './os.js'
import listP69Files from './list.js'

export const processTree = async (file, tokenMaps, options) => {
	const p69Files = await listP69Files(file)

	if (options.output) {
		await os.deleteFile(options.output)
	}

	for (const f of p69Files) {
		await processFile(f, tokenMaps, options)
	}
}

export const processFile = async (p69File, tokenMaps, options) => {
	let [css, ok] = await os.readWholeFile(p69File)

	if (!ok) {
		return
	}

	css = engine(tokenMaps, css, prepOptions(options, p69File))
	css = css.trim()

	await writeCssToFile(p69File, css, options)
}

const prepOptions = (userOptions, filename) => {
	return {
		...userOptions,
		filename,
	}
}

const writeCssToFile = async (p69File, css, options) => {
	if (options.output) {
		await os.appendToFile(options.output, css + '\n\n')
		return
	}

	const cssFile = os.replaceFileExt(p69File, 'css')
	await os.createOrReplaceFile(cssFile, css + '\n')
}
