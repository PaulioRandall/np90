import p90 from 'p90'
import { fileProcessor } from '../files/files.js'

const TTY_RED = '\x1b[31m'
const TTY_YELLOW = '\x1b[33m'
const TTY_RESET = '\x1b[0m'

export const defaultMimeTypes = ['p90', 'text/p90']

export const sveltePreprocessor = (valueMaps, options = {}) => {
	options = {
		stdout: (msg) => process.stdout.write(`\n${TTY_YELLOW}${msg}${TTY_RESET}`),
		stderr: (msg) => process.stderr.write(`\n${TTY_RED}${msg}${TTY_RESET}`),
		mimeTypes: defaultMimeTypes,
		...options,
	}

	fileProcessor(valueMaps, options)
	return newSvelteProcessor(valueMaps, options)
}

const newSvelteProcessor = (valueMaps, options) => {
	return {
		style: async ({ content, markup, attributes, filename }) => {
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
