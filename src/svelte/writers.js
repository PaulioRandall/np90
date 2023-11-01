const TTY_RED = '\x1b[31m'
const TTY_YELLOW = '\x1b[33m'
const TTY_RESET = '\x1b[0m'

export const stdout = (msg) => {
	return process.stdout.write(`\n${TTY_YELLOW}${msg}${TTY_RESET}`)
}

export const stderr = (msg) => {
	return process.stderr.write(`\n${TTY_RED}${msg}${TTY_RESET}`)
}
