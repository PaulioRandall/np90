import p90 from 'p90'
import chokidar from 'chokidar'
import path from 'path'
import { stdout, stderr } from '../writers/writers.js'
import { processFileTree } from '../files/files.js'

export const defaultMimeTypes = ['p69', 'text/p69']

export const sveltePreprocessor = (valueMaps, userOptions = {}) => {
	const options = getOptions(userOptions)
	return newSvelteProcessor(valueMaps, options)
}

const getOptions = (userOptions) => {
	return {
		stdout,
		stderr,
		root: './src',
		amalgamate: './src/routes/styles.css',
		watch: process?.env?.NODE_ENV === 'development',
		mimeTypes: defaultMimeTypes,
		...userOptions,
	}
}

const newSvelteProcessor = (valueMaps, options) => {
	let once = false

	return {
		name: 'P69: CSS preprocessor using P90',
		style: async ({ content, markup, attributes, filename }) => {
			if (!once && options.root) {
				once = true
				await p69(valueMaps, options)
			}

			if (!options.mimeTypes.includes(attributes.lang)) {
				return {
					code: content,
				}
			}

			const fileOptions = {
				...options,
				errorNote: filename,
			}

			return {
				code: await p90(valueMaps, content, fileOptions),
			}
		},
	}
}

const p69 = async (valueMaps, options) => {
	await processFileTree(options.root, valueMaps, options)
	if (options.watch === true) {
		startWatching(valueMaps, options)
	}
}

const startWatching = (valueMaps, options) => {
	const watcher = chokidar.watch(options.root, {
		persistent: true,
	})

	watcher.on('change', async (file) => {
		if (path.extname(file) !== '.p69') {
			return
		}

		if (options.amalgamate) {
			file = options.root
		}

		await processFileTree(file, valueMaps, options)
	})
}
