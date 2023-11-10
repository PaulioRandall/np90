import chokidar from 'chokidar'
import path from 'path'

import { processTree } from '../files/process.js'
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
		this._timeout = null
		this._delay = 100
	}

	process() {
		this._cancelSchedule()

		return this._state.apply((tokenMaps, options) => {
			return processTree(options.root, tokenMaps, options)
		})
	}

	start() {
		if (this._watcher) {
			return
		}

		this._initWatcher()
		this._listenForChanges()
	}

	stop() {
		this._cancelSchedule()
		this._destroyWatcher()
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

	_destroyWatcher() {
		if (this._watcher) {
			this._watcher.close()
		}
		this._watcher = null
	}

	_listenForChanges() {
		this._watcher.on('change', async (file) => {
			file = path.resolve(file)

			if (this._isP69File(file)) {
				this._reschedule()
				return
			}

			if (this._state.getTokenFile() === file) {
				this._state.outOfDate()
				this._reschedule()
			}
		})
	}

	_isP69File(file) {
		return path.extname(file) === '.p69'
	}

	_isJSFile(file) {
		switch (path.extname(file)) {
			case '.js':
			case '.jsx':
			case '.ts':
				return true
			default:
				return false
		}
	}

	_reschedule() {
		this._cancelSchedule()
		this._timeout = setTimeout(() => this.process(), this._delay)
	}

	_cancelSchedule() {
		clearTimeout(this._timeout)
		this._timeout = null
	}
}
