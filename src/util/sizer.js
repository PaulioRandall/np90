// Everything in reference to 96 DPI.
// Not perfect but good enough.
const PX_IN_INCH = 96
const PX_IN_MM = PX_IN_INCH * 0.03937
const PX_IN_CM = PX_IN_MM * 10
const PT_IN_INCH = 72
const PX_IN_PC = 16

const round = (n, dp = 3) => {
	const mod = Math.pow(10, dp)
	const result = Math.round(n * mod)
	return result / mod
}

const pxToEm = (px, base) => round(px / base)
const pxToPt = (px) => round((px * PT_IN_INCH) / PX_IN_INCH, 1)
const pxToIn = (px) => round(px / PX_IN_INCH)
const pxToCm = (px) => round(px / PX_IN_CM, 2)
const pxToMm = (px) => round(px / PX_IN_MM, 1)
const pxToPc = (px) => round(px / PX_IN_PC, 2)

export const sizer = (values, base = 16) => {
	const sizes = {}

	for (const name in values) {
		sizes[name] = generateSize(name, values[name], base)
	}

	return sizes
}

const generateSize = (name, px, base) => {
	return {
		px: round(px, 1) + 'px',
		em: pxToEm(px, base) + 'em',
		rem: pxToEm(px, base) + 'rem',
		pt: pxToPt(px) + 'pt',
		pc: pxToPc(px) + 'pc',
		in: pxToIn(px) + 'in',
		cm: pxToCm(px) + 'cm',
		mm: pxToMm(px) + 'mm',
	}
}
