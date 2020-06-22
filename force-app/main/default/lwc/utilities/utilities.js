import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export function isBase64(inputString) {
    if (inputString ==='' || inputString.trim() ==='') {
		return false;
	}

	try {
        return btoa(atob(inputString)) === inputString;
    } catch (err) {
        return false;
    }
}

export function jsonToMap(jsonString) {
	return new Map(JSON.parse(jsonString));
}

export function mapToJSON(map) {
	return JSON.stringify([...map], undefined, 4);
}

export function showToastMessage(variant, title, message, mode = 'dismissible') {
	const toastMessage = new ShowToastEvent({
		title: title,
		message: message,
		variant: variant,
		mode: mode
	});

	dispatchEvent(toastMessage);
}