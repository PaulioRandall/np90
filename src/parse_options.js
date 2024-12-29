const TTY_RED = '\x1b[31m'
const TTY_YELLOW = '\x1b[33m'
const TTY_RESET = '\x1b[0m'

export default (userOptions) => {
	return {
		onError: defaultOnError,
		...userOptions,
	}
}

const defaultOnError = (err, token) => {
	stderr('[P69] ', err)
	stderr('[P69] ', JSON.stringify(token, null, 2))
}

const stdout = (...msgs) => {
	const msg = msgs.join(' ')
	return process.stdout.write(`\n${TTY_YELLOW}${msg}${TTY_RESET}`)
}

const stderr = (...msgs) => {
	const msg = msgs.join(' ')
	return process.stderr.write(`\n${TTY_RED}${msg}${TTY_RESET}`)
}
