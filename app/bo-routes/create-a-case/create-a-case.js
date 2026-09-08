import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../../helpers.js';

const router = Router();

// --- ROUTES ---

router.get('/create-case-start', function (req, res) {
  const savedCases = req.session.data['cases'] || [];
  req.session.data = {};
  req.session.data['cases'] = savedCases;
  res.redirect('/current-service/back-office/create-a-case/01-application-stage');
});


// 01 - application stage
router.post('/application-stage-answer', function (req, res) {
  const applicationStage = req.session.data['application-stage'];
  if (!applicationStage) {
    return res.render('current-service/back-office/create-a-case/01-application-stage', { errorApplicationStage: "Select whether this is a pre-application or application" });
  }
  if (applicationStage === "Pre-application") {
    res.redirect('/current-service/back-office/create-a-case/06-application-type');
  }
  else if (applicationStage === "Application") {
    res.redirect('/current-service/back-office/create-a-case/02-has-pre-application-advice-been-requested-for-this-case');
  }
});


// 02 - has pre-app advice been received
router.post('/pre-application-advice-requested-answer', function (req, res) {
  const preApplicationAdviceRequested = req.session.data['pre-application-advice-requested'];
  
  if (!preApplicationAdviceRequested) {
    return res.render('current-service/back-office/create-a-case/02-has-pre-application-advice-been-requested-for-this-case', { 
      errorPreApplicationAdviceRequested: "Select if pre-application advice has been requested for this application" 
    });
  }
  
  if (preApplicationAdviceRequested === "Yes - PINS") {
    res.redirect('/current-service/back-office/create-a-case/03-what-is-the-pre-application-reference-pins');
  }
  else if (preApplicationAdviceRequested === "Yes - Council") {
    res.redirect('/current-service/back-office/create-a-case/04-what-is-the-pre-application-reference-council');
  }
  else if (preApplicationAdviceRequested === "No") {
    res.redirect('/current-service/back-office/create-a-case/05-application-classification');
  }
});


// 03 - what is pre-app ref (pins) - GET
router.get('/current-service/back-office/create-a-case/03-what-is-the-pre-application-reference-pins', function (req, res) {
  const cases = req.session.data.cases || [];
  
  // filter for cases that end in /PRE
  const preAppCases = cases.filter(c => c.reference && c.reference.endsWith('/PRE'));
  
  // map them into the format the GOV.UK Select component needs
  const preAppItems = preAppCases.map(c => ({
    value: c.reference,
    text: c.reference,
    selected: req.session.data['pre-app-ref-pins'] === c.reference
  }));

  // add the default empty/placeholder option to the very top
  preAppItems.unshift({
    value: "",
    text: "Select the pre-application reference or historic reference",
    selected: !req.session.data['pre-app-ref-pins']
  });

  // Render the page and pass the dynamic items
  res.render('current-service/back-office/create-a-case/03-what-is-the-pre-application-reference-pins', {
    preAppItems: preAppItems
  });
});

    // 03 - POST
    router.post('/pre-app-ref-pins-answer', function (req, res) {
      const preAppRef = req.session.data['pre-app-ref-pins'];

      // validation if blank
      if (!preAppRef || preAppRef.trim() === "") {
        
        // We must rebuild the list of PRE cases to re-render the page with the error
        const cases = req.session.data.cases || [];
        const preAppCases = cases.filter(c => c.reference && c.reference.endsWith('/PRE'));
        const preAppItems = preAppCases.map(c => ({
          value: c.reference,
          text: c.reference,
          selected: false // nothing is selected because it failed validation
        }));
        preAppItems.unshift({
          value: "",
          text: "Select the pre-application reference or historic reference",
          selected: true
        });

        return res.render('current-service/back-office/create-a-case/03-what-is-the-pre-application-reference-pins', {
          preAppItems: preAppItems,
          errorPreAppRefPins: "Select a pre-application reference"
        });
      }

      // If validation passes, move to the next step in the journey
      res.redirect('/current-service/back-office/create-a-case/05-application-classification');
    });


// 04 - what is the pre-application (council)
router.post('/pre-app-ref-council-answer', function (req, res) {
  const errorPreAppRefCouncil = req.session.data['pre-app-ref-council'];
  if (!errorPreAppRefCouncil) {
    return res.render('current-service/back-office/create-a-case/04-what-is-the-pre-application-reference-council', { errorPreAppRefCouncil: "Enter the pre-application reference" });
  }
  res.redirect('/current-service/back-office/create-a-case/05-application-classification');
});


// 05 - application classification
router.post('/application-classification-answer', function (req, res) {
  const applicationClassification = req.session.data['application-classification'];
  if (!applicationClassification) {
    return res.render('current-service/back-office/create-a-case/05-application-classification', { errorApplicationClassification: "Select whether this is a major or non-major application" });
}
  res.redirect('/current-service/back-office/create-a-case/06-application-type');
});


// 06 - application type
router.post('/application-type-answer', function (req, res) {
  const applicationType = req.session.data['application-type'];
  if (!applicationType) {
    return res.render('current-service/back-office/create-a-case/06-application-type', { errorApplicationType: "Select the type of application" });
}
  res.redirect('/current-service/back-office/create-a-case/07-lpa');
});


// 07 - primary lpa input
router.post('/lpa-answer', function(req, res) {
  const lpa = req.session.data['lpa'];
  if (!lpa) {
    return res.render('current-service/back-office/create-a-case/07-lpa', { errorLpa: "Enter the local planning authority" });
  }
  if (!validAuthorities.includes(lpa)) {
    return res.render('current-service/back-office/create-a-case/07-lpa', { lpa: lpa, errorLpa: "Select a local planning authority from the list" });
  }
  res.redirect('/current-service/back-office/create-a-case/08-lpa-contact');
});


