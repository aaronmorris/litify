import { LightningElement, api } from 'lwc';
import getAssociations from '@salesforce/apex/LWCAssociationsController.getAssociations';
import { showToastMessage } from 'c/utilities';

export default class associations extends LightningElement {
	@api caseName;
	@api caseId;
	associations = [];

	connectedCallback() {
		this.loadAssocations();
	}

	loadAssocations() {
		getAssociations({caseId: this.caseId})
			.then(results => {
				this.associations = results;
				console.log('got results', associations);
			})
			.catch(error => {
				showToastMessage('error', 'Error', error.body.message);
			});
		}
}