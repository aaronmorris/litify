import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export function showToastMessage(variaint, title, message, mode = 'dismissable') {
	const toastMessage = new ShowToastEvent({
		variaint: variaint,
		title: title,
		message: message,
		mode: mode
	});

	dispatchEvent(toastMessage);
}