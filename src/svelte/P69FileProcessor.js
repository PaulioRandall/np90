import chokidar from 'chokidar'
import path from 'path'

import files from '../files/files.js'
import { stdout } from '../shared/writers.js'

// P69FileProcessor performs .p69 file processing on request and provides a
// watcher that reprocesses .p69 files when any of them change.
export class P69FileProcessor {
	constructor(state) {
		if (!state) {
			throw new Error('Missing ProcessorState')
		}

		this._state = state
		this._watcher = null
	}

	process() {
		return files.processTree(
			this._state.getRoot(),
			this._state.getTokenMaps(),
			this._state.getOptions()
		)
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

	// TODO: Set reprocess flag and use interval polling to avoid processing
	//       multiple times when multiple files change at once.
	_listenForChanges() {
		this._watcher.on('change', async (file) => {
			if (this._isP69File(file)) {
				await this.process()
			}
		})
	}

	_isP69File(file) {
		return path.extname(file) === '.p69'
	}
}
