import fs from 'fs'
import path from 'path'

import { stderr } from '../writers.js'

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

export default {
	replaceFileExt,
	readWholeFile,
	createOrReplaceFile,
	appendToFile,
	deleteFile,
}
