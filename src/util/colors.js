export const rgbsToColors = (rgb) => {
	const result = {}
	for (const name in rgb) {
		result[name] = rgbToColor(name, rgb[name])
	}
	return result
}

const rgbToColor = (name, rgb) => {
	const hasAlpha = rgb.length === 4
	const value = rgb.join(', ')
	return hasAlpha ? `rgba(${value})` : `rgb(${value})`
}
