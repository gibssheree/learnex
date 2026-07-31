---
tags: [programming-language, enterprise, crm, salesforce]
category: Niche
status: to-learn
---

# Apex

**Definition:** Salesforce’s proprietary, strongly typed language for customizing and extending the Salesforce CRM platform.

**Paradigm:** OOP | **Typing:** Static

## Pros
- Deep native integration with Salesforce data, validation rules, triggers, and workflows.
- Works directly with standard objects, custom objects, SOQL, and platform events.
- Strong demand in enterprise Salesforce consulting and admin/developer hybrid roles.
- Designed around governed enterprise workflows rather than generic application building.

## Cons
- Locked to Salesforce, so the language is only useful when that platform is in scope.
- Governor limits constrain CPU time, queries, heap size, and callouts.
- Development is shaped by platform release cycles and metadata-driven behavior.
- Outside the ecosystem, the language has little standalone utility.

## Best For
- Customizing Salesforce CRM behavior and business automation.
- Enterprise teams that need platform-native code alongside declarative configuration.

## Real Examples
- Apex triggers that react to inserts, updates, and deletes in CRM data.
- Enterprise orgs use Apex for validation, service automation, and integration glue.

## Use Cases
- CRM customization, trigger logic, and org-specific business rules.
- Service automation, batch jobs, and integration orchestration in Salesforce.
- Example:

```apex
trigger AccountTrigger on Account (before insert) {
	for (Account a : Trigger.new) {
		if (String.isBlank(a.Name)) {
			a.Name.addError('Name required');
		}
	}
}
```

## Extended Syntax & Features

Apex is a proprietary language with syntax heavily inspired by Java. It compiles and executes directly on the Salesforce Lightning Platform. Apex provides built-in support for DML (Data Manipulation Language) and SOQL (Salesforce Object Query Language), allowing developers to interact with the database natively within their code.

### Core Data Types and Variables

Apex supports standard primitive data types, as well as complex collections and custom types known as sObjects (Salesforce Objects).

- **Primitives**: `Integer`, `Long`, `Double`, `Decimal`, `Boolean`, `String`, `Date`, `Time`, `Datetime`, `ID`, and `Blob`.
- **Collections**: `List`, `Set`, `Map`. Note that Arrays are essentially the same as `List` in Apex.
- **sObjects**: Variables that represent any standard or custom object stored in Salesforce, such as `Account`, `Contact`, `Opportunity`, or `MyCustomObject__c`.

```apex
Integer userAge = 35;
String userName = 'John Doe';
Boolean isActive = true;
Decimal accountBalance = 1500.75;
Date birthDate = Date.newInstance(1990, 5, 20);
ID currentRecordId = '0015g00000abcdeAAA';

List<String> namesList = new List<String>{'Alice', 'Bob', 'Charlie'};
Set<Id> uniqueIds = new Set<Id>();
Map<Id, Account> accountMap = new Map<Id, Account>();
```

### Control Flow and Iteration

Apex relies on traditional procedural control flow blocks such as `if-else`, `switch`, `for`, `while`, and `do-while` loops.

- **If-Else Blocks**: Standard conditional branching.
- **Switch Statements**: Introduced later in the language evolution to replace extensive `if-else` chains.
- **For Loops**: Including traditional loops, iteration over lists/sets, and the all-important SOQL `for` loops.

```apex
// Traditional if-else
if (userAge > 18) {
    System.debug('User is an adult.');
} else {
    System.debug('User is a minor.');
}

// Switch statement
String status = 'Open';
switch on status {
    when 'Open' {
        System.debug('Task is new.');
    }
    when 'In Progress' {
        System.debug('Task is being worked on.');
    }
    when else {
        System.debug('Task is complete or cancelled.');
    }
}
```

### Built-in Query Languages: SOQL and SOSL

One of Apex's most powerful features is its native support for database queries through **SOQL** and **SOSL**.

- **SOQL** (Salesforce Object Query Language): Designed to query specific records based on criteria. Syntactically similar to SQL but without `SELECT *`.
- **SOSL** (Salesforce Object Search Language): Designed for text-based searches across multiple objects simultaneously.

