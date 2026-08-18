import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../../helpers.js';

const router = Router();

// --- ROUTES ---
router.get('/add-a-representation-start', function (req, res) {
  const data = req.session.data;
  // grab the case ref from the url
  const caseRef = req.query.caseRef;
  
  if (caseRef) {
    // save case ref to session to use in journey
    data['currentBackOfficeCase'] = caseRef;
  }

  // wipe existing form data to prevent ghost data
  const fieldsToClear = [
    'date-the-representation-was-received-day',
    'date-the-representation-was-received-month',
    'date-the-representation-was-received-year',
    'how-was-this-representation-received',
    'reason-for-not-using-online-service',
    'type-of-representation-submitted',
    'source-of-representation',
    'your-first-name',
    'your-last-name',
    'obscure-name',
    'preferred-contact-method',
    'your-email-address',
    'postal-address-line-1',
    'postal-address-line-2',
    'postal-address-town',
    'postal-address-county',
    'postal-address-postcode',
    'written-representation-submitted',
    'would-you-like-to-be-heard-at-a-hearing',
    'are-there-any-attachments',
    'uploadedFiles',
    'representation-made-on-behalf-of',
    'is-agent',
    'agent-organisation-name',
    'name-of-individual-first-name',
    'name-of-individual-last-name',
    'name-of-senders-org-or-charity',
    'senders-job-title-or-role',
    'org-or-charity-being-represented',
    'name-of-the-group',
    'group-name-list'
  ];

  fieldsToClear.forEach(field => {
    delete data[field];
  });

  // redirect to add a rep journey
  res.redirect('/current-service/back-office/manage-representations/add-a-representation/01-date-the-representation-was-received');
});


// 01 - date the representation was received
router.post('/date-the-representation-was-received-answer', function (req, res) {
  const day = req.session.data['date-the-representation-was-received-day'];
  const month = req.session.data['date-the-representation-was-received-month'];
  const year = req.session.data['date-the-representation-was-received-year'];
  // error containers
  const errors = {};
  const errorList = [];
  
  // pass objects to the helper and create error object
  const dateError = validateDate(day, month, year, "Representation received date", "date-the-representation-was-received");

  // set error message from helper
  if (dateError) {
    errors.dateTheRepresentationWasReceived = { text: dateError.text };
    
  // loop array of dateError and create simple flags for the html to add error classes to relevant inputs
  if (dateError.errorFields) {
    dateError.errorFields.forEach(field => {
      errors[field] = true; 
    });
  }
  errorList.push(dateError);
  }
  if (errorList.length > 0) {
    return res.render('current-service/back-office/manage-representations/add-a-representation/01-date-the-representation-was-received', {
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/manage-representations/add-a-representation/02-how-was-this-representation-received');
});


// 02 - how was this representation received
router.post('/how-was-this-representation-received-answer', function (req, res) {
  const howWasThisRepresentationReceived = req.session.data['how-was-this-representation-received'];
  
  // validation
  if (!howWasThisRepresentationReceived) {
    return res.render('current-service/back-office/manage-representations/add-a-representation/02-how-was-this-representation-received', {
        errorHowWasThisRepresentationReceived: "Select how this representation was received"
    });
  }
  res.redirect('/current-service/back-office/manage-representations/add-a-representation/03-reason-for-not-using-online-service');
});


// 03 - reason for not using online service
router.post('/reason-for-not-using-online-service-answer', function (req, res) {
  const reasonForNotUsingOnlineService = req.session.data['reason-for-not-using-online-service'];

  // validation
    // add if needed, this field is optional

    res.redirect('/current-service/back-office/manage-representations/add-a-representation/04-type-of-representation-submitted');
});


// 04 - type of representation submitted
router.post('/type-of-representation-submitted-answer', function (req, res) {
  const typeOfRepresentationSubmitted = req.session.data['type-of-representation-submitted'];

  // validation
    if (!typeOfRepresentationSubmitted) {
     return res.render('current-service/back-office/manage-representations/add-a-representation/04-type-of-representation-submitted', {
        errorTypeOfRepresentationSubmitted: "Select the type of representation submitted"
    });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/05-source-of-the-representation');
});


// 05 - source of representation
router.post('/source-of-representation-answer', function (req, res) {
  const sourceOfRepresentation = req.session.data['source-of-representation'];

  // validation
    if (!sourceOfRepresentation) {
     return res.render('current-service/back-office/manage-representations/add-a-representation/05-source-of-the-representation', {
        errorSourceOfRepresentation: "Select the source of the representation"
    });
    }
    if (sourceOfRepresentation === "Myself") {
      res.redirect('/current-service/back-office/manage-representations/add-a-representation/06-name-of-the-person-submitting-the-representation');
    }
    else if (sourceOfRepresentation === "On behalf of another person, an organisation or group of people") {
      res.redirect('/current-service/back-office/manage-representations/add-a-representation/14-representation-made-on-behalf-of');
    }
});


// 06 - name of the person submitting the representation
router.post('/bo-your-name-answer', function (req, res) {
    const typeOfRepresentationSubmitted = req.session.data['type-of-representation-submitted'];
    const firstName = req.session.data['your-first-name'];
    const lastName = req.session.data['your-last-name'];

    // error containers
    const errors = {};
    const errorList = [];

    // validate name fields
    if (!firstName) {
        errors.firstName = {text: "Enter your first name"};
        errorList.push({ text: "Enter your first name", href: "#your-first-name" });
    }
    if (!lastName) {
        errors.lastName = {text: "Enter your last name"};
        errorList.push({ text: "Enter your last name", href: "#your-last-name" });
    }

    // render errors if any
    if (errorList.length > 0) {
      return res.render('current-service/back-office/manage-representations/add-a-representation/06-name-of-the-person-submitting-the-representation', { 
        errors: errors,
        errorList: errorList
      });
    }
    // redirect based on type of rep submitted
    if (typeOfRepresentationSubmitted === 'Interested party') {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/06a-does-the-interested-party-want-their-name-obscured');
    }
    else if (typeOfRepresentationSubmitted === 'Consultees') {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/07-preferred-contact-method');
    }
});


// 06a - would you like to hide your name from being published
router.post('/obscure-name-answer', function (req, res) {
    const obscureName = req.session.data['obscure-name'];

    // validation
    if (!obscureName) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/06a-does-the-interested-party-want-their-name-obscured', {
            errorObscureName: "Select yes if the interested party wants to obscure their name"
        });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/07-preferred-contact-method');
});


// 07 - preferred contact method
router.post('/preferred-contact-method-answer', function (req, res) {
    const preferredContactMethod = req.session.data['preferred-contact-method'];

    // validation
    if (!preferredContactMethod) {
     return res.render('current-service/back-office/manage-representations/add-a-representation/07-preferred-contact-method', {
        errorPreferredContactMethod: "Select the preferred contact method"
    });
    }
    if (preferredContactMethod === "Email") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/08-email-address-provided');
    }
    else if (preferredContactMethod === "Post") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/09-postal-address-provided');
    }
});


