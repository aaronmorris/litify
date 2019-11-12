declare module "@salesforce/apex/LWCAssociationsController.getAssociationsByCase" {
  export default function getAssociationsByCase(param: {caseId: any}): Promise<any>;
}
declare module "@salesforce/apex/LWCAssociationsController.addAssociation" {
  export default function addAssociation(param: {caseId: any, name: any, role: any, otherRole: any, parentAssociationId: any}): Promise<any>;
}
declare module "@salesforce/apex/LWCAssociationsController.removeAssociation" {
  export default function removeAssociation(param: {associationId: any, caseId: any}): Promise<any>;
}
