import { themeVariables, colorSchemes } from './color-schemes.js'

const themes = {
	light: {
		base: 'rgb(250, 250, 250)',
		text: 'rgb(5, 10, 60)',
		strong: 'rgb(30, 85, 175)',
	},
	dark: {
		base: 'rgb(5, 10, 35)',
		text: 'rgb(231, 245, 255)',
		strong: 'rgb(222, 184, 135)',
	},
}

describe('themeVariables', () => {
	test('#1', () => {
		const exp = {
			base: 'var(--base)',
			text: 'var(--text)',
			strong: 'var(--strong)',
		}

		const act = themeVariables(themes)
		expect(act).toEqual(exp)
	})
})

describe('colorSchemes', () => {
	test('#1', () => {
		const exp = `@media (prefers-color-scheme: light) {
	:root {
		--theme-base: rgb(250, 250, 250);
		--theme-text: rgb(5, 10, 60);
		--theme-strong: rgb(30, 85, 175);
	}
}

@media (prefers-color-scheme: dark) {
	:root {
		--theme-base: rgb(5, 10, 35);
		--theme-text: rgb(231, 245, 255);
		--theme-strong: rgb(222, 184, 135);
	}
}`

		const act = colorSchemes(themes, 'theme-')
		expect(act).toEqual(exp)
	})
})
