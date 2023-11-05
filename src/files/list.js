import fs from 'fs'
import path from 'path'

// listP69Files returns a list containing all .p69 files that are children of
// the specified file.
//
// If the passed file is a .p69 file then it will be the only item in the
// resultant array. The array may be empty if no .p69 files are found.
const listP69Files = async (file) => {
	const stat = await fs.promises.stat(file)

	if (stat.isDirectory()) {
		return listP69Children(file)
	}

	return isP69(file) ? [file] : []
}

const listP69Children = async (dir) => {
	let files = await fs.promises.readdir(dir)
	files = files.map((f) => absListP69Files(dir, f))
	files = await Promise.all(files)
	return files.flat()
}

const absListP69Files = (dir, f) => {
	f = absPath(dir, f)
	return listP69Files(f)
}

const absPath = (dir, f) => {
	f = path.join(dir, f)
	return path.resolve(f)
}

const isP69 = (f) => {
	return path.extname(f) === '.p69'
}

export default listP69Files
