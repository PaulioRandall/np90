import fs from 'fs'
import path from 'path'
import p90 from '../p90'

export const processFileTree = async (file, valueMaps, options) => {
	const files = await listFiles(file)

	if (requiresAmalgamation(options)) {
		await fs.rmSync(options.output, { force: true })
	}

	for (const inFile of filterP90(files)) {
		const outFile = replaceExt(inFile, 'css')
		await processFile(inFile, valueMaps, options)
	}
}

const requiresAmalgamation = (options) => {
	return options.root && options.output
}

const listFiles = async (f) => {
	const stat = await fs.promises.stat(f)
	if (stat.isDirectory()) {
		return listChildren(f)
	}
	return [f]
}

const listChildren = async (dir) => {
	const children = await fs.promises.readdir(dir)
	const files = []

	for (const filename of children) {
		const rel = path.join(dir, filename)
		const abs = path.resolve(rel)
		const filesFound = await listFiles(abs)
		files.push(...filesFound)
	}

	return files
}

const filterP90 = (files) => {
	const results = []

	for (const f of files) {
		const ext = path.extname(f)
		if (ext === '.p69') {
			results.push(f)
		}
	}

	return results
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
