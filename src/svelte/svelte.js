import { stdout, stderr } from './writers.js'

import { TokenMapLoader } from './TokenMapLoader.js'
import { P69StringCompiler } from './P69StringCompiler.js'
import { P69FileCompiler } from './P69FileCompiler.js'

const defaultMimeTypes = [undefined, 'p69', 'text/p69']
const tokenMapLoader = new TokenMapLoader()
const p69StringCompiler = new P69StringCompiler()
const p69FileCompiler = new P69FileCompiler()

export const sveltePreprocessor = (tokenFile, userOptions = {}) => {
	const options = getOptions(userOptions)

	tokenMapLoader.setFile(tokenFile)

	// TODO: stdout & stderr should be internalised
	p69StringCompiler.updateOptions({
		...options,
		stdout,
		stderr,
	})

	p69FileCompiler.setOptions(options)
	p69FileCompiler.setRoot(options.root)

	return newSvelteProcessor(options.mimeTypes)
}

const getOptions = (userOptions) => {
	return {
		throwOnError: false,
		root: './src',
		output: './src/routes/global.css',
		watch: process?.env?.NODE_ENV === 'development',
		mimeTypes: defaultMimeTypes,
		...userOptions,
	}
}

const newSvelteProcessor = (mimeTypes) => {
	return {
		name: 'P69: CSS preprocessor',
		style: async ({ content, markup, attributes, filename }) => {
			if (tokenMapLoader.isDirty()) {
				const tokenMaps = await tokenMapLoader.reload()
				p69StringCompiler.setTokenMaps(tokenMaps)
				p69FileCompiler.setTokenMaps(tokenMaps)
			}

			if (!mimeTypes.includes(attributes.lang)) {
				return {
					code: content,
				}
			}

			p69StringCompiler.updateOptions({ errorNote: filename })

			return {
				code: await p69StringCompiler.compile(content),
			}
		},
	}
}

/*
const reloadMapTokens = async (tokenFile, options) => {
	const tokenMaps = await loadTokenMaps(tokenFile)
	await processFileTree(options.root, tokenMaps, options)

	if (!alreadyWatching && options.watch === true) {
		startWatching(tokenMaps, options)
	}

	alreadyWatching = true
	return tokenMaps
}

const loadTokenMaps = async (tokenFile) => {
	const tokenMaps = await import(tokenFile)
		.then((m) => m.default)
		.catch((e) => {
			console.error(e)
			return null
		})

	if (!tokenMaps) {
		throw new Error("Missing token map")
	}

	return tokenMaps
}


const startWatching = (tokenMaps, options) => {
	const watcher = chokidar.watch(options.root, {
		persistent: true,
	})

	const isP90File = (file) => path.extname(file) !== '.p69'

	watcher.on('change', async (file) => {
		if (!isP90File(file)) {
			return
		}

		if (options.output) {
			file = options.root
		}

		await processFileTree(file, tokenMaps, options)
	})
}
*/
