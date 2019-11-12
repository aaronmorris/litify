import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export function showToastMessage(variaint, title, message, mode = 'dismissable') {
	const toastMessage = new ShowToastEvent({
		title: title,
		message: message,
		variaint: variaint,
		mode: mode
	});

	dispatchEvent(toastMessage);
}