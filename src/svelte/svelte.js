import { replaceAll as p90 } from '../p90/p90.js'

import { SvelteProcessorState } from './SvelteProcessorState.js'
import { P69FileProcessor } from './P69FileProcessor.js'

const state = new SvelteProcessorState()
const fileProcessor = new P69FileProcessor(state)

const sveltePreprocessor = (tokenFile, userOptions = {}) => {
	state.setTokenFile(tokenFile)

	state.setOptions({
		throwOnError: false,
		root: './src',
		output: './src/routes/global.css',
		watch: process?.env?.NODE_ENV === 'development',
		mimeTypes: [undefined, 'p69', 'text/p69'],
		...userOptions,
	})

	if (state.isFileProcessingEnabled()) {
		fileProcessor.process()
	}

	if (state.isFileWatchEnabled()) {
		fileProcessor.start()
	}

	return newSvelteProcessor()
}

const newSvelteProcessor = () => {
	return {
		name: 'P69: CSS preprocessor',
		style: async ({ content, markup, attributes, filename }) => {
			if (state.isReloadRequired()) {
				await state.reloadTokenMaps()
			}

			if (!state.acceptMimeType(attributes.lang)) {
				return {
					code: content,
				}
			}

			return {
				code: await compileCSS(filename, content),
			}
		},
	}
}

const compileCSS = (filename, s) => {
	return p90(
		state.getTokenMaps(),
		s,
		state.getOptions({
			errorNote: filename,
		})
	)
}

export default sveltePreprocessor
