import chokidar from 'chokidar'
import path from 'path'
import { stdout } from './writer.js'

// P69DirWatcher does what it says. It watchers a directory for changes to .p69
// files and invokes a handler when any of them change.
export class P69DirWatcher {
	constructor() {
		this._dir = '.'
		this._handler = (file) => {}
	}

	setDir(dir) {
		this._dir = dir
		return this
	}

	setHandler(handler) {
		this._handler = handler
		return this
	}

	startWatching() {
		if (this._watcher) {
			return
		}

		this._initWatcher()
		this._listenForChanges()

		stdout('Started watching for .p69 file changes')
	}

	stopWatching() {
		if (!this._watcher) {
			return
		}

		this._watcher.close().then(() => {
			this._watcher = null
			stdout('Stopped watching for .p69 file changes')
		})
	}

	_initWatcher() {
		this._watcher = chokidar.watch(this._dir, {
			persistent: true,
		})
	}

	_listenForChanges() {
		this._watcher.on('change', async (file) => {
			if (this._isP69File(file)) {
				await this._callChangeHandler(file)
			}
		})
	}

	_isP69File(file) {
		return path.extname(file) === '.p69'
	}

	_callChangeHandler(file) {
		return Promise.resolve(() => this._handler(file))
	}
}
