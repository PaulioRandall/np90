import p90 from 'p90'
import { stdout, stderr } from '../writers/writers.js'
import { processFileTree } from '../files/files.js'

let processed = false

export const defaultMimeTypes = ['p90', 'text/p90']

export const sveltePreprocessor = (valueMaps, options = {}) => {
	options = {
		globalDir: null,
		stdout,
		stderr,
		mimeTypes: defaultMimeTypes,
		...options,
	}

	return newSvelteProcessor(valueMaps, options)
}

const newSvelteProcessor = (valueMaps, options) => {
	return {
		name: 'NP90: P90 style preprocessor',
		style: async ({ content, markup, attributes, filename }) => {
			if (!processed && options.globalDir !== null) {
				processed = true
				await processFileTree(options.globalDir, valueMaps, options)
			}

			if (!options.mimeTypes.includes(attributes.lang)) {
				return {
					code: content,
				}
			}

			const config = {
				...options,
				filename,
			}

			return {
				code: await p90(content, valueMaps, config),
			}
		},
	}
}
