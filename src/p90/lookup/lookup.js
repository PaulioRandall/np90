export const lookup = (valueMaps, path) => {
	return searchValueMaps(valueMaps, path)
}

const searchValueMaps = (valueMaps, path) => {
	for (const valueMap of valueMaps) {
		const v = findValue(valueMap, path)
		if (v !== undefined) {
			return v
		}
	}

	return undefined
}

const findValue = (valueMap, path) => {
	let v = valueMap

	for (const segment of path) {
		if (v === undefined || v === null) {
			return undefined // This is correct, only return null if last segment
		}

		v = v[segment]
	}

	return v
}
