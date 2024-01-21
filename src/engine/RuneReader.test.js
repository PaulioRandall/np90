import RuneReader from './RuneReader.js'

describe('RuneReader.js', () => {
	describe('RuneReader.accept()', () => {
		test('returns value when regex match', () => {
			const sr = new RuneReader('abc')
			const act = sr.accept(/a/)

			expect(act).toEqual('a')
			expect(sr.runeIndex()).toEqual(1)
		})

		test('returns null when regex not match', () => {
			const sr = new RuneReader('abc')
			const act = sr.accept(/b/)

			expect(act).toEqual(null)
			expect(sr.runeIndex()).toEqual(0)
		})

		test('returns null when EOF', () => {
			const sr = new RuneReader('')
			const act = sr.accept(/a/)

			expect(act).toEqual(null)
			expect(sr.runeIndex()).toEqual(0)
		})
	})

	describe('RuneReader.expect', () => {
		test('returns value when regex match', () => {
			const sr = new RuneReader('abc')
			const act = sr.expect(/a/)

			expect(act).toEqual('a')
			expect(sr.runeIndex()).toEqual(1)
		})

		test('throws error when EOF', () => {
			const sr = new RuneReader('abc')
			const f = () => sr.expect(/b/)
			expect(f).toThrow(Error)
		})
	})

	describe('RuneReader.seek', () => {
		test('goes to correct index AND returns true', () => {
			const sr = new RuneReader('abc')
			const found = sr.seek(/b/)

			expect(found).toEqual(true)
			expect(sr.runeIndex()).toEqual(1)
		})

		test('goes to EOF AND returns false', () => {
			const sr = new RuneReader('abc')
			const found = sr.seek(/d/)

			expect(found).toEqual(false)
			expect(sr.runeIndex()).toEqual(3)
		})
	})

	describe('RuneReader.readWhile', () => {
		test('given regex that matches whole input, returns correct string', () => {
			const sr = new RuneReader('abc')
			const s = sr.readWhile(/[a-z]/)

			expect(s).toEqual('abc')
			expect(sr.runeIndex()).toEqual(3)
		})

		test('given regex that matches part input, returns currect string', () => {
			const sr = new RuneReader('abc')
			const s = sr.readWhile(/[ab]/)

			expect(s).toEqual('ab')
			expect(sr.runeIndex()).toEqual(2)
		})

		test("given regex that doesn't match input, returns empty string", () => {
			const sr = new RuneReader('abc')
			const s = sr.readWhile(/[0-9]/)

			expect(s).toEqual('')
			expect(sr.runeIndex()).toEqual(0)
		})

		test('called twice with regexes that match, returns correct second string', () => {
			const sr = new RuneReader('abc123')
			sr.readWhile(/[a-z]/)
			const s = sr.readWhile(/[0-9]/)

			expect(s).toEqual('123')
			expect(sr.runeIndex()).toEqual(6)
		})
	})

	describe('RuneReader.skipSpaces', () => {
		test('given empty string, skips nothing', () => {
			const sr = new RuneReader('')
			const s = sr.skipSpaces()
			expect(sr.runeIndex()).toEqual(0)
		})

		test('given only whitespace, skips everything', () => {
			const sr = new RuneReader('   ')
			const s = sr.skipSpaces()
			expect(sr.runeIndex()).toEqual(3)
		})

		test('given initial whitespace, skips initial whitespace', () => {
			const sr = new RuneReader(' a ')
			const s = sr.skipSpaces()
			expect(sr.runeIndex()).toEqual(1)
		})

		test('given mix of whitespace runes, skips all whitespace', () => {
			const sr = new RuneReader('\t\f\v\r')
			const s = sr.skipSpaces()
			expect(sr.runeIndex()).toEqual(4)
		})
	})
})