// 08 - primary lpa contact details
router.post('/lpa-contact-answer', function (req, res) {
  const data = req.session.data;
  
  const lpaContactFirstName = data['lpa-contact-first-name'];
  const lpaContactLastName = data['lpa-contact-last-name'];
  const lpaContactEmail = data['lpa-contact-email'];
  const lpaContactPhone = data['lpa-contact-phone'];

  const errors = {};
  const errorList = [];

  // validate first name
  const firstNameError = validateName(lpaContactFirstName, "LPA contact's first name", "lpa-contact-first-name");
  if (firstNameError) {
    errors.firstName = { text: firstNameError.text };
    errorList.push(firstNameError);
  }

  // validate last name
  const lastNameError = validateName(lpaContactLastName, "LPA contact's last name", "lpa-contact-last-name");
  if (lastNameError) {
    errors.lastName = { text: lastNameError.text };
    errorList.push(lastNameError);
  }

  // validate email
  const emailError = validateEmail(lpaContactEmail, "LPA contact's email address", "lpa-contact-email");
  if (emailError) {
    errors.email = { text: emailError.text };
    errorList.push(emailError);
  }

  // validate optional phone
  const phoneError = validateOptionalPhone(lpaContactPhone, "lpa-contact-phone");
  if (phoneError) {
    errors.phone = { text: phoneError.text };
    errorList.push(phoneError);
  }

  // render errors if any
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/08-lpa-contact', {
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  
  res.redirect('/current-service/back-office/create-a-case/09-has-secondary-lpa');
});


// 09 - has secondary lpa
router.post('/has-secondary-lpa-answer', function (req, res) {
  const hasSecondaryLpa = req.session.data['has-secondary-lpa'];
  if (!hasSecondaryLpa) {
    return res.render('current-service/back-office/create-a-case/09-has-secondary-lpa', { errorHasSecondaryLpa: "Select yes if there is a secondary local planning authority" });
  }
  if (hasSecondaryLpa === "Yes") {
    res.redirect('/current-service/back-office/create-a-case/10-secondary-lpa-input');
  } 
  else if (hasSecondaryLpa === "No") {
    res.redirect('/current-service/back-office/create-a-case/12-has-agent');
  }
});


// 10 - secondary lpa input
router.post('/secondary-lpa-answer', function (req, res) {
  const secondaryLpa = req.session.data['secondary-lpa'];
  if (!secondaryLpa) {
    return res.render('current-service/back-office/create-a-case/10-secondary-lpa-input', { errorSecondaryLpa: "Enter the secondary local planning authority" });
  }
  if (!validAuthorities.includes(secondaryLpa)) {
    return res.render('current-service/back-office/create-a-case/10-secondary-lpa-input', { secondaryLpa: secondaryLpa, errorSecondaryLpa: "Select a local planning authority from the list" });
  }
  if (secondaryLpa === req.session.data['lpa']) {
    return res.render('current-service/back-office/create-a-case/10-secondary-lpa-input', { secondaryLpa: secondaryLpa, errorSecondaryLpa: "Secondary local planning authority cannot be the same as the local planning authority" });
  }
  res.redirect('/current-service/back-office/create-a-case/11-secondary-lpa-contact');
});


// 11 - secondary lpa contact details
router.post('/secondary-lpa-contact-answer', function (req, res) {
  const data = req.session.data;
  
  const secondaryLpaContactFirstName = data['secondary-lpa-contact-first-name'];
  const secondaryLpaContactLastName = data['secondary-lpa-contact-last-name'];
  const secondaryLpaContactEmail = data['secondary-lpa-contact-email'];
  const secondaryLpaContactPhone = data['secondary-lpa-contact-phone'];

  const errors = {};
  const errorList = [];

  // validate first name
  const firstNameError = validateName(secondaryLpaContactFirstName, "Secondary LPA contact's first name", "secondary-lpa-contact-first-name");
  if (firstNameError) {
    errors.firstName = { text: firstNameError.text };
    errorList.push(firstNameError);
  }

  // validate last name
  const lastNameError = validateName(secondaryLpaContactLastName, "Secondary LPA contact's last name", "secondary-lpa-contact-last-name");
  if (lastNameError) {
    errors.lastName = { text: lastNameError.text };
    errorList.push(lastNameError);
  }

  // validate email
  const emailError = validateEmail(secondaryLpaContactEmail, "Secondary LPA contact's email address", "secondary-lpa-contact-email");
  if (emailError) {
    errors.email = { text: emailError.text };
    errorList.push(emailError);
  }

  // validate optional phone
  const phoneError = validateOptionalPhone(secondaryLpaContactPhone, "secondary-lpa-contact-phone");
  if (phoneError) {
    errors.phone = { text: phoneError.text };
    errorList.push(phoneError);
  }

  // render errors if any
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/11-secondary-lpa-contact', {
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  
  res.redirect('/current-service/back-office/create-a-case/12-has-agent');
});
  

// 12 - has agent
router.post('/has-agent-answer', function (req, res) {
  const hasAgent = req.session.data['has-agent'];
  if (!hasAgent) {
    return res.render('current-service/back-office/create-a-case/12-has-agent', { errorHasAgent: "Select yes if the applicant is using an agent" });
  }
  if (hasAgent === "Yes") {
    res.redirect('/current-service/back-office/create-a-case/13-agent-org-name');
  } 
  else if (hasAgent === "No") {
    res.redirect('/current-service/back-office/create-a-case/18-applicant-type');
  }
});


