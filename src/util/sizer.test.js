import { sizer } from './sizer.js'

describe('sizer', () => {
	test('#1', () => {
		const given = {
			sm: 24,
			md: 48,
		}

		const act = sizer(given)
		expect(act).toEqual({
			sm: {
				rem: '1.5rem',
				em: '1.5em',
				px: '24px',
				pt: '18pt',
				pc: '1.5pc',
				in: '0.25in',
				cm: '0.64cm',
				mm: '6.4mm',
			},
			md: {
				rem: '3rem',
				em: '3em',
				px: '48px',
				pt: '36pt',
				pc: '3pc',
				in: '0.5in',
				cm: '1.27cm',
				mm: '12.7mm',
			},
		})
	})

	test('#2', () => {
		const given = {
			sm: 320,
		}

		const act = sizer(given)
		expect(act.sm.au).toEqual(undefined)
	})
})
