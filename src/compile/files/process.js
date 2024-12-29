import path from 'path'

import os from './os.js'
import listP69Files from './list.js'

import { p69StringToCss } from '../strings/compiler.js'
import { stdout, stderr } from '../writers.js'

export const p69FilesToCss = async (tokenMaps, options = {}) => {
	const {
		src = './src', //
		out = './src/app.css', //
	} = options

	let hasErrors = false
	let p69Files = []

	try {
		p69Files = await listP69Files(src)
	} catch (e) {
		stderr(e)
		return true
	}

	if (out) {
		await os.deleteFile(out)
	}

	for (const f of p69Files) {
		await fileP69(f, tokenMaps, out, {
			ref: f,
			...options, //
		}).catch((e) => {
			hasErrors = true
			stderr(e, '\n')
		})
	}

	return hasErrors
}

export const fileP69 = async (p69File, tokenMaps, out, options) => {
	let [css, ok] = await os.readWholeFile(p69File)

	if (!ok) {
		throw new Error(`Unable to read file: ${p69File}`)
		return
	}

	css = p69StringToCss(tokenMaps, css, options)
	css = css.trim()

	await writeCssToFile(p69File, css, out)
}

const writeCssToFile = async (p69File, css, out) => {
	if (out) {
		await os.appendToFile(out, css + '\n\n')
		return
	}

	const cssFile = os.replaceFileExt(p69File, 'css')
	await os.createOrReplaceFile(cssFile, css + '\n')
}