// 08 - email address provided 
router.post('/bo-your-email-address-answer', function (req, res) {
    const yourEmailAddress = req.session.data['your-email-address'];
    const sourceOfRepresentation = req.session.data['source-of-representation'];
    const representationMadeOnBehalfOf = req.session.data['representation-made-on-behalf-of'];

    // validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;

    if (!yourEmailAddress) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/08-email-address-provided', { 
            errorYourEmailAddress: "Enter your email address" 
        });
    }
    if (!emailRegex.test(yourEmailAddress)) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/08-email-address-provided', { 
            errorYourEmailAddress: "Enter your email address in the correct format, like name@example.com" 
        });
    }
    if ( sourceOfRepresentation === "Myself" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted');
    }
    else if ( representationMadeOnBehalfOf === "A person" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/17-name-of-the-individual-being-represented');
    }
    else if ( representationMadeOnBehalfOf === "An organisation or charity that I work or volunteer for" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/18-name-of-senders-organisation-or-charity');
    }
    else if ( representationMadeOnBehalfOf === "An organisation or charity that I do not work or volunteer for" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/20-name-of-organisation-or-charity-being-represented');
    }
    else if ( representationMadeOnBehalfOf === "A group of people" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/21-group-name');
    }
});


// 09 - postal address provided
router.post('/bo-postal-address-answer', function (req, res) {
    const postalAddressLine1 = req.session.data['postal-address-line-1'];
    const postalAddressTown = req.session.data['postal-address-town'];
    const postalAddressPostcode = req.session.data['postal-address-postcode'];
    const postcodeError = validatePostcode(postalAddressPostcode);
    const sourceOfRepresentation = req.session.data['source-of-representation'];
    const representationMadeOnBehalfOf = req.session.data['representation-made-on-behalf-of'];
    
    // error containers
    const errors = {};
    const errorList = [];

    // validation
    if (!postalAddressLine1) {
        errors.postalAddressLine1 = {text: "Enter your address line 1"};
        errorList.push({ text: "Enter your address line 1", href: "#postal-address-line-1" });
    }
    if (!postalAddressTown) {
        errors.postalAddressTown = {text: "Enter your town or city"};
        errorList.push({ text: "Enter your town or city", href: "#postal-address-town" });
    }
    if (!postalAddressPostcode) {
        errors.postalAddressPostcode = {text: "Enter your postcode"};
        errorList.push({ text: "Enter your postcode", href: "#postal-address-postcode" });
    }
    if (postcodeError) {
        errors.postalAddressPostcode = { text: postcodeError };
        errorList.push({ text: postcodeError, href: "#postal-address-postcode" });
    }
    // render errors if any
    if (errorList.length > 0) {
      return res.render('current-service/back-office/manage-representations/add-a-representation/09-postal-address-provided', { 
        errors: errors,
        errorList: errorList
      });
    }
    if ( sourceOfRepresentation === "Myself" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted');
    }
    else if ( representationMadeOnBehalfOf === "A person" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/17-name-of-the-individual-being-represented');
    }
    else if ( representationMadeOnBehalfOf === "An organisation or charity that I work or volunteer for" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/18-name-of-senders-organisation-or-charity');
    }
    else if ( representationMadeOnBehalfOf === "An organisation or charity that I do not work or volunteer for" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/20-name-of-organisation-or-charity-being-represented');
    }
    else if ( representationMadeOnBehalfOf === "A group of people" ) {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/21-group-name');
    }
});