// 13 - agent organisation name
router.post('/agent-org-name-answer', function (req, res) {
  const agentOrgName = req.session.data['agent-org-name'];
  if (!agentOrgName) {
    return res.render('current-service/back-office/create-a-case/13-agent-org-name', { errorAgentOrgName: "Enter the agent organisation name" });
  }
  res.redirect('/current-service/back-office/create-a-case/14-agent-org-address');
});


// 14 - agent organisation address
router.post('/agent-org-address-answer', function (req, res) {
  const postcode = req.session.data['agent-org-address-postcode'];
  const postcodeError = validatePostcode(postcode);
  if (postcodeError) {
    return res.render('current-service/back-office/create-a-case/14-agent-org-address', { 
      errorAgentOrgAddress: postcodeError 
    });
  }
  res.redirect('/current-service/back-office/create-a-case/15-agent-check');
});


// 15 - agent check contact details (ATL) - GET
router.get('/edit-agent-contact', function (req, res) {
  const id = req.query.id;
  const agentList = req.session.data['agent-contact-list'] || [];

  if (id) {
    // store id to session object
    req.session.data['edit-agent-id'] = id;

    const existingAgent = agentList.find(agent => agent.id === id);
    if (existingAgent) {
      req.session.data['agent-contact-first-name'] = existingAgent.firstName;
      req.session.data['agent-contact-last-name'] = existingAgent.lastName;
      req.session.data['agent-contact-email'] = existingAgent.email;
      req.session.data['agent-contact-phone'] = existingAgent.phone;
    }
  } else {
    // wipe id if adding new
    req.session.data['edit-agent-id'] = "";
    req.session.data['agent-contact-first-name'] = "";
    req.session.data['agent-contact-last-name'] = "";
    req.session.data['agent-contact-email'] = "";
    req.session.data['agent-contact-phone'] = "";
  }
  
  // pass whole session data to repopulate form
  res.render('current-service/back-office/create-a-case/16-agent-contact', { 
  data: req.session.data 
  });
});

// 16 - agent contact - POST
router.post('/agent-contact-answer', function (req, res) {
  const editId = req.session.data['edit-agent-id']; 
  const firstName = req.session.data['agent-contact-first-name'];
  const lastName = req.session.data['agent-contact-last-name'];
  const email = req.session.data['agent-contact-email'];
  const phone = req.session.data['agent-contact-phone'];

  // error containers
  const errors = {};
  const errorList = [];

  // validate name fields
  if (!firstName) {
    errors.firstName = { text: "Enter the agent's first name" };
    errorList.push({ text: "Enter the agent's first name", href: "#agent-contact-first-name" });
  }

  if (!lastName) {
    errors.lastName = { text: "Enter the agent's last name" };
    errorList.push({ text: "Enter the agent's last name", href: "#agent-contact-last-name" });
  }
  
  // validate email
  const emailError = validateEmail(email, "agent's email address", "agent-contact-email");
  if (emailError) {
    errors.email = { text: emailError.text };
    errorList.push(emailError);
  }

  // validate phone
  const phoneError = validateOptionalPhone(phone, "agent-contact-phone");
  if (phoneError) {
    errors.phone = { text: phoneError.text };
    errorList.push(phoneError);
  }

  // render errors if any
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/16-agent-contact', { 
      errors: errors,
      errorList: errorList
    });
  }

  // create new array or hydrate if already exists
  if (!req.session.data['agent-contact-list']) {
    req.session.data['agent-contact-list'] = [];
  }

  // check edit id to decide if update or push
  if (editId) {
    const index = req.session.data['agent-contact-list'].findIndex(a => a.id === editId);
    if (index > -1) {
      req.session.data['agent-contact-list'][index] = { id: editId, firstName, lastName, email, phone };
    }
  } else {
    const newAgent = { id: 'agent-' + Date.now(), firstName, lastName, email, phone };
    req.session.data['agent-contact-list'].push(newAgent);
  }

  // wipe id and form fields clean
  req.session.data['edit-agent-id'] = "";
  req.session.data['agent-contact-first-name'] = "";
  req.session.data['agent-contact-last-name'] = "";
  req.session.data['agent-contact-email'] = "";
  req.session.data['agent-contact-phone'] = "";

  res.redirect('/current-service/back-office/create-a-case/15-agent-check');
});

// 17 - agent remove - GET
router.get('/agent-contact-remove', function (req, res) {
  req.session.data['remove-agent-id'] = req.query.id;
  res.render('current-service/back-office/create-a-case/17-agent-remove');
});
  
    // 17 - POST
    router.post('/agent-contact-remove-answer', function (req, res) {
      const id = req.session.data['remove-agent-id'];

      // instantly filter the array to delete the contact
      if (id) {
        req.session.data['agent-contact-list'] = req.session.data['agent-contact-list'].filter(agent => agent.id !== id);
      }

      // Wipe the ID and radio selection clean so it doesn't ghost
      req.session.data['remove-agent-id'] = "";
      req.session.data['agent-contact-remove'] = ""; 
      
      res.redirect('/current-service/back-office/create-a-case/15-agent-check');
    });


