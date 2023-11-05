import chokidar from 'chokidar'
import path from 'path'

import { processFileTree } from '../files/files.js'
import { stdout } from './writers.js'

// P69FileProcessor does what it says. It watchers a directory for changes to
// .p69 files and invokes a handler when any of them change.
export class P69FileProcessor {
	constructor(state) {
		if (!state) {
			throw new Error('Missing SvelteProcessorState')
		}

		this._state = state
		this._watcher = null
	}

	start() {
		if (this._watcher) {
			return
		}

		this._initWatcher()
		this._listenForChanges()
	}

	stop() {
		if (!this._watcher) {
			return
		}

		this._watcher.close()
		this._watcher = null
	}

	restart() {
		this.stop()
		this.start()
	}

	_initWatcher() {
		this._watcher = chokidar.watch(this._state.getRoot(), {
			persistent: true,
		})
	}

	_listenForChanges() {
		this._watcher.on('change', async (file) => {
			if (this._isP69File(file)) {
				await this._reprocess()
			}
		})
	}

	_isP69File(file) {
		return path.extname(file) === '.p69'
	}

	_reprocess = () => {
		return processFileTree(
			this._state.getRoot(),
			this._state.getTokenMaps(),
			this._state.getOptions()
		)
	}
}
