public with sharing class LWCAssociationsController {
	@AuraEnabled
	public static List<Litify_Association__c> getAssociations(Id caseId){
		System.debug(caseId);
		List<Litify_Association__c> associations = [
			SELECT  
				Id,
				Name,
				Role__c
			FROM Litify_Association__c
			WHERE Id IN (SELECT Litify_Association__c FROM Litify_Case_Association__c WHERE Litify_Case__c = :caseId)
		];

		System.debug(associations);
		return associations;
	}
}