// 18 - applicant type
router.post('/applicant-type-answer', function (req, res) {
  const applicantType = req.session.data['applicant-type'];
  if (!applicantType) {
    return res.render('current-service/back-office/create-a-case/18-applicant-type', { errorApplicantType: "Select whether the applicant is an organisation or an individual" });
  }
  if (applicantType === "Organisation") {
    res.redirect('/current-service/back-office/create-a-case/19-applicant-check');
  } 
  else if (applicantType === "Individual") {
    res.redirect('/current-service/back-office/create-a-case/23-applicant-contact-check');
  }
});


// 19 - applicant check organisation details (ATL) - GET
router.get('/edit-applicant-org', function (req, res) {
  const id = req.query.id;
  const orgList = req.session.data['applicant-org-list'] || [];

  if (id) {
    const existingOrg = orgList.find(org => org.id === id);
    if (existingOrg) {
      req.session.data['temp-applicant-org'] = { ...existingOrg };
      
      req.session.data['applicant-org-name'] = existingOrg.orgName;
      req.session.data['applicant-org-address-line-1'] = existingOrg.address.line1;
      req.session.data['applicant-org-address-line-2'] = existingOrg.address.line2;
      req.session.data['applicant-org-address-town'] = existingOrg.address.town;
      req.session.data['applicant-org-address-county'] = existingOrg.address.county;
      req.session.data['applicant-org-address-postcode'] = existingOrg.address.postcode;
    }
  } else {
    req.session.data['temp-applicant-org'] = {};
    
    req.session.data['applicant-org-name'] = "";
    req.session.data['applicant-org-address-line-1'] = "";
    req.session.data['applicant-org-address-line-2'] = "";
    req.session.data['applicant-org-address-town'] = "";
    req.session.data['applicant-org-address-county'] = "";
    req.session.data['applicant-org-address-postcode'] = "";
  }
    res.render('current-service/back-office/create-a-case/20-applicant-org-name', { 
      data: req.session.data
    });
});

// 20 - applicant org name - POST
router.post('/applicant-org-name-answer', function (req, res) {
  const id = req.query.id; 
  const orgName = req.session.data['applicant-org-name'];

  // validate org name
  if (!orgName) {
    return res.render('current-service/back-office/create-a-case/20-applicant-org-name', { 
      errorApplicantOrgName: "Enter the name of the applicant organisation",
      id: id
    });
  }

  // save to temp object
  if (!req.session.data['temp-applicant-org']) req.session.data['temp-applicant-org'] = {};
  req.session.data['temp-applicant-org'].orgName = orgName;

  res.redirect(`/current-service/back-office/create-a-case/21-applicant-org-address${id ? '?id=' + id : ''}`);
});

// 21 - applicant org address - POST
router.post('/applicant-org-address-answer', function (req, res) {
  // grab the ID securely from the session's temp object
  const editId = req.session.data['temp-applicant-org']?.id; 
  const postcode = req.session.data['applicant-org-address-postcode'];

  const postcodeError = validatePostcode(postcode);
  if (postcodeError) {
    return res.render('current-service/back-office/create-a-case/21-applicant-org-address', { 
      errorApplicantOrgAddress: postcodeError
    });
  }

  if (!req.session.data['temp-applicant-org']) req.session.data['temp-applicant-org'] = {};
  
  req.session.data['temp-applicant-org'].address = {
    line1: req.session.data['applicant-org-address-line-1'],
    line2: req.session.data['applicant-org-address-line-2'],
    town: req.session.data['applicant-org-address-town'],
    county: req.session.data['applicant-org-address-county'],
    postcode: postcode
  };

  if (!req.session.data['applicant-org-list']) {
    req.session.data['applicant-org-list'] = [];
  }

  // check the editId to decide if we update or push
  if (editId) {
    const index = req.session.data['applicant-org-list'].findIndex(a => a.id === editId);
    if (index > -1) {
      req.session.data['applicant-org-list'][index] = { ...req.session.data['temp-applicant-org'] };
    }
  } else {
    const newOrg = { 
      id: 'org-' + Date.now(), 
      ...req.session.data['temp-applicant-org'] 
    };
    req.session.data['applicant-org-list'].push(newOrg);
  }
  req.session.data['temp-applicant-org'] = {};
  res.redirect('/current-service/back-office/create-a-case/19-applicant-check');
});

// 22 - applicant org remove - GET
router.get('/applicant-org-remove', function (req, res) {
  // store id to session object
  req.session.data['remove-org-id'] = req.query.id;
  res.render('current-service/back-office/create-a-case/22-applicant-org-remove');
});

    // 22 - POST
    router.post('/applicant-org-remove-answer', function (req, res) {
    const id = req.session.data['remove-org-id'];

    // if an ID exists, delete
    if (id) {
    // remove the parent organisation
    if (req.session.data['applicant-org-list']) {
      req.session.data['applicant-org-list'] = req.session.data['applicant-org-list'].filter(org => org.id !== id);
    }

    // remove any child contacts linked to this organisation ID
    if (req.session.data['applicant-contact-list']) {
      req.session.data['applicant-contact-list'] = req.session.data['applicant-contact-list'].filter(contact => contact.linkedOrg !== id);
    }
    }

    // wipe the ID and temporary radio selection clean
    req.session.data['remove-org-id'] = "";
    req.session.data['applicant-org-remove'] = "";

    res.redirect('/current-service/back-office/create-a-case/19-applicant-check');
    });


