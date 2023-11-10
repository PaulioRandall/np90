import p90 from '../p90/p90.js'

import PreprocessorState from './PreprocessorState.js'
import { P69FileProcessor } from './P69FileProcessor.js'

export default (tokenFile, userOptions = {}) => {
	const state = new PreprocessorState()

	state.setTokenFile(tokenFile)
	state.setOptions({
		throwOnError: false,
		root: './src',
		output: './src/routes/global.css',
		watch: process?.env?.NODE_ENV === 'development',
		mimeTypes: [undefined, 'p69', 'text/p69'],
		...userOptions,
	})

	return newSvelteProcessor(state)
}

const newSvelteProcessor = (state) => {
	const fileProcessor = new P69FileProcessor(state)
	let first = true

	return {
		name: '.p69 to .css processor',
		style: async ({ content, markup, attributes, filename }) => {
			if (first) {
				first = false
				await initFileProcessor(state, fileProcessor)
			}

			if (state.acceptsMimeType(attributes.lang)) {
				content = await compileCSS(state, filename, content)
			}

			return {
				code: content,
			}
		},
	}
}

const initFileProcessor = async (state, fileProcessor) => {
	if (state.isFileProcessingEnabled()) {
		await fileProcessor.process()
	}

	if (state.isFileWatchEnabled()) {
		await fileProcessor.restart()
	}
}

const compileCSS = (state, filename, code) => {
	return state.apply((tokenMaps, options) => {
		return p90(tokenMaps, code, {
			...options,
			errorNote: filename,
		})
	})
}
