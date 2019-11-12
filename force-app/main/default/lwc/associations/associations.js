import { LightningElement, api, track } from 'lwc';
import getAssociations from '@salesforce/apex/LWCAssociationsController.getAssociationsByCase';
import addAssociation from '@salesforce/apex/LWCAssociationsController.addAssociation';
import removeAssociation from '@salesforce/apex/LWCAssociationsController.removeAssociation';
import { showToastMessage } from 'c/utilities';

const actions = [
	{ label: 'Add Child Assoication', name: 'add_association' },
	{ label: 'Remove Associations', name: 'remove_associations'}
];

const columns = [
	{label: 'Id', fieldName: 'associationId', type: 'text'},
	{label: 'Name', fieldName: 'label', type: 'text'},
	{label: 'Role', fieldName: 'metatext', type: 'text'},
	// {label: 'Add Association', type: 'button', typeAttributes: { label: {fieldName: 'actionLabel'}, title: 'Add New Association', disabled: {fieldName: 'actionDisabled'}, class:'btn_next'}, name: 'add', action: 'add'},
	// {label: 'Remove Association', type: 'button', typeAttributes: {label: {fieldName: 'removeLabel'}, title: 'Remove Assocation', disabled: {fieldName: 'removeDisabled'}, class:'btn_next'}, name: 'remove', action: 'remove'},
	{type: 'action', typeAttributes: { rowActions: actions }}
];
export default class associations extends LightningElement {
	@api caseName;
	@api caseId;

	@track associationData = [];
	@track associationName;
	@track columns = columns;
	@track currentAssociationId;
	@track currentParentId;
	@track showParent;
	@track jsonData;
	@track modalIsOpen = false;
	@track removeModalIsOpen = false;

	@api
	reloadAssociations() {
		this.loadAssociations();
	}

	connectedCallback() {
		this.loadAssociations();
	}

	handleRowAction(event) {
		const row = event.detail.row;
		console.log('row: ', row);
		console.log('row.parent: ', row.parent);
		const actionName = event.detail.action.name;
		if (actionName == 'add_association') {
			if (row.parentId != null) {
				// TODO: hide or disable the option if user is unable to add an association
				// TODO: revist this when recursion is enabled
				showToastMessage('Error', 'Error', 'Cannot add child association to a child association');
				return;
			}
			else {
				if (row.items == null) {
					this.currentParentId = null;
					this.showParent = false;
				}
				else {
					this.currentParentId = row.associationId;
					this.showParent = true;
				}
				this.modalIsOpen = true;
			}
		}
		else if (actionName == 'remove_associations') {
			if (row.items != null && row.items.length > 0) {
				// TODO: hide or disable the option is user is unable to remove the association
				showToastMessage('Error', 'Error', 'Cannot remove an association that has child associations');
				return;
			}
			this.associationName = row.label;
			this.currentAssociationId = row.associationId;
			this.removeModalIsOpen = true;
		}
	}

	closeModal() {
		this.modalIsOpen = false;
	}

	closeRemoveModal() {
		this.removeModalIsOpen = false;
	}

	saveMethod() {
		let role = this.template.querySelector('[data-id="role"]').value;
		let name = this.template.querySelector('[data-id="name"]').value;

		addAssociation({caseId: this.caseId, name: name, role: role, otherRole: null, parentAssociationId: this.currentParentId}).then(result => {
			this.modalIsOpen = false;
			this.currentParentId = null;
			this.currentAssociatoinId = null;
			this.loadAssociations();
		}).catch(error => {
			showToastMessage('Error', 'Error!', error.body.message);
		})
	}

	removeMethod() {
		removeAssociation({associationId: this.currentAssociationId, caseId: this.caseId}).then(results => {
			this.currentParentId = null;
			this.currentAssociationId = null;
			this.removeModalIsOpen = false;
			this.loadAssociations();
		})
		.catch(error => {
			showToastMessage('error', 'Error', error.message);
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
						associationMap.set(results[i].Id, {associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, items: [], actionLabel: 'Add Child Association', actionDisabled: null, removeLabel: 'Remove Association 1', removeDisabled: false});
					}
					else {
						let existingAssociation = associationMap.get(parentId);
						if (existingAssociation != null) {
							console.log('a');
							existingAssociation.items.push({associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, actionLabel: null, actionDisabled: true, removeDisabled: true});
							console.log('b');
							if (existingAssociation._children == null) {
								existingAssociation._children = [];
								existingAssociation.removeLabel = null;
								existingAssociation.removeDisabled = true;
							}
							console.log('c');
							existingAssociation._children.push({associationId: results[i].Id, label: results[i].Name, metatext: results[i].Role__c, parentId: results[i].Parent_Association__c, actionLabel: null, actionDisabled: true, removeLabel: 'Remove Association 3', removeDisabled: false});
							console.log('d');
						}

						associationMap.set(parentId, existingAssociation);
					}
				}

				for (let associationItem of associationMap.values()) {
					console.log('set id: ' + associationItem.associationId);
					this.associationData.push(associationItem);
				}

				// TODO: Replace this with a better add row
				this.associationData.push({label: null, metatext: null, actionLabel: 'Add Association'});
			})
			.catch(error => {
				showToastMessage('error', 'Error', error.message);
			});
		}
}