```apex
// Inline SOQL Query
List<Contact> contacts = [
    SELECT Id, FirstName, LastName, Email 
    FROM Contact 
    WHERE AccountId = :currentRecordId 
    LIMIT 50
];

// Inline SOSL Query
List<List<SObject>> searchList = [
    FIND 'Joe' 
    IN ALL FIELDS 
    RETURNING Account(Name), Contact(FirstName, LastName)
];
```

## Advanced Concepts

### Multitenant Architecture and Governor Limits

Because Salesforce operates in a multitenant cloud environment (many customers share the same database and resources), strict computational rules called "Governor Limits" are enforced. These limits ensure that no single customer can monopolize the shared resources.

- **SOQL Limits**: A maximum of 100 synchronous SOQL queries per transaction.
- **DML Limits**: A maximum of 150 DML statements per transaction, operating on a maximum of 10,000 records.
- **CPU Time Limits**: A maximum of 10,000 milliseconds (10 seconds) of CPU time for synchronous transactions.
- **Heap Size Limits**: 6 MB of memory for synchronous transactions.

Exceeding these limits throws an uncatchable exception (e.g., `LimitException`), terminating the entire transaction and rolling back any uncommitted data.

### Bulkification

Bulkification is the concept of writing Apex code so that it can properly handle processing multiple records at once. Due to Governor Limits, it is mandatory to write bulkified code, especially in triggers. Code must be written assuming that arrays or lists of records will be processed, rather than single records.

### Asynchronous Apex

For processes that require higher limits or long execution times, Apex provides asynchronous models:

- **Future Methods**: Run in the background asynchronously. Annotated with `@future`. Best for callouts and simple operations. Can only accept primitive types.
- **Queueable Apex**: Similar to `@future` but supports complex objects, allows chaining of jobs, and provides an ID for monitoring.
- **Batch Apex**: Used for processing large volumes of data (up to 50 million records). Interfaces with `Database.Batchable`.
- **Scheduled Apex**: Allows scheduling classes to run at specific intervals. Interfaces with `Schedulable`.

### Sharing and Security (With Sharing vs. Without Sharing)

Apex runs in "System Context" by default, meaning the code has access to all objects and fields, ignoring the user's permissions and sharing rules. Developers control data visibility using sharing keywords:

- `with sharing`: Enforces the current user's sharing rules.
- `without sharing`: Ignores user sharing rules (executes with full visibility).
- `inherited sharing`: Adopts the sharing behavior of the class that called it. This is the recommended default.

### Execution Context and Triggers

An execution context includes everything that happens when a process starts to when it finishes, acting as a single transaction. A trigger can cascade into other triggers or workflow rules. A static variable will retain its value for the duration of this context, which is heavily used for preventing recursion.

## Ecosystem & Tooling

Salesforce provides a robust, heavily tailored ecosystem for managing and deploying code. Since the code executes entirely server-side on Salesforce's infrastructure, local execution is not possible.

### IDEs and Extensions

- **Visual Studio Code (VS Code)**: The primary and officially recommended IDE for Salesforce development. The **Salesforce Extension Pack** is a bundle of extensions providing syntax highlighting, code completion, testing tools, and deployment commands.
- **Illuminated Cloud**: A highly regarded, paid plugin for IntelliJ IDEA, known for intelligent code completion, refactoring tools, and robust integration with the platform.
- **Developer Console**: A web-based, integrated development environment directly inside the Salesforce UI. Useful for quick debugging, testing, and writing one-off scripts, but not suitable for large-scale development.

### Command Line Interfaces

- **Salesforce CLI (sf / sfdx)**: A powerful command-line interface that enables developers to authorize environments, retrieve/deploy metadata, execute anonymous Apex, run tests, and manage scratch orgs.

### Testing and CI/CD

- **Apex Test Framework**: Salesforce requires a minimum of 75% code coverage for all Apex code deployed to a production environment. The built-in testing framework requires writing test classes with the `@isTest` annotation.
- **Scratch Orgs**: Temporary, source-driven Salesforce environments used for development and testing. They are designed to be ephemeral and easily spun up via the CLI.
- **CI/CD Platforms**: Jenkins, GitHub Actions, GitLab CI, and Copado are heavily utilized in enterprise Salesforce practices to move metadata changes between development, staging, and production environments securely.

