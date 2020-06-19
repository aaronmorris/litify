import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export function showToastMessage(variant, title, message, mode = 'dismissible') {
	const toastMessage = new ShowToastEvent({
		title: title,
		message: message,
		variant: variant,
		mode: mode
	});

	dispatchEvent(toastMessage);
}

export function mapToJSON(map) {
	return JSON.stringify([...map]);
}

export function jsonToMap(jsonString) {
	return new Map(JSON.parse(jsonString));
}