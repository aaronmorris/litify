public with sharing class LWCAssociationsController {
	@AuraEnabled
	// public static Map<Id, Association> getAssociationsByCase(Id caseId){
	public static List<Litify_Association__c> getAssociationsByCase(Id caseId){
		System.debug('>>> caseId: ' + caseId);
		List<Litify_Association__c> associations = [
			SELECT  
				Id,
				Name,
				Role__c,
				Parent_Association__c
			FROM Litify_Association__c
			WHERE 
				Id IN (SELECT Litify_Association__c FROM Litify_Case_Association__c WHERE Litify_Case__c = :caseId)
		];

		System.debug('>>> associations: ' + associations);

		List<Id> potentialParentIds = new List<Id>();
		for (Litify_Association__c association : associations) {
			potentialParentIds.add(association.Id);
		}

		List<Litify_Association__c> childAssociations = [
			SELECT 
				Id, 
				Name, 
				Role__c, 
				Parent_Association__c
			FROM Litify_Association__c
			WHERE Parent_Association__c IN :potentialParentIds
		];

		System.debug('>>> child assoications: ' + childAssociations);

		associations.addAll(childAssociations);
		System.debug('>>> associations: ' + associations);
		return associations;
	}

	// public static Map<Id, Association> getChildAssociations(List<Id> parentAssociationIds) {
	// 	Map<Id, Association> assoicationTreeMap = new Map<Id, Association>();
	// 	List<Association> associations = new List<Association>();
	// 	for (Litify_Association__c litifyAssociation : getAssociationsByParentIds(parentAssociationIds)) {
	// 		Association tempAssociation = assoicationTreeMap.get(litifyAssociation.Parent_Association__c);
	// 		if (tempAssociation == null) {
	// 			System.debug('>>> new');
	// 			tempAssociation = new Association(litifyAssociation);
	// 		}
	// 		else {
	// 			System.debug('>>> update');
	// 			Association childAssociation = new Association();
	// 			childAssociation.Name = litifyAssociation.Name;
	// 			childAssociation.Role = litifyAssociation.Role__c;
	// 			// childAssociation.Id = litifyAssociation.Id;
	// 			childAssociation.items = null;
	// 			tempAssociation.items.add(childAssociation);
	// 		}

	// 		System.debug('>>> tempAssociation: ' + tempAssociation);

	// 		assoicationTreeMap.put(litifyAssociation.Parent_Association__c, tempAssociation);
	// 	}

	// 	System.debug('>>> assoicationTreeMap: '+ assoicationTreeMap);
	// 	return assoicationTreeMap;
	// }

	private static List<Litify_Association__c> getAssociationsByParentIds(List<Id> parentAssociationIds) {
		List<Litify_Association__c> associations = [
			SELECT 
				Id, 
				Name, 
				Role__c, 
				Parent_Association__c, 
				Parent_Association__r.Name,
				Parent_Association__r.Role__c 
			FROM Litify_Association__c 
			WHERE Parent_Association__c IN :parentAssociationIds];

		return associations;
	}

	// public class Association {
		
	// }
}
