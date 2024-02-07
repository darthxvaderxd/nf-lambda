export default function (type: string, ...args: any[]) {
	// TODO: pick a logger to use
	switch (type) {
		case 'error':
			console.error(new Date(), ...args);
			break;
		case 'warn':
			console.warn(new Date(), ...args);
			break;
		case 'info':
		case 'log':
		default:
			console.log(new Date(), ...args);
			break;
	}
}