// 23 - applicant contact check (ATL) (edit existing or Add) - GET
router.get('/edit-applicant-contact', function (req, res) {
  const id = req.query.id;
  const contactList = req.session.data['applicant-contact-list'] || [];

  if (id) {
    // STORE THE ID IN THE SESSION WAREHOUSE!
    req.session.data['edit-contact-id'] = id;

    const existingContact = contactList.find(c => c.id === id);
    if (existingContact) {
      req.session.data['applicant-contact-first-name'] = existingContact.firstName;
      req.session.data['applicant-contact-last-name'] = existingContact.lastName;
      req.session.data['applicant-contact-email'] = existingContact.email;
      req.session.data['applicant-contact-phone'] = existingContact.phone;
      req.session.data['applicant-contact-linked-org'] = existingContact.linkedOrg;
    }
  } else {
    // WIPE THE ID IF ADDING NEW!
    req.session.data['edit-contact-id'] = "";

    req.session.data['applicant-contact-first-name'] = "";
    req.session.data['applicant-contact-last-name'] = "";
    req.session.data['applicant-contact-email'] = "";
    req.session.data['applicant-contact-phone'] = "";
    req.session.data['applicant-contact-linked-org'] = "";
  }
    res.render('current-service/back-office/create-a-case/24-applicant-contact', { 
      data: req.session.data 
    });
});

    // 23 - validate contact list before proceeding to next section - POST
    router.post('/applicant-contact-check-continue', function (req, res) {
      const applicantType = req.session.data['applicant-type']; // "Individual" or "Organisation"
      const hasAgent = req.session.data['has-agent'];           // "Yes" or "No"
      
      const orgList = req.session.data['applicant-org-list'] || [];
      const contactList = req.session.data['applicant-contact-list'] || [];
      const errorList = [];

      // =========================================================
      // MANDATORY / OPTIONAL LOGIC
      // =========================================================
      
      // RULE 1: Completely Optional State
      // If they have an agent AND they haven't added any contacts, they can skip.
      if (hasAgent === 'Yes' && contactList.length === 0) {
        // Do nothing! They are allowed to proceed with an empty list.
      } 
      // RULE 2: Strict Validation State
      // If they have NO agent, OR if they started adding contacts, we enforce the rules.
      else {
        
        if (applicantType === 'Individual') {
          // Individual Rule: Must have at least 1 contact
          if (contactList.length === 0) {
            errorList.push({ 
              text: "You must add applicant contact details", 
              href: "#add-another-contact" 
            });
          }
        } 
        else {
          // Organisation Rule: Every single org must have a linked contact
          if (orgList.length === 0 && contactList.length === 0) {
            // Edge case fallback
            errorList.push({ 
              text: "You must add applicant contact details", 
              href: "#add-another-contact" 
            });
          } else {
            orgList.forEach(org => {
              const hasContact = contactList.some(contact => contact.linkedOrg === org.id);
              if (!hasContact) {
                errorList.push({ 
                  text: `You must add a contact for ${org.orgName}`, 
                  href: "#add-another-contact" 
                });
              }
            });
          }
        }
      }

      // if any errors were caught, reload the page
      if (errorList.length > 0) {
        return res.render('current-service/back-office/create-a-case/23-applicant-contact-check', {
          errorList: errorList
        });
      }

      res.redirect('/current-service/back-office/create-a-case/26-site-address');
    });

// 24 - applicant contact (save form data)
router.post('/applicant-contact-answer', function (req, res) {
  const editId = req.session.data['edit-contact-id']; 
  const applicantType = req.session.data['applicant-type']; // grab the applicant type
  
  const firstName = req.session.data['applicant-contact-first-name'];
  const lastName = req.session.data['applicant-contact-last-name'];
  const email = req.session.data['applicant-contact-email'];
  const phone = req.session.data['applicant-contact-phone'];
  let linkedOrg = req.session.data['applicant-contact-linked-org'];
  
  const orgList = req.session.data['applicant-org-list'] || [];

  const errors = {};
  const errorList = [];

  // validate standard fields using your helpers
  const firstNameError = validateName(firstName, "applicant contact's first name", "applicant-contact-first-name");
  if (firstNameError) {
    errors.firstName = { text: firstNameError.text };
    errorList.push(firstNameError);
  }

  const lastNameError = validateName(lastName, "applicant contact's last name", "applicant-contact-last-name");
  if (lastNameError) {
    errors.lastName = { text: lastNameError.text };
    errorList.push(lastNameError);
  }
  
  const emailError = validateEmail(email, "applicant contact's email address", "applicant-contact-email");
  if (emailError) {
    errors.email = { text: emailError.text };
    errorList.push(emailError);
  }

  const phoneError = validateOptionalPhone(phone, "applicant-contact-phone");
  if (phoneError) {
    errors.phone = { text: phoneError.text };
    errorList.push(phoneError);
  }

  // =========================================================
  // DYNAMIC RADIO PROTECTION
  // =========================================================
  if (applicantType === "Individual") {
    // Forcefully wipe linkedOrg if they are an Individual so no stray data gets saved
    linkedOrg = ""; 
  } else {
    // ONLY validate linked organisations if the applicant is an Organisation
    if (orgList.length > 1) {
      if (!linkedOrg) {
        errors.linkedOrg = { text: "Select which organisation this contact is for" };
        errorList.push({ text: "Select which organisation this contact is for", href: "#linked-org-1" });
      }
    } else if (orgList.length === 1) {
      linkedOrg = orgList[0].id; // Auto-assign if there is only 1 org
    }
  }

  // Bounce back if errors exist
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/24-applicant-contact', { 
      errors: errors,
      errorList: errorList
    });
  }

  if (!req.session.data['applicant-contact-list']) {
    req.session.data['applicant-contact-list'] = [];
  }

  // check edit ID to decide if update or push
  if (editId) {
    const index = req.session.data['applicant-contact-list'].findIndex(c => c.id === editId);
    if (index > -1) {
      req.session.data['applicant-contact-list'][index] = { 
        id: editId, firstName, lastName, email, phone, linkedOrg 
      };
    }
  } else {
    const newContact = { 
      id: 'app-con-' + Date.now(), firstName, lastName, email, phone, linkedOrg 
    };
    req.session.data['applicant-contact-list'].push(newContact);
  }

  // wipe temp edit ID and form fields
  req.session.data['edit-contact-id'] = "";
  req.session.data['applicant-contact-first-name'] = "";
  req.session.data['applicant-contact-last-name'] = "";
  req.session.data['applicant-contact-email'] = "";
  req.session.data['applicant-contact-phone'] = "";
  req.session.data['applicant-contact-linked-org'] = "";

  res.redirect('/current-service/back-office/create-a-case/23-applicant-contact-check');
});

