// Everything in reference to 96 DPI.
// Not perfect but precise enough.
const PX_IN_INCH = 96
const PX_IN_MM = PX_IN_INCH * 0.03937
const PX_IN_CM = PX_IN_MM * 10
const PT_IN_INCH = 72
const PX_IN_PC = 16

const round = (n, dp = 2) => {
	const mod = Math.pow(10, dp)
	const result = Math.round(n * mod)
	return result / mod
}

const pxToEm = (px, base) => round(px / base)
const pxToRem = (px, base) => round(px / base)
const pxToPt = (px) => round((px * PT_IN_INCH) / PX_IN_INCH)
const pxToIn = (px) => round((px * 1) / PX_IN_INCH)
const pxToCm = (px) => round((px * 1) / PX_IN_CM)
const pxToMm = (px) => round((px * 1) / PX_IN_MM, 1)
const pxToPc = (px) => round((px * 1) / PX_IN_PC)

export const spacings = (values, options = {}) => {
	const { base = 16, defaultUnit = 'rem' } = options
	const funcs = {}

	for (const name in values) {
		funcs[name] = (unit) => {
			return calcSpace(name, base, values[name], unit ? unit : defaultUnit)
		}
	}

	return funcs
}

const calcSpace = (name, base, px, unit) => {
	switch (unit) {
		case 'rem':
			return pxToEm(px, base) + 'rem'
		case 'em':
			return pxToEm(px, base) + 'em'
		case 'px':
			return px + unit
		case 'pt':
			return pxToPt(px) + 'pt'
		case 'pc':
			return pxToPc(px) + 'pc'
		case 'in':
			return pxToIn(px) + 'in'
		case 'cm':
			return pxToCm(px) + 'cm'
		case 'mm':
			return pxToMm(px) + 'mm'
		default:
			throw new Error(`Spacing format not supported '${name}(${unit})'`)
	}
}
