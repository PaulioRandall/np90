import { replaceAll } from '../processor/processor.js'

export const replaceCSS = (valueMaps, css, userOptions) => {
	return replaceAll(valueMaps, css, userOptions)
}