// 25 - applicant contact remove - GET
router.get('/applicant-contact-remove', function (req, res) {
  // store id to session object
  req.session.data['remove-contact-id'] = req.query.id;
  res.render('current-service/back-office/create-a-case/25-applicant-contact-remove');
});

    // 25 - POST
    router.post('/applicant-contact-remove-answer', function (req, res) {
      const id = req.session.data['remove-contact-id'];

      // instantly filter the array to delete the contact who matches the ID
      if (id) {
        req.session.data['applicant-contact-list'] = req.session.data['applicant-contact-list'].filter(c => c.id !== id);
      }

      // wipe id and temporary removal value clean
      req.session.data['remove-contact-id'] = "";
      req.session.data['applicant-contact-remove'] = "";

      res.redirect('/current-service/back-office/create-a-case/23-applicant-contact-check');
    });


// 26 - site address
router.post('/site-address-answer', function (req, res) {
  const postcode = req.session.data['site-address-postcode'];
  const postcodeError = validatePostcode(postcode);
  if (postcodeError) {
    return res.render('current-service/back-office/create-a-case/26-site-address', { 
      errorSiteAddress: postcodeError 
    });
  }
  res.redirect('/current-service/back-office/create-a-case/27-site-coords');
});


// 27 - site coords
router.post('/site-coords-answer', function (req, res) {
  const siteCoordsEasting = req.session.data['site-coords-easting'];
  const siteCoordsNorthing = req.session.data['site-coords-northing'];
  // error containers
  const errors = {};
  const errorList = [];

  if (siteCoordsEasting && !siteCoordsNorthing) {
    errors.siteCoords = { text: "Enter both Easting and Northing" };
    errorList.push({ text: "Enter both Easting and Northing", href: "#site-coords-northing" });
  }
  if (!siteCoordsEasting && siteCoordsNorthing) {
    errors.siteCoords = { text: "Enter both Easting and Northing" };
    errorList.push({ text: "Enter both Easting and Northing", href: "#site-coords-easting" });
  }
  const siteCoordsEastingError = validateOptionalSiteCoords(siteCoordsEasting, "Easting", "site-coords-easting");
  if (siteCoordsEastingError) {
    errors.siteCoordsEasting = { text: siteCoordsEastingError.text };
    errorList.push(siteCoordsEastingError);
  }
  const siteCoordsNorthingError = validateOptionalSiteCoords(siteCoordsNorthing, "Northing", "site-coords-northing");
  if (siteCoordsNorthingError) {
    errors.siteCoordsNorthing = { text: siteCoordsNorthingError.text };
    errorList.push(siteCoordsNorthingError);
  }
  // render error if any
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/27-site-coords', { 
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/28-site-area');
});


// 28 - site area
router.post('/site-area-answer', function (req, res) {
  const data = req.session.data;
  
  const siteAreaHectares = data['site-area-hectares'];
  const siteAreaSqMetres = data['site-area-sq-metres'];
  // error containers
  let errors = {};
  let errorList = [];
  // trim extra spaces
  const hasHectares = siteAreaHectares && siteAreaHectares.trim() !== '';
  const hasSqMetres = siteAreaSqMetres && siteAreaSqMetres.trim() !== '';

  // if both is filled in, error
  if (hasHectares && hasSqMetres) {
    errors.siteAreaHectares = { text: "Enter the site area in either hectares or square metres, not both" };
    errors.siteAreaSqMetres = { text: "Enter the site area in either hectares or square metres, not both" };
    
    errorList.push({ 
      text: "Enter the site area in either hectares or square metres, not both", 
      href: "#site-area-hectares" 
    });
  } 
  // validation for hectares if only its filled in
  else if (hasHectares) {
    const numError = validateOptionalDecimalNumber(siteAreaHectares, "Site area in hectares", "site-area-hectares");
    if (numError) {
      errors.siteAreaHectares = { text: numError.text };
      errorList.push(numError);
    } 
    else if (Number(siteAreaHectares) <= 0) {
      errors.siteAreaHectares = { text: "Site area in hectares must be greater than 0" };
      errorList.push({ text: "Site area in hectares must be greater than 0", href: "#site-area-hectares" });
    }
  } 
  // validation for square metres if only its filled in
  else if (hasSqMetres) {
    const numError = validateOptionalDecimalNumber(siteAreaSqMetres, "Site area in square metres", "site-area-sq-metres");
    if (numError) {
      errors.siteAreaSqMetres = { text: numError.text };
      errorList.push(numError);
    } 
    else if (Number(siteAreaSqMetres) <= 0) {
      errors.siteAreaSqMetres = { text: "Site area in square metres must be greater than 0" };
      errorList.push({ text: "Site area in square metres must be greater than 0", href: "#site-area-sq-metres" });
    }
  }

  // render errors if any
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/28-site-area', { 
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/29-dev-description');
});


