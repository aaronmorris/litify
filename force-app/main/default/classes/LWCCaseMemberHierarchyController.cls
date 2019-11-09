public with sharing class LWCCaseMemberHierarchyController {
    @AuraEnabled(cacheable=false)
    public static List<Litify_Case__c> getAllLitifyCases() {
        List<Litify_Case__c> litifyCases = [
            SELECT 
                Id,
                Name,
                Case_Name__c
            FROM
                Litify_Case__c
        ];

        System.debug('>>> litifyCases: ' + litifyCases);
        return litifyCases;
    }
}
