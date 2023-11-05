import testdata from './testdata.js'
import listP69Files from './list.js'

describe('list.js', () => {
	test('correctly lists all .p69 testdata files', async () => {
		await testdata.reset()

		const act = await listP69Files(testdata.root)
		const exp = testdata.files
			.filter((f) => f.format === 'p69')
			.map((f) => f.path)

		act.sort()
		exp.sort()

		expect(act).toEqual(exp)
	}, 2000)
})
