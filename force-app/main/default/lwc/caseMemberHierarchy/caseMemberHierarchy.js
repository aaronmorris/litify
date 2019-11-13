import { LightningElement, track } from 'lwc';
import getAllLitifyCases from '@salesforce/apex/LWCCaseMemberHierarchyController.getAllLitifyCases';

const actions = [
	{ label: 'Show Details', name: 'show_details' },
	{ label: 'View Associations', name: 'view_associations'}
];

const columns = [
	// {label: 'Id', fieldName: 'Id'},
	{label: 'Case Number', fieldName: 'Case_Number__c', sortable: true, sortedBy: 'Case_Number__c'},
	{label: 'Case Name', fieldName: 'Name', sortable: true, sortedBy: 'Name'},
	{type: 'action', typeAttributes: { rowActions: actions }}
];

export default class CaseMemberHierarchy extends LightningElement {
	@track columns = columns;
	@track error;
	@track d = null;
	@track litifyCases = null;
	@track modalIsOpen = false;
	@track showAssociations = false;
	@track sortBy;
	@track sortDirection;
	
	connectedCallback() {
		this.loadLitifyCases();	
	}

	openModal() {
		this.modalIsOpen = true;
	}

	closeModal() {
		// todo: look into this - already making a round trip to save and a new value is being returned, figure out how to use that instead of making another apex call 
		this.loadLitifyCases();
		this.litifyCaseId = null;
		this.modalIsOpen = false;
	}

	handleSortData(event) {
		this.sortBy = event.detail.fieldName;
		this.sortDirection = event.detail.sortDirection;
		this.sortData(event.detail.fieldName, event.detail.sortDirection);
	}

   sortData(fieldname, direction) {
		// serialize the data before calling sort function
		let parseData = JSON.parse(JSON.stringify(this.litifyCases));

		// Return the value stored in the field
		let keyValue = (a) => {
			return a[fieldname];
		};

		// cheking reverse direction 
		let isReverse = direction === 'asc' ? 1: -1;

		// sorting data 
		parseData.sort((x, y) => {
			x = keyValue(x) ? keyValue(x) : '';
			y = keyValue(y) ? keyValue(y) : '';

			// sorting values based on direction
			return isReverse * ((x > y) - (y > x));
		});

		// set the sorted data to data table data
		this.litifyCases = parseData;

}

	loadLitifyCases() {
		getAllLitifyCases()
			.then(results => {
				this.litifyCases = results;
			})
			.catch(error => {
				// TODO: show/handle error
				this.error = error;	
			})
	}
	
	handleRowAction(event) {
		const actionName = event.detail.action.name;
		const row = event.detail.row;
		this.showAssociations = false;
		switch (actionName) {
			case 'show_details':
				this.litifyCaseId = row.Id;
				this.openModal();
				break;
			case 'view_associations':
				this.litifyCaseId = row.Id;
				this.showAssociations = true;
				let associationsComponent = this.template.querySelector('c-associations');
				if(associationsComponent) {
					associationsComponent.caseId = this.litifyCaseId;
					associationsComponent.reloadAssociations();
				}
				break;
			default:
		}
	}
}