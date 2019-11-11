import { LightningElement, api, track } from 'lwc';
import getAssociations from '@salesforce/apex/LWCAssociationsController.getAssociationsByCase';
import { showToastMessage } from 'c/utilities';

const columns = [
	{label: 'Name', fieldName: 'label', type: 'text'},
	{label: 'Role', fieldName: 'metatext', type: 'text'},
	{label: 'Action', type: 'button', typeAttributes: { label: {fieldName: 'actionLabel'}, title: 'Show Details', name: 'view_details', disabled: {fieldName: 'actionDisabled'}, class:'btn_next'}}
	// {label: 'id', fieldName: 'associationId', type: 'hidden'}
];
export default class associations extends LightningElement {
	@api caseName;
	@api caseId;

	@track associationData = [];
	@track columns = columns;
	@track jsonData;

	@api
	reloadAssocations() {
		console.log('reload associations');
		this.loadAssocations();
	}

	connectedCallback() {
		this.loadAssocations();
	}

	handleRowAction(event) {
		const row = event.detail.row;
		console.log('handleRowAction');
		console.log(JSON.stringify(row));
		console.log('ID: ' + row.id);
		console.log('parentId: ' + row.parentId);
	}

	loadAssocations() {
		getAssociations({caseId: this.caseId})
			.then(results => {
				this.associationData = [];
				let associationMap = new Map();
				for (let i = 0; i < results.length; i++) {
					let parentId = results[i].Parent_Association__c;
					if (parentId == null) {
						associationMap.set(results[i].Id, {associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, items: [], _children: [], actionLabel: 'Add Child Association', actionDisabled: null});
					}
					else {
						let existingAssociation = associationMap.get(parentId);
						if (existingAssociation != null) {
							console.log('existing association: ', existingAssociation);
							existingAssociation.items.push({associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, actionLabel: null, actionDisabled: true});
							existingAssociation._children.push({associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, actionLabel: null, actionDisabled: true});
						}
						else {
							console.log('value not found in map with parent Id: ' + parentId);
						}

						associationMap.set(parentId, existingAssociation);
					}
				}

				for (let associationItem of associationMap.values()) {
					this.associationData.push(associationItem);
				}

				this.associationData.push({label: null, metatext: null, actionLabel: 'Add Association'});

				this.jsonData = JSON.stringify(this.associationData, null, '\t');
				console.log('jsonData: ', this.jsonData);
			})
			.catch(error => {
				console.log('error');
				console.log(error);
				console.log(error.body);
				console.log(error.message);
				showToastMessage('error', 'Error', error.message);
			});
		}
}