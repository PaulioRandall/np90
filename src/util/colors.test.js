import { rgbsToColors } from './colors.js'

describe('rgbsToColors', () => {
	test('#1', () => {
		const rgbs = {
			red: [255, 0, 0],
			green: [0, 255, 0],
			blue: [0, 0, 255],
			alpha: [0, 0, 0, 0.5],
		}

		const exp = {
			red: 'rgb(255, 0, 0)',
			green: 'rgb(0, 255, 0)',
			blue: 'rgb(0, 0, 255)',
			alpha: 'rgba(0, 0, 0, 0.5)',
		}

		const act = rgbsToColors(rgbs)
		expect(act).toEqual(exp)
	})
})
