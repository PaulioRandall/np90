export const lookup = (tokenMaps, path) => {
	for (const tm of tokenMaps) {
		const v = searchTokenMap(tm, path)
		if (v !== undefined) {
			return v
		}
	}

	return undefined
}

const searchTokenMap = (tokenMap, path) => {
	let v = tokenMap

	for (const segment of path) {
		if (v === undefined || v === null) {
			return undefined // This is correct, only return null if last segment
		}

		v = v[segment]
	}

	return v
}
