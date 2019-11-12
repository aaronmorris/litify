public with sharing class LWCCaseMemberHierarchyController {
    @AuraEnabled
    public static List<Litify_Case__c> getAllLitifyCases() {
        List<Litify_Case__c> litifyCases = [
            SELECT 
                Id,
                Name,
                Case_Number__c
            FROM
                Litify_Case__c
        ];

        System.debug('>>> litifyCases: ' + litifyCases);
        return litifyCases;
    }
}