// 10 - written representation submitted
router.post('/written-representation-submitted-answer', function (req, res) {
    const writtenRepresentationSubmitted = req.session.data['written-representation-submitted'];
    
    // validation
    if (!writtenRepresentationSubmitted) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted', {
            errorWrittenRepresentationSubmitted: "Enter what you want to tell us about this proposed application"
        });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/11-would-you-like-to-be-heard-at-a-hearing');
});


// 11 - would you like to be heard at a hearing
router.post('/would-you-like-to-be-heard-at-a-hearing-answer', function (req, res) {
    const wouldYouLikeToBeHeardAtAHearing = req.session.data['would-you-like-to-be-heard-at-a-hearing'];
    
    // validation
    if (!wouldYouLikeToBeHeardAtAHearing) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/11-would-you-like-to-be-heard-at-a-hearing', {
            errorWouldYouLikeToBeHeardAtAHearing: "Select yes if you would like to be heard at a hearing"
        });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/12-are-there-any-attachments');
});



// 12 - are there any attachments
router.post('/are-there-any-attachments-answer', function (req, res) {
    const areThereAnyAttachments = req.session.data['are-there-any-attachments'];
    
    // validation
    if (!areThereAnyAttachments) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/12-are-there-any-attachments', {
            errorAreThereAnyAttachments: "Select yes if there are any attachments"
        });
    }
    if (areThereAnyAttachments === "Yes") {
        return res.render('current-service/back-office/manage-representations/add-a-representation/13-upload-attachments');
    }
     if (areThereAnyAttachments === "No") {
        return res.render('current-service/back-office/manage-representations/add-a-representation/check-your-answers');
    }
});


// 13 - upload attachments
router.post('/bo-upload-supporting-attachments-answer', function(req, res) {
    const uploadedFiles = req.session.data['uploadedFiles'];
    // error containers
    const errors = {};
    const errorList = [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
        errors.uploadedFiles = { text: "Upload an attachment" };
    
        errorList.push({ text: "Upload an attachment", href: "#documents" });
    }

    // If there is an error, re-render the page
    if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/13-upload-attachments', {
            errors: errors,
            errorList: errorList
        });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/check-your-answers');
});


// 14 - representation made on behalf of
router.post('/representation-made-on-behalf-of-answer', function (req, res) {
    const representationMadeOnBehalfOf = req.session.data['representation-made-on-behalf-of'];

    // validation
    if (!representationMadeOnBehalfOf) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/14-representation-made-on-behalf-of', {
            errorRepresentationMadeOnBehalfOf: "Select who the representation was made on behalf of"
        });
    }
    if (representationMadeOnBehalfOf === "A person") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/15-was-the-representation-submitted-by-an-agent');
    }
    else if (representationMadeOnBehalfOf === "An organisation or charity that I work or volunteer for") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/06-name-of-the-person-submitting-the-representation');
    }
    else if (representationMadeOnBehalfOf === "An organisation or charity that I do not work or volunteer for") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/15-was-the-representation-submitted-by-an-agent');
    }
    else if (representationMadeOnBehalfOf === "A group of people") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/15-was-the-representation-submitted-by-an-agent');
    }
});


// 15 - was the representation submitted by an agent?
router.post('/bo-is-agent-answer', function (req, res) {
    const isAgent = req.session.data['is-agent'];
    if (!isAgent) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/15-was-the-representation-submitted-by-an-agent', { errorIsAgent: "Select yes if the representation was submitted by an agent" });
    }
    if (isAgent === "Yes") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/16-name-of-agents-organisation');
    }
    else if (isAgent === "No") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/06-name-of-the-person-submitting-the-representation');
    }
});


// 16 - name of the agent's organisation
router.post('/bo-agent-organisation-name-answer', function (req, res) {
    const agentOrganisationName = req.session.data['agent-organisation-name'];
    if (!agentOrganisationName) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/16-name-of-agents-organisation', { errorAgentOrganisationName: "Enter the name of the agent's organisation" });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/06-name-of-the-person-submitting-the-representation');
});


// 17 - name of the individual being represented
router.post('/bo-name-of-individual-being-represented-answer', function (req, res) {
    const firstName = req.session.data['name-of-individual-first-name'];
    const lastName = req.session.data['name-of-individual-last-name'];

    // error containers
    const errors = {};
    const errorList = [];

    // validate name fields
    if (!firstName) {
        errors.firstName = {text: "Enter the first name"};
        errorList.push({ text: "Enter the first name", href: "#name-of-individual-first-name" });
    }
    if (!lastName) {
        errors.lastName = {text: "Enter the last name"};
        errorList.push({ text: "Enter the last name", href: "#name-of-individual-last-name" });
    }

    // render errors if any
    if (errorList.length > 0) {
      return res.render('current-service/back-office/manage-representations/add-a-representation/17-name-of-the-individual-being-represented', { 
        errors: errors,
        errorList: errorList
      });
    }

    res.redirect('/current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted');
});


// 18 - name of senders organisation
router.post('/name-of-senders-org-or-charity-answer', function (req, res) {
    const nameOfSendersOrgOrCharity = req.session.data['name-of-senders-org-or-charity'];
    if (!nameOfSendersOrgOrCharity) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/18-name-of-senders-organisation-or-charity', { errorNameOfSendersOrgOrCharity: "Enter the name of the sender's organisation or charity" });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/19-senders-job-title-or-role');
});


// 19 - senders job title or role
router.post('/senders-job-title-or-role-answer', function (req, res) {
    const sendersJobTitleOrRole = req.session.data['senders-job-title-or-role'];
    if (!sendersJobTitleOrRole) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/19-senders-job-title-or-role', { errorSendersJobTitleOrRole: "Enter the name of the sender's job title or role" });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted');
});


// 20 - name of org or charity being represented
router.post('/bo-org-or-charity-being-represented-answer', function (req, res) {
    const orgOrCharityBeingRepresented = req.session.data['org-or-charity-being-represented'];
    if (!orgOrCharityBeingRepresented) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/20-name-of-organisation-or-charity-being-represented', { errorOrgOrCharityBeingRepresented: "Enter the name of the organisation or charity being represented" });
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted');
});


// 21 - group name
router.post('/bo-name-of-the-group-answer', function (req, res) {
    const nameOfTheGroup = req.session.data['name-of-the-group'];

    // no validation required as it is optional

    res.redirect('/current-service/back-office/manage-representations/add-a-representation/22-check-group-name-details');
});


// 22 - check group name details (ATL)
// --- (1) GET: Setup Person (Add or Edit) ---
router.get('/bo-setup-next-person', function(req, res) {
    const id = req.query.id;
    const groupNameList = req.session.data['group-name-list'] || [];

    if (id) {
        // Editing: Store ID and hydrate form variables
        req.session.data['edit-group-id'] = id;
        const existingPerson = groupNameList.find(p => p.id === id);
        
        if (existingPerson) {
            req.session.data['person-first-name'] = existingPerson.firstName;
            // Fixed typo from your old code: it was 'next-person-last-name'
            req.session.data['person-last-name'] = existingPerson.lastName; 
        }
    } else {
        // Adding: Wipe variables clean
        req.session.data['edit-group-id'] = "";
        req.session.data['person-first-name'] = "";
        req.session.data['person-last-name'] = "";
    }

    res.redirect('/current-service/back-office/manage-representations/add-a-representation/23-name-of-person-in-the-group');
});


