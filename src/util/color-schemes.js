export const themeVariables = (themes) => {
	const result = {}

	for (const name in themes) {
		for (const key in themes[name]) {
			result[key] = `var(--theme-${key})`
		}
	}

	return result
}

export const colorSchemes = (themes) => colorSchemeMediaQueries(themes)

const colorSchemeMediaQueries = (themes) => {
	const result = []

	for (const name in themes) {
		const csmq = colorSchemeMediaQuery(name, themes[name])
		result.push(csmq)
	}

	return result.join('\n\n')
}

const colorSchemeMediaQuery = (name, theme) => {
	const result = [`@media (prefers-color-scheme: ${name}) {`, '\t:root {']

	for (const key in theme) {
		const value = `--theme-${key}: ${theme[key]}`
		result.push(`\t\t${value};`)
	}

	result.push('\t}')
	result.push('}')
	return result.join('\n')
}
