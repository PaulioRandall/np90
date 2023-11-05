import { TokenMapLoader } from './TokenMapLoader.js'
import { P69StringCompiler } from './P69StringCompiler.js'
import { P69FileCompiler } from './P69FileCompiler.js'
import { P69DirWatcher } from './P69DirWatcher.js'

const defaultMimeTypes = [undefined, 'p69', 'text/p69']

const tokenMapLoader = new TokenMapLoader()
const p69StringCompiler = new P69StringCompiler()
const p69FileCompiler = new P69FileCompiler()
const p69DirWatcher = new P69DirWatcher()

export const sveltePreprocessor = (tokenFile, userOptions = {}) => {
	const options = getOptions(userOptions)

	tokenMapLoader.setFile(tokenFile)

	p69StringCompiler.updateOptions(options)

	p69FileCompiler.setOptions(options)
	p69FileCompiler.setRoot(options.root)

	if (options.watch) {
		p69DirWatcher.setDir(options.root)
		p69DirWatcher.setHandler(p69FileCompiler.compile)
		p69DirWatcher.start()
	}

	return newSvelteProcessor(options)
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

const newSvelteProcessor = (options) => {
	return {
		name: 'P69: CSS preprocessor',
		style: async ({ content, markup, attributes, filename }) => {
			if (tokenMapLoader.isDirty()) {
				const tokenMaps = await tokenMapLoader.reload()
				p69StringCompiler.setTokenMaps(tokenMaps)
				p69FileCompiler.setTokenMaps(tokenMaps)
			}

			if (!options.mimeTypes.includes(attributes.lang)) {
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