// --- (2) POST: Save Data from Page 23 ---
router.post('/bo-name-of-person-answer', function(req, res) {
    const editId = req.session.data['edit-group-id'];
    const firstName = req.session.data['person-first-name'];
    const lastName = req.session.data['person-last-name'];

    const errors = {};
    const errorList = [];

    // Validation
    if (!firstName) {
        errors.firstName = {text: "Enter a first name"};
        errorList.push({ text: "Enter a first name", href: "#person-first-name" }); 
    }
    if (!lastName) {
        errors.lastName = {text: "Enter a last name"};
        errorList.push({ text: "Enter a last name", href: "#person-last-name" });
    }

    if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/23-name-of-person-in-the-group', {
            errors: errors,
            errorList: errorList
        });
    }

    if (!req.session.data['group-name-list']) {
        req.session.data['group-name-list'] = [];
    }

    if (editId) {
        // Updating an existing person
        const index = req.session.data['group-name-list'].findIndex(p => p.id === editId);
        if (index > -1) {
            req.session.data['group-name-list'][index].firstName = firstName;
            req.session.data['group-name-list'][index].lastName = lastName;
        }
    } else {
        // Adding a brand new person
        req.session.data['group-name-list'].push({ id: 'person-' + Date.now(), firstName, lastName });
    }

    // Wipe temporary variables clean
    req.session.data['edit-group-id'] = "";
    req.session.data['person-first-name'] = "";
    req.session.data['person-last-name'] = "";

    res.redirect('/current-service/back-office/manage-representations/add-a-representation/22-check-group-name-details');
});


// --- (3) GET: Direct Remove (No confirmation page) ---
router.get('/bo-remove-group-person', function(req, res) {
    const idToRemove = req.query.id;

    if (idToRemove && req.session.data['group-name-list']) {
        req.session.data['group-name-list'] = req.session.data['group-name-list'].filter(person => person.id !== idToRemove);
    }
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/22-check-group-name-details');
});


// --- (4) POST: Final Submission from the Table Page ---
router.post('/bo-check-group-name-details-answer', function(req, res) {
    const groupNameList = req.session.data['group-name-list'] || [];
    
    // Safety check: Don't let them continue if the list is totally empty!
    if (groupNameList.length === 0) {
        return res.render('current-service/back-office/manage-representations/add-a-representation/22-check-group-name-details', {
            errorList: [{ text: "You must add at least one person to the group", href: "#add-person-link" }]
        });
    }
    
    // If they have at least 1 person, move on to the next page in the journey
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/10-written-representation-submitted');
});


