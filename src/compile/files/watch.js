import chokidar from 'chokidar'
import { filesP69 } from './process.js'
import { stderr } from '../writers.js'

export const watchP69 = (tokenMaps, options = {}) => {
	const src = options.src || './src'
	const chokidarOptions = options.chokidar || {}

	const handler = (path) => filesP69(tokenMaps, options)

	const watcher = chokidar
		.watch(`${src}/**/*.p69`, chokidarOptions) //
		.on('ready', handler) //
		.on('add', handler) //
		.on('change', handler) //
		.on('unlink', handler) //
		.on('addDir', handler) //
		.on('unlinkDir', handler) //
		.on('error', (e) => {
			stderr(`Watcher error: ${e}`) //
		})

	return watcher.close
}