## Code Examples

### 1. The Classic "Hello World" and Anonymous Apex
Apex code can be executed dynamically through "Anonymous Apex" blocks for quick data manipulation or testing.
```apex
// Executable via the Developer Console or Salesforce CLI
String greeting = 'Hello, Salesforce World!';
System.debug(greeting); // This prints to the execution log
```

### 2. DML Operations and Bulkification
This example shows how to perform DML on a list of records rather than inside a loop. This is the cornerstone of Apex best practices.
```apex
public class AccountService {
    
    // Bulkified method to update Account ratings
    public static void updateAccountRatings(List<Account> accountsToUpdate) {
        // We only operate on the list passed in. We do not query inside a loop!
        for (Account acc : accountsToUpdate) {
            if (acc.AnnualRevenue != null && acc.AnnualRevenue > 1000000) {
                acc.Rating = 'Hot';
            } else {
                acc.Rating = 'Cold';
            }
        }
        
        // One single DML statement to update all modified records
        try {
            update accountsToUpdate;
        } catch (DmlException e) {
            System.debug('An error occurred during update: ' + e.getMessage());
        }
    }
}
```

### 3. Asynchronous Execution: Batch Apex
When you need to update thousands of records, synchronous Apex will fail due to limit constraints. Batch Apex processes records in small chunks (default 200).

```apex
global class AccountRevenueBatch implements Database.Batchable<sObject>, Database.Stateful {
    
    global Integer recordsProcessed = 0;
    
    // Start method queries the data locator to feed into the execute method
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id, AnnualRevenue, Rating FROM Account WHERE AnnualRevenue = null'
        );
    }
    
    // Execute method processes chunks of the overall result set
    global void execute(Database.BatchableContext bc, List<Account> scope) {
        List<Account> accountsToUpdate = new List<Account>();
        
        for (Account acc : scope) {
            acc.AnnualRevenue = 0; // Defaulting null revenues to zero
            acc.Rating = 'Cold';
            accountsToUpdate.add(acc);
            recordsProcessed++;
        }
        
        update accountsToUpdate;
    }
    
    // Finish method is called after all chunks have been processed
    global void finish(Database.BatchableContext bc) {
        System.debug('Total records processed: ' + recordsProcessed);
        // Optional: Send an email notification to the administrator
    }
}

// To execute: Database.executeBatch(new AccountRevenueBatch(), 200);
```

### 4. Apex Trigger Architecture: Trigger Handlers
A single trigger per object is considered a best practice. Logic should be delegated to handler classes.

```apex
// AccountTrigger.trigger
trigger AccountTrigger on Account (before insert, before update, after insert, after update) {
    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
            AccountTriggerHandler.beforeInsert(Trigger.new);
        } else if (Trigger.isUpdate) {
            AccountTriggerHandler.beforeUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}

// AccountTriggerHandler.cls
public with sharing class AccountTriggerHandler {
    
    public static void beforeInsert(List<Account> newAccounts) {
        for (Account acc : newAccounts) {
            // Apply business rules
            if (String.isBlank(acc.Description)) {
                acc.Description = 'Default description applied on creation.';
            }
        }
    }
    
    public static void beforeUpdate(List<Account> newAccounts, Map<Id, Account> oldAccountsMap) {
        for (Account acc : newAccounts) {
            Account oldAcc = oldAccountsMap.get(acc.Id);
            // Check if a specific field was changed
            if (acc.Phone != oldAcc.Phone) {
                System.debug('Phone number was updated for Account: ' + acc.Name);
            }
        }
    }
}
```

### 5. Writing Unit Tests in Apex
Salesforce requires tests to validate business logic and deploy to production.