// check your answers - ref generation + save logic + redirect to success page
router.post('/representation-added', function(req, res) {
    const data = req.session.data;

    if (!data['source-of-representation']) {
        return res.redirect('/current-service/back-office/manage-representations/add-a-representation/success-representation-added');
    }

    // --- Date Formatting ---
    const day = data['date-the-representation-was-received-day'];
    const month = data['date-the-representation-was-received-month'];
    const year = data['date-the-representation-was-received-year'];
    
    // Generate the ISO backup 
    const paddedDay = (day || '').padStart(2, '0');
    const paddedMonth = (month || '').padStart(2, '0');
    const isoBackup = (year && month && day) ? `${year}-${paddedMonth}-${paddedDay}T00:00:00.000Z` : new Date().toISOString();


    // --- Reference Generation ---
    const firstThreeDigits = Math.floor(100 + Math.random() * 900); 
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter1 = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    const letter2 = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    const lastFourDigits = Math.floor(1000 + Math.random() * 9000); 
    const repReference = `${firstThreeDigits}${letter1}${letter2}-${lastFourDigits}`;

    // --- Logic Flags ---
    const isBehalf = data['source-of-representation'] === 'On behalf of another person, an organisation or group of people';
    const asksAgentQuestions = isBehalf && [
        'A person', 
        'An organisation or charity that I do not work or volunteer for', 
        'A group of people'
    ].includes(data['representation-made-on-behalf-of']);

    // --- Map the Data Payload ---
    const newRep = {
        reference: repReference,
        status: "Awaiting review",
        submissionDate: {
            day: day,
            month: month,
            year: year
        },
        // ISO backup
        backupIso: isoBackup, 
        
        // Back-office specific metadata
        howReceived: data['how-was-this-representation-received'],
        reasonNotOnline: data['reason-for-not-using-online-service'],
        type: data['type-of-representation-submitted'],
        wantsHearing: data['would-you-like-to-be-heard-at-a-hearing'],
        
        // Withdrawn related fields
        withdrawnDate: {
            day: null,
            month: null,
            year: null
        },
        withdrawnReason: null,
        withdrawnRequest: [],
        
        // Submitter Details
        submitterType: data['source-of-representation'],
        submitterName: `${data['your-first-name']} ${data['your-last-name']}`,
        obscureName: data['type-of-representation-submitted'] === 'Interested party' ? data['obscure-name'] : null,
        contactMethod: data['preferred-contact-method'],
        submitterEmail: data['preferred-contact-method'] === 'Email' ? data['your-email-address'] : null,
        
        postalAddress: data['preferred-contact-method'] === 'Post' ? {
            line1: data['postal-address-line-1'],
            line2: data['postal-address-line-2'],
            town: data['postal-address-town'],
            county: data['postal-address-county'],
            postcode: data['postal-address-postcode']
        } : null,

        // Conditional: Who are they representing?
        representing: isBehalf ? data['representation-made-on-behalf-of'] : null,

        // Conditional: Agent Details
        isAgent: asksAgentQuestions ? data['is-agent'] : null,
        agentOrgName: (asksAgentQuestions && data['is-agent'] === 'Yes') ? data['agent-organisation-name'] : null,

        // Conditional: Represented Person
        representedPerson: (isBehalf && data['representation-made-on-behalf-of'] === 'A person') ? 
            `${data['name-of-individual-first-name']} ${data['name-of-individual-last-name']}` : null,

        // Conditional: Represented Org (Work for)
        representedOrgWorkFor: (isBehalf && data['representation-made-on-behalf-of'] === 'An organisation or charity that I work or volunteer for') ? {
            name: data['name-of-senders-org-or-charity'],
            role: data['senders-job-title-or-role']
        } : null,

        // Conditional: Represented Org (Do not work for)
        representedOrgOther: (isBehalf && data['representation-made-on-behalf-of'] === 'An organisation or charity that I do not work or volunteer for') ? data['org-or-charity-being-represented'] : null,

        // Conditional: Represented Group
        representedGroup: (isBehalf && data['representation-made-on-behalf-of'] === 'A group of people') ? {
            name: data['name-of-the-group'],
            members: data['group-name-list'] || []
        } : null,

        // Representation Content & Attachments
        comment: data['written-representation-submitted'],
        hasAttachments: data['are-there-any-attachments'],
        attachments: data['are-there-any-attachments'] === 'Yes' && data['uploadedFiles'] ? data['uploadedFiles'].split('||') : []
    };

    // --- Save to the specific Case ---
    if (data.cases) {
      // Changed to currentBackOfficeCase
      const targetCase = data.cases.find(c => c.reference === data['currentBackOfficeCase']);
      
      if (targetCase) {
        if (!targetCase.representations) { targetCase.representations = []; }
        targetCase.representations.push(newRep);
      }
    }

    // --- Wipe fields for fresh form ---
    const fieldsToClear = [
        'date-the-representation-was-received-day',
        'date-the-representation-was-received-month',
        'date-the-representation-was-received-year',
        'how-was-this-representation-received',
        'reason-for-not-using-online-service',
        'type-of-representation-submitted',
        'source-of-representation',
        'your-first-name',
        'your-last-name',
        'obscure-name',
        'preferred-contact-method',
        'your-email-address',
        'postal-address-line-1',
        'postal-address-line-2',
        'postal-address-town',
        'postal-address-county',
        'postal-address-postcode',
        'written-representation-submitted',
        'would-you-like-to-be-heard-at-a-hearing',
        'are-there-any-attachments',
        'uploadedFiles',
        'representation-made-on-behalf-of',
        'is-agent',
        'agent-organisation-name',
        'name-of-individual-first-name',
        'name-of-individual-last-name',
        'name-of-senders-org-or-charity',
        'senders-job-title-or-role',
        'org-or-charity-being-represented',
        'name-of-the-group',
        'group-name-list'
    ];

    fieldsToClear.forEach(field => delete data[field]);

    // Pass reference to success page
    data.submittedRepReference = repReference;

    // Redirect to the back-office success page
    res.redirect('/current-service/back-office/manage-representations/add-a-representation/success-representation-added');
});





export default router;