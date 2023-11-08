import p90 from '../p90/p90.js'

import PreprocessorState from './PreprocessorState.js'
import { P69FileProcessor } from './P69FileProcessor.js'

const state = new PreprocessorState()
const fileProcessor = new P69FileProcessor(state)

const svelteProcessor = {
	name: '.p69 to .css processor',
	style: async ({ content, markup, attributes, filename }) => {
		if (state.acceptsMimeType(attributes.lang)) {
			content = await compileCSS(filename, content)
		}

		return {
			code: content,
		}
	},
}

const compileCSS = (filename, code) => {
	return state.apply((tokenMaps, options) => {
		return p90(tokenMaps, code, {
			...options,
			errorNote: filename,
		})
	})
}

const init = (tokenFile, userOptions = {}) => {
	state.setTokenFile(tokenFile)
	initOptions(userOptions)
	initFileProcessor()
	return svelteProcessor
}

const initOptions = (userOptions) => {
	state.setOptions({
		throwOnError: false,
		root: './src',
		output: './src/routes/global.css',
		watch: process?.env?.NODE_ENV === 'development',
		mimeTypes: [undefined, 'p69', 'text/p69'],
		...userOptions,
	})
}

const initFileProcessor = () => {
	if (state.isFileProcessingEnabled()) {
		fileProcessor.process()
	}

	if (state.isFileWatchEnabled()) {
		fileProcessor.restart()
	}
}

export default init
