export function printMsg(message: string, error?: Error) {
	const envName = import.meta.env.VITE_APP_ENV || 'dev';
	if (envName === 'dev') {
		console.log(message, error);
	}
}

export function printError(error: Error) {
	const envName = import.meta.env.VITE_APP_ENV || 'dev';
	if (envName === 'dev') {
		console.log(error);
	}
}