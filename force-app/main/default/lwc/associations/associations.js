import { LightningElement, api, track } from 'lwc';
import getAssociations from '@salesforce/apex/LWCAssociationsController.getAssociationsByCase';
import addAssociation from '@salesforce/apex/LWCAssociationsController.addAssociation';
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
	@track currentAssociationId;
	@track currentParentId;
	@track showParent;
	@track jsonData;
	@track modalIsOpen = false;

	@api
	reloadAssociations() {
		console.log('reload associations');
		console.log('caseId: ' + this.caseId);
		this.loadAssociations();
	}

	connectedCallback() {
		console.log('associations.connectedCallback');
		this.loadAssociations();
	}

	handleRowAction(event) {
		const row = event.detail.row;
		if (row.actionDisabled) {
			console.log('should not have clicked this, bail out');
			return;
		}
		console.log('handleRowAction');
		console.log(JSON.stringify(row));
		console.log('ID: ' + row.associationId);
		console.log('parentId: ' + row.parentId);
		if (row.associationId == null) {
			console.log('adding direct association');
			this.currentParentId = null;
			this.showParent = false;
		}
		else {
			console.log('add child association');
			this.currentParentId = row.associationId;
			this.showParent = true;
		}

		this.modalIsOpen = true;
	}

	closeModal() {
		this.modalIsOpen = false;
	}

	saveMethod() {
		console.log('save fool');
		let role = this.template.querySelector('[data-id="role"]').value;
		let name = this.template.querySelector('[data-id="name"]').value;
		console.log('role: ' + role);
		console.log('name: ' + name);

		// Id caseId, String name, String role, String otherRole, Id parentAssociationId
		addAssociation({caseId: this.caseId, name: name, role: role, otherRole: null, parentAssociationId: this.currentParentId}).then(result => {
			console.log('result: ' + result);
			this.modalIsOpen = false;
			this.currentParentId = null;
			// TODO: 
			//this.associationData.push({label: 'dummy', metatext: 'dummy', actionLabel: 'Add Association'});
			this.loadAssociations();
		}).catch(error => {
			console.log('errors: ');
			console.log(error);
			console.log(error.body.message);
			showToastMessage('Error', 'Error!', error.body.message);
		})
	}

	loadAssociations() {
		getAssociations({caseId: this.caseId})
			.then(results => {
				this.associationData = [];
				let associationMap = new Map();
				for (let i = 0; i < results.length; i++) {
					let parentId = results[i].Parent_Association__c;
					if (parentId == null) {
						associationMap.set(results[i].Id, {associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, items: [], actionLabel: 'Add Child Association', actionDisabled: null});
					}
					else {
						let existingAssociation = associationMap.get(parentId);
						if (existingAssociation != null) {
							console.log('existing association: ', existingAssociation);
							existingAssociation.items.push({associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, actionLabel: null, actionDisabled: true});
							if (existingAssociation._children == null) {
								existingAssociation._children = [];
							}
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
				// console.log('jsonData: ', this.jsonData);
			})
			.catch(error => {
				// console.log('error');
				// console.log(error);
				// console.log(error.body);
				// console.log(error.message);
				showToastMessage('error', 'Error', error.message);
			});
		}
}