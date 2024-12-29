import Compile from '../compile/Compile.js'

export const svelteP69 = (tokenMaps, options = {}) => {
	const {
		src = './src', //
		langs = [undefined, 'p69', 'text/p69'], //
	} = options

	return {
		name: 'P69',
		style: async ({ attributes, content, filename }) => {
			if (!langs.includes(attributes.lang)) {
				return
			}

			const code = await Compile.P69StringToCSS(tokenMaps, content, {
				ref: filename,
				...options,
			})

			return { code }
		},
	}
}