// 29 - dev description
router.post('/dev-description-answer', function (req, res) {
  const devDescription = req.session.data['dev-description'];
  if (!devDescription) {
    return res.render('current-service/back-office/create-a-case/29-dev-description', { errorDevDescription: "Enter a description of the development" });
  }
  res.redirect('/current-service/back-office/create-a-case/30-notification-received-date');
});


// 11 - distressing content - archived
//router.post('/distressing-content-answer', function (req, res) {
  //const distressingContent = req.session.data['distressing-content'];
  //if (!distressingContent) {
    //return res.render('current-service/back-office/create-a-case/11-distressing-content', { errorDisContent: "Select whether this application involves potentially distressing content" });
  //}
  //res.redirect('/current-service/back-office/create-a-case/12-exp-submission-date');
//});


// 30 - notification received date
router.post('/notification-received-date-answer', function (req, res) {
  const day = req.session.data['notification-received-date-day'];
  const month = req.session.data['notification-received-date-month'];
  const year = req.session.data['notification-received-date-year'];
  // error containers
  const errors = {};
  const errorList = [];
  
  // pass objects to the helper and create error object
  const dateError = validateOptionalDate(day, month, year, "Notification received date", "notification-received-date");

  // set error message from helper
  if (dateError) {
    errors.notificationReceivedDate = { text: dateError.text };
    
  // loop array of dateError and create simple flags for the html to add error classes to relevant inputs
  if (dateError.errorFields) {
    dateError.errorFields.forEach(field => {
      errors[field] = true; 
    });
  }
  errorList.push(dateError);
  }
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/30-notification-received-date', {
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/31-exp-submission-date');
});


