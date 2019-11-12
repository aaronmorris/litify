public with sharing class LWCAssociationsController {
	@AuraEnabled(cacheable=false)
	public static List<Litify_Association__c> getAssociationsByCase(Id caseId){
		List<Litify_Association__c> associations = [
			SELECT  
				Id,
				Name,
				Role__c,
				Parent_Association__c
			FROM Litify_Association__c
			WHERE 
				Id IN (SELECT Litify_Association__c FROM Litify_Case_Association__c WHERE Litify_Case__c = :caseId)
				AND Parent_Association__c = NULL
			ORDER BY Name
		];

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
			ORDER BY Name
		];

		associations.addAll(childAssociations);
		return associations;
	}

	@AuraEnabled
	public static Litify_Association__c addAssociation(Id caseId, String name, String role, String otherRole, Id parentAssociationId) {
		Litify_Association__c association = new Litify_Association__c(
			Name = name,
			Role__c = role,
			Other_Role__c = otherRole,
			Parent_Association__c = parentAssociationId
		);

		insert association;

		Litify_Case_Association__c caseAssociation = new Litify_Case_Association__c(
			Litify_Case__c = caseId,
			Litify_Association__c = association.Id
		);

		insert caseAssociation;

		return association;
	}
}
