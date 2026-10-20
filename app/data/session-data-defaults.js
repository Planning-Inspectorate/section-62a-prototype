
// default test case (available on FO)
export const cases = [
  {
    "reference": "S62A/2026/0048",
    "status": "New",
    "applicationStage": "Application",
    "preApplicationRequested": "Yes - PINS",
    "preApplicationReferencePins": "S62A/2026/0000049/PRE",
    "applicationClassification": "Major",
    "applicationType": "Planning permission",
    "lpa": "Camden London Borough Council",
    "lpaContact": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@camden.gov.uk",
      "phone": "02079744444"
    },
    "hasSecondaryLpa": "No",
    "secondaryLpa": null,
    "secondaryLpaContact": null,
    "hasAgent": "No",
    "agentOrgName": null,
    "agentAddress": null,
    "agentContacts": [],
    "applicantType": "Individual",
    "applicantOrgs": [],
    "applicantContacts": [
      {
        "id": "app-con-test-1",
        "firstName": "Michael",
        "lastName": "Doe",
        "email": "michael.doe@example.com",
        "phone": "077283212495",
        "linkedOrg": ""
      }
    ],
    "siteAddress": {
      "line1": "100 High Holborn",
      "line2": "",
      "town": "London",
      "county": "",
      "postcode": "WC1V 6BX"
    },
    "siteCoords": {
      "easting": "530491",
      "northing": "181582"
    },
    "siteArea": "1.2 hectares",
    "devDescription": "Erection of a new community center and associated parking.",
    "expectedSubmissionDate": {
      "day": "15",
      "month": "10",
      "year": "2026"
    },
    "auditLog": [
      {
        "date": "1 August 2026<br>9:00 am",
        "details": "Test Case created automatically",
        "user": "System"
      }
    ],
    "lastModified": "1 August 2026 at 9:00 am",
    "lastModifiedBy": "System",
    "representations": [],
    "publishStatus": "No"
  },
  {
      "reference": "S62A/2026/0000049/PRE",
      "status": "New",
      "applicationStage": "Pre-application",
      "applicationType": "Outline planning permission with all matters reserved",
      "lpa": "Southwark Council",
      "lpaContact": {
        "firstName": "Sam",
        "lastName": "Smith",
        "email": "samsmith@hhlg.com",
        "phone": "077322940534"
      },
      "hasSecondaryLpa": "No",
      "secondaryLpa": null,
      "secondaryLpaContact": null,
      "hasAgent": "Yes",
      "agentOrgName": "Lilac Group",
      "agentAddress": {
        "line1": "21N Bakersfield",
        "line2": "",
        "town": "London",
        "county": "",
        "postcode": "NW2 1DD"
      },
      "agentContacts": [
        {
          "id": "agent-1788425948556",
          "firstName": "Mark",
          "lastName": "Evans",
          "email": "mark.evans@outlook.com",
          "phone": ""
        }
      ],
      "applicantType": "Organisation",
      "applicantOrgs": [
        {
          "id": "org-1788425958018",
          "orgName": "Building and Housing Guys LTD",
          "address": {
            "line1": "130 Nova South",
            "line2": "",
            "town": "London",
            "county": "",
            "postcode": "W1 2DG"
          }
        }
      ],
      "applicantContacts": [
        {
          "id": "app-con-1788425968516",
          "firstName": "Michael",
          "lastName": "Alto",
          "email": "michaelalto@lilac.co.uk",
          "phone": "099384335502",
          "linkedOrg": "org-1788425958018"
        }
      ],
      "siteAddress": {
        "line1": "1 Bertoldt Road",
        "line2": "",
        "town": "Bristol",
        "county": "",
        "postcode": "BS2 2DX"
      },
      "siteCoords": {
        "easting": "",
        "northing": ""
      },
      "siteArea": "123 m²",
      "devDescription": "4 Story building, located in the inner city, with a 24 acre park beside it",
      "notificationReceivedDate": {
        "day": "",
        "month": "",
        "year": ""
      },
      "expectedSubmissionDate": {
        "day": "12",
        "month": "12",
        "year": "2026"
      },
      "representations": [],
      "publishStatus": "No",
      "auditLog": [
        {
          "date": "3 September 2026<br>10:00 am",
          "details": "Case created",
          "user": "User Account"
        }
      ],
      "lastModified": "3 September 2026 at 10:00 am",
      "lastModifiedBy": "User Account"
    }
];

export const folders = [
  // =================================================================
  // CASE 1: S62A/2026/0048 (Application Stage)
  // =================================================================
  
  // --- Root 1: The planning application ---
  { id: "c1-root-1", caseReference: "S62A/2026/0048", name: "The planning application", parentId: null },
      { id: "c1-sub-1", caseReference: "S62A/2026/0048", name: "Application documents (originals)", parentId: "c1-root-1" },
      { id: "c1-sub-2", caseReference: "S62A/2026/0048", name: "Application documents (redacted)", parentId: "c1-root-1" },

  // --- Root 2: Working documents ---
  { id: "c1-root-2", caseReference: "S62A/2026/0048", name: "Working documents", parentId: null },
      { id: "c1-sub-3", caseReference: "S62A/2026/0048", name: "File notes and correspondence", parentId: "c1-root-2" },
      { id: "c1-sub-4", caseReference: "S62A/2026/0048", name: "EIA", parentId: "c1-root-2" },
      { id: "c1-sub-5", caseReference: "S62A/2026/0048", name: "Fees", parentId: "c1-root-2" },
      { id: "c1-sub-6", caseReference: "S62A/2026/0048", name: "Hearings", parentId: "c1-root-2" },
      { id: "c1-sub-7", caseReference: "S62A/2026/0048", name: "Decisions or recommendations", parentId: "c1-root-2" },
      { id: "c1-sub-8", caseReference: "S62A/2026/0048", name: "Representations", parentId: "c1-root-2" },
      { id: "c1-sub-9", caseReference: "S62A/2026/0048", name: "Internal correspondence", parentId: "c1-root-2" },

  // --- Root 3: Pre-application advice ---
  { id: "c1-root-3", caseReference: "S62A/2026/0048", name: "Pre-application advice", parentId: null },


  // =================================================================
  // CASE 2: S62A/2026/0000049/PRE (Pre-application Stage)
  // =================================================================
  
  // --- Root 1: Pre-application ---
  { id: "c2-root-1", caseReference: "S62A/2026/0000049/PRE", name: "Pre-application", parentId: null },
      { id: "c2-sub-1", caseReference: "S62A/2026/0000049/PRE", name: "Applicant's documents", parentId: "c2-root-1" },
      { id: "c2-sub-2", caseReference: "S62A/2026/0000049/PRE", name: "LPA documents", parentId: "c2-root-1" },
      { id: "c2-sub-3", caseReference: "S62A/2026/0000049/PRE", name: "Other", parentId: "c2-root-1" },
      { id: "c2-sub-4", caseReference: "S62A/2026/0000049/PRE", name: "PINS documents", parentId: "c2-root-1" },
      { id: "c2-sub-5", caseReference: "S62A/2026/0000049/PRE", name: "Policy", parentId: "c2-root-1" }
];