// 31 - expected submission date
router.post('/expected-submission-date-answer', function (req, res) {
  const day = req.session.data['expected-submission-date-day'];
  const month = req.session.data['expected-submission-date-month'];
  const year = req.session.data['expected-submission-date-year'];
  // error containers
  const errors = {};
  const errorList = [];
  
  // pass objects to the helper and create error object
  const dateError = validateDate(day, month, year, "Expected submission date", "expected-submission-date");

  // set error message from helper
  if (dateError) {
    errors.expectedSubmissionDate = { text: dateError.text };
    
  // loop array of dateError and create simple flags for the html to add error classes to relevant inputs
  if (dateError.errorFields) {
    dateError.errorFields.forEach(field => {
      errors[field] = true; 
    });
  }
  errorList.push(dateError);
  }
  if (errorList.length > 0) {
    return res.render('current-service/back-office/create-a-case/31-exp-submission-date', {
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/check-your-answers');
});



// 32 - create the final case object and save to array
router.post('/case-created-confirmation', function (req, res) {
  const data = req.session.data;

  // prevent duplicate cases being created if user resubmits form
  if (!data['application-stage']) {
    return res.redirect('/current-service/back-office/create-a-case/success');
  }

  // create case array
  if (!data.cases) { data.cases = []; }

// generate ref number
  const isLbcType = data['application-type'] === 'Planning permission and listed building consent (LBC) for alterations, extension or demolition of a listed building';

  let nextCaseNumber = 1;
  if (data.cases.length > 0) {
    const lastCase = data.cases[data.cases.length - 1];
    
    // split the reference by '/'
    // e.g. "S62A/2026/0000001/PRE" becomes ["S62A", "2026", "0000001", "PRE"]
    const parts = lastCase.reference.split('/');
    
    // the 7-digit number is always the 3rd item (Index 2), regardless of suffixes
    if (parts.length >= 3) {
      nextCaseNumber = parseInt(parts[2], 10) + 1;
    }
  }
  const counterString = String(nextCaseNumber).padStart(7, '0');

  let caseReference;
  if (data['application-stage'] === 'Pre-application') {
    caseReference = `S62A/2026/${counterString}/PRE`;
  } else {
    caseReference = `S62A/2026/${counterString}`;
  }

  // build site area field based on hectares or square metres
  let finalSiteArea = "";

  if (data['site-area-hectares'] && data['site-area-hectares'].trim() !== '') {
    finalSiteArea = data['site-area-hectares'] + " ha";
  } else if (data['site-area-sq-metres'] && data['site-area-sq-metres'].trim() !== '') {
    finalSiteArea = data['site-area-sq-metres'] + " m²";
  }

  // map case object
  const newCase = {
    reference: caseReference,
    status: "New",
    applicationStage: data['application-stage'],

    // conditional pre-application advice requested and reference
    preApplicationRequested: data['application-stage'] === 'Application' ? data['pre-application-advice-requested'] : null,

    preApplicationReferencePins: (data['application-stage'] === 'Application' && data['pre-application-advice-requested'] === 'Yes - PINS') 
      ? data['pre-app-ref-pins'] 
      : null,
      
    preApplicationReferenceCouncil: (data['application-stage'] === 'Application' && data['pre-application-advice-requested'] === 'Yes - Council') 
      ? data['pre-app-ref-council'] 
      : null,

    applicationClassification: data['application-classification'],
    applicationType: data['application-type'],

   // lpa details
    lpa: data['lpa'],
    lpaContact: {
      firstName: data['lpa-contact-first-name'],
      lastName: data['lpa-contact-last-name'],
      email: data['lpa-contact-email'],
      phone: data['lpa-contact-phone']
    },

    // conditional - secondary lpa
    hasSecondaryLpa: data['has-secondary-lpa'],
    secondaryLpa: data['has-secondary-lpa'] === 'Yes' ? data['secondary-lpa'] : null,
    
    // secondary lpa contact details saved only if secondary lpa is yes
    secondaryLpaContact: data['has-secondary-lpa'] === 'Yes' ? {
      firstName: data['secondary-lpa-contact-first-name'],
      lastName: data['secondary-lpa-contact-last-name'],
      email: data['secondary-lpa-contact-email'],
      phone: data['secondary-lpa-contact-phone']
    } : null,

    // conditional - agent details
    hasAgent: data['has-agent'],
    agentOrgName: data['has-agent'] === 'Yes' ? data['agent-org-name'] : null,
    agentAddress: data['has-agent'] === 'Yes' ? {
      line1: data['agent-org-address-line-1'],
      line2: data['agent-org-address-line-2'],
      town: data['agent-org-address-town'],
      county: data['agent-org-address-county'],
      postcode: data['agent-org-address-postcode']
    } : null,
    agentContacts: data['has-agent'] === 'Yes' ? (data['agent-contact-list'] || []) : [],

    // standard arrays and fields
    applicantType: data['applicant-type'], 
    applicantOrgs: data['applicant-org-list'] || [],
    applicantContacts: data['applicant-contact-list'] || [],
    
    siteAddress: {
      line1: data['site-address-line-1'],
      line2: data['site-address-line-2'],
      town: data['site-address-town'],
      county: data['site-address-county'],
      postcode: data['site-address-postcode']
    },
    siteCoords: {
      easting: data['site-coords-easting'],
      northing: data['site-coords-northing']
    },
    siteArea: finalSiteArea,
    devDescription: data['dev-description'],
    notificationReceivedDate: {
      day: data['notification-received-date-day'],
      month: data['notification-received-date-month'],
      year: data['notification-received-date-year']
    },
    expectedSubmissionDate: {
      day: data['expected-submission-date-day'],
      month: data['expected-submission-date-month'],
      year: data['expected-submission-date-year']
    },
    representations: [],
    publishStatus: "No"
  };

  // 4. check for Linked Case condition (Only applies to 'Application' stage)
  const isLinkedLBC = isLbcType && data['application-stage'] === 'Application';

  if (isLinkedLBC) {
    // generate LBC reference for the linked duplicate
    const lbcReference = `${caseReference}/LBC`;

    // link both cases so banner can be displayed on case details
    newCase.applicationSubType = "Planning permission";
    newCase.linkedCaseReference = lbcReference;
    newCase.linkedCaseType = "Listed Building Consent (LBC)";
    newCase.connectedApplication = lbcReference;

    // clone the case data to create the secondary LBC case
    const lbcCase = JSON.parse(JSON.stringify(newCase)); 
    lbcCase.reference = lbcReference;
    lbcCase.applicationSubType = "Listed building consent (LBC)";
    lbcCase.linkedCaseReference = caseReference; // link back to the primary case
    lbcCase.linkedCaseType = "planning permission";
    lbcCase.connectedApplication = caseReference;

    // save both cases to array
    data.cases.push(newCase);
    data.cases.push(lbcCase);

    // add audit logs for both
    addAuditLog(req, caseReference, 'Case created');
    addAuditLog(req, lbcReference, 'Case created (Linked LBC)');

  } else {
    // save logic for singular cases (Including ALL Pre-applications)
    data.cases.push(newCase);
    addAuditLog(req, caseReference, 'Case created');
  }

  // wipe data fields for fresh create a case journey
  const fieldsToClear = [
    'application-stage', 'application-classification', 'pre-application-advice-requested', 'pre-app-ref-pins', 'pre-app-ref-council',
    'application-type', 'lpa', 
    'lpa-contact-first-name', 'lpa-contact-last-name', 'lpa-contact-email', 'lpa-contact-phone',
    'has-secondary-lpa', 'secondary-lpa', 
    'secondary-lpa-contact-first-name', 'secondary-lpa-contact-last-name', 'secondary-lpa-contact-email', 'secondary-lpa-contact-phone',
    'has-agent', 'agent-org-name', 'agent-org-address-line-1', 'agent-org-address-line-2', 
    'agent-org-address-town', 'agent-org-address-county', 'agent-org-address-postcode', 'agent-contact-list',
    'applicant-type', 'applicant-org-list', 'applicant-contact-list', 
    'site-address-line-1', 'site-address-line-2', 'site-address-town', 
    'site-address-county', 'site-address-postcode', 'site-coords-easting', 
    'site-coords-northing', 'site-area', 'site-area-hectares', 'site-area-sq-metres', 
    'dev-description', 'distressing-content',
    'expected-submission-date-day', 'expected-submission-date-month', 'expected-submission-date-year',
    'notification-received-date-day', 'notification-received-date-month', 'notification-received-date-year'
  ];

  fieldsToClear.forEach(field => {
    delete data[field];
  });

  // pass reference to success page and redirect
  data.newlyCreatedReference = caseReference;
  
  if (isLinkedLBC) {
    data.newlyCreatedLbcReference = `${caseReference}/LBC`;
  } else {
    // wipe lbcReference variable to prevent ghosting
    delete data.newlyCreatedLbcReference; 
  }

  res.redirect('/current-service/back-office/create-a-case/success');
});


export default router;