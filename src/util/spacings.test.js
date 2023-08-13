import { spacings } from './spacings.js'

describe('spacings', () => {
	test('#1', () => {
		const given = {
			sm: 320,
			md: 720,
		}

		const act = spacings(given)
		expect(typeof act).toBe('object')
		expect(typeof act.sm).toBe('function')
		expect(typeof act.md).toBe('function')
	})

	test('#2', () => {
		const given = {
			sm: 24,
		}

		const act = spacings(given)

		expect(act.sm()).toEqual('24px')
		expect(act.sm('em')).toEqual('1.5em')
		expect(act.sm('rem')).toEqual('1.5rem')
		expect(act.sm('pt')).toEqual('18pt')
		expect(act.sm('pc')).toEqual('1.5pc')
		expect(act.sm('in')).toEqual('0.25in')
		expect(act.sm('cm')).toEqual('0.64cm')
		expect(act.sm('mm')).toEqual('6.4mm')
	})

	test('#2', () => {
		const given = {
			sm: 320,
		}

		const act = spacings(given)
		expect(() => act.sm('au')).toThrow(Error)
	})
})
