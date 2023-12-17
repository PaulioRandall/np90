import engine from '../engine/engine.js'
import { processTree } from '../files/process.js'
import { stdout, stderr } from '../shared/writers.js'

export default (tokenMaps, userOptions = {}) => {
	return newSvelteProcessor(tokenMaps, {
		root: './src',
		output: './src/app.css',
		mimeTypes: [undefined, 'p69', 'text/p69'],
		...userOptions,
	})
}

const newSvelteProcessor = (tokenMaps, options) => {
	let first = true

	const acceptsMimeType = (lang) => {
		return options.mimeTypes.includes(lang)
	}

	const compileCSS = (code, filename) => {
		return engine(tokenMaps, code, {
			reference: filename,
			...options,
		})
	}

	return {
		name: 'p69-svelte-preprocessor',
		style: async ({ attributes, content, filename }) => {
			if (first && options.root) {
				first = false

				const hadErrors = await processTree(options.root, tokenMaps, options)
				if (hadErrors) {
					throw new Error(
						'Unable to continue due to errors in .p69 files described above'
					)
				}
			}

			if (!acceptsMimeType(attributes.lang)) {
				return
			}

			return {
				code: await compileCSS(content, filename),
			}
		},
	}
}
