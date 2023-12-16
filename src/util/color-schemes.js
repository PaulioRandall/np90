export const themeVariables = (themes, prefix = '') => {
	const result = {}

	for (const name in themes) {
		for (const key in themes[name]) {
			result[key] = `var(--${prefix}${key})`
		}
	}

	return result
}

export const colorSchemes = (themes, prefix = '') => {
	const result = []

	for (const name in themes) {
		const csmq = colorSchemeMediaQuery(name, themes[name], prefix)
		result.push(csmq)
	}

	return result.join('\n\n')
}

const colorSchemeMediaQuery = (name, theme, prefix) => {
	const result = [`@media (prefers-color-scheme: ${name}) {`, '\t:root {']

	for (const key in theme) {
		const value = `--${prefix}${key}: ${theme[key]}`
		result.push(`\t\t${value};`)
	}

	result.push('\t}')
	result.push('}')
	return result.join('\n')
}