```apex
@isTest
private class AccountServiceTest {
    
    // Test setup method creates data once for all test methods in this class
    @testSetup
    static void setupTestData() {
        List<Account> testAccounts = new List<Account>();
        testAccounts.add(new Account(Name = 'High Revenue Corp', AnnualRevenue = 5000000));
        testAccounts.add(new Account(Name = 'Low Revenue LLC', AnnualRevenue = 50000));
        insert testAccounts;
    }
    
    @isTest
    static void testUpdateAccountRatings() {
        // Query the test data created in @testSetup
        List<Account> accts = [SELECT Id, Name, AnnualRevenue, Rating FROM Account];
        
        // Start test execution bounds
        Test.startTest();
        AccountService.updateAccountRatings(accts);
        Test.stopTest(); // Forces asynchronous processes to complete and resets governor limits
        
        // Verify results using System.assert
        List<Account> updatedAccts = [SELECT Id, Name, Rating FROM Account];
        for (Account acc : updatedAccts) {
            if (acc.Name == 'High Revenue Corp') {
                System.assertEquals('Hot', acc.Rating, 'High revenue account should be rated Hot');
            } else if (acc.Name == 'Low Revenue LLC') {
                System.assertEquals('Cold', acc.Rating, 'Low revenue account should be rated Cold');
            }
        }
    }
}
```

### 6. Making REST API Callouts
Apex can integrate with external systems via HTTP callouts.

```apex
public class CurrencyConverter {
    
    @future(callout=true)
    public static void updateExchangeRates() {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.exchangerate-api.com/v4/latest/USD');
        request.setMethod('GET');
        
        try {
            HttpResponse response = http.send(request);
            if (response.getStatusCode() == 200) {
                // Deserialize JSON response
                Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                Map<String, Object> rates = (Map<String, Object>) results.get('rates');
                
                Decimal euroRate = (Decimal) rates.get('EUR');
                System.debug('Current USD to EUR rate: ' + euroRate);
                
                // You could subsequently store this in a custom setting or object
            } else {
                System.debug('Callout failed with status: ' + response.getStatus());
            }
        } catch(System.CalloutException e) {
            System.debug('Callout exception: ' + e.getMessage());
        }
    }
}
```

## Best Practices

Developing in Apex requires adopting defensive programming techniques due to governor limits and multitenancy. Failure to follow best practices routinely leads to broken organizations, failed deployments, and corrupt data integrations.

### 1. Bulkify Everything
Never assume your code is running for just a single record. Always write logic to process collections (`List`, `Set`, `Map`). A data import wizard, an API integration, or bulk updating from list views will immediately break single-record-centric code.

### 2. Avoid SOQL and DML Inside Loops
This is the cardinal sin of Apex. Placing a query or an update statement inside a loop ensures that you will hit the 100 SOQL query limit or 150 DML statement limit when processing batches of records. Instead, loop through records, add the IDs or data to a collection, and perform a single SOQL query or DML operation on the collection outside the loop.

### 3. One Trigger Per Object
Having multiple triggers on a single object (e.g., two `Account` triggers) leads to an unpredictable execution order. Standardize by creating one central trigger per object and delegating logic to Handler classes.

### 4. Context-Specific Handler Methods
Create trigger handlers that define specific methods for different execution contexts (e.g., `beforeInsert`, `afterUpdate`). This makes it significantly easier to trace when and why logic executes.

### 5. Control Recursion
Triggers can inadvertently fire other triggers or fire themselves again, leading to infinite loops and maximum trigger depth errors. Use static boolean variables in a utility class to ensure specific logic only runs once per transaction context.

### 6. Use Limits Methods
Use the built-in `Limits` class (e.g., `Limits.getQueries()`, `Limits.getLimitQueries()`) to proactively check your usage relative to the bounds. This allows your code to fail gracefully or hand off work to asynchronous processes before crashing.

### 7. Enforce Object and Field Level Security
Unlike declarative tools, Apex can bypass a user's permissions. Always verify whether a user is allowed to read, create, update, or delete fields and objects using `Schema.DescribeSObjectResult` methods (e.g., `isAccessible()`, `isUpdateable()`) or by using the `WITH SECURITY_ENFORCED` clause in your SOQL queries.

### 8. Comprehensive Code Coverage
Aim for substantially more than the required 75% coverage. Test classes should assert both positive and negative behaviors (what happens when bad data is supplied?), as well as bulk testing (creating 200 records at once to ensure your triggers are properly bulkified). Run your tests without `SeeAllData=true` to isolate them from real org data.
