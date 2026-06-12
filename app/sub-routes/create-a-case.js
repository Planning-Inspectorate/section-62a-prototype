import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../helpers.js';

const router = Router();

// --- ROUTES ---

router.get('/create-case-start', function (req, res) {
  const savedCases = req.session.data['cases'] || [];
  req.session.data = {};
  req.session.data['cases'] = savedCases;
  res.redirect('/current-service/back-office/create-a-case/0-application-stage');
});


// 0 - application stage
router.post('/application-stage-answer', function (req, res) {
  const applicationStage = req.session.data['application-stage'];
  if (!applicationStage) {
    return res.render('current-service/back-office/create-a-case/0-application-stage', { errorApplicationStage: "Select what type of application this is" });
  }
  if (applicationStage === "Pre-application") {
    res.redirect('/current-service/back-office/create-a-case/1-application-type');
  }
  else if (applicationStage === "Application") {
    res.redirect('/current-service/back-office/create-a-case/0-application-category');
  }
});


// 0 - application category
router.post('/application-category-answer', function (req, res) {
  const applicationCategory = req.session.data['application-category'];
  if (!applicationCategory) {
    return res.render('current-service/back-office/create-a-case/0-application-category', { errorApplicationCategory: "Select whether this is a major or non-major application" });
}
  res.redirect('/current-service/back-office/create-a-case/1-application-type');
});


// 1 - application type
router.post('/application-type-answer', function (req, res) {
  const applicationType = req.session.data['application-type'];
  if (!applicationType) {
    return res.render('current-service/back-office/create-a-case/1-application-type', { errorApplicationType: "Select the type of application" });
}
  res.redirect('/current-service/back-office/create-a-case/2-1-lpa');
});


// 2-1 - primary lpa input
router.post('/lpa-answer', function(req, res) {
  const lpa = req.session.data['lpa'];
  if (!lpa) {
    return res.render('current-service/back-office/create-a-case/2-1-lpa', { errorLpa: "Enter the local planning authority" });
  }
  if (!validAuthorities.includes(lpa)) {
    return res.render('current-service/back-office/create-a-case/2-1-lpa', { lpa: lpa, errorLpa: "Select a local planning authority from the list" });
  }
  res.redirect('/current-service/back-office/create-a-case/2-2-lpa-contact');
});


// 2-2 - primary lpa contact details
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
    return res.render('current-service/back-office/create-a-case/2-2-lpa-contact', {
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  
  res.redirect('/current-service/back-office/create-a-case/3-1-has-secondary-lpa');
});


// 3-1 - has secondary lpa
router.post('/has-secondary-lpa-answer', function (req, res) {
  const hasSecondaryLpa = req.session.data['has-secondary-lpa'];
  if (!hasSecondaryLpa) {
    return res.render('current-service/back-office/create-a-case/3-1-has-secondary-lpa', { errorHasSecondaryLpa: "Select yes if there is a secondary local planning authority" });
  }
  if (hasSecondaryLpa === "Yes") {
    res.redirect('/current-service/back-office/create-a-case/3-2-secondary-lpa-input');
  } 
  else if (hasSecondaryLpa === "No") {
    res.redirect('/current-service/back-office/create-a-case/4-1-has-agent');
  }
});


// 3-2 - secondary lpa input
router.post('/secondary-lpa-answer', function (req, res) {
  const secondaryLpa = req.session.data['secondary-lpa'];
  if (!secondaryLpa) {
    return res.render('current-service/back-office/create-a-case/3-2-secondary-lpa-input', { errorSecondaryLpa: "Enter the secondary local planning authority" });
  }
  if (!validAuthorities.includes(secondaryLpa)) {
    return res.render('current-service/back-office/create-a-case/3-2-secondary-lpa-input', { secondaryLpa: secondaryLpa, errorSecondaryLpa: "Select a local planning authority from the list" });
  }
  if (secondaryLpa === req.session.data['lpa']) {
    return res.render('current-service/back-office/create-a-case/3-2-secondary-lpa-input', { secondaryLpa: secondaryLpa, errorSecondaryLpa: "Secondary local planning authority cannot be the same as the local planning authority" });
  }
  res.redirect('/current-service/back-office/create-a-case/3-3-secondary-lpa-contact');
});


// 3-3 - secondary lpa contact details
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
    return res.render('current-service/back-office/create-a-case/3-3-secondary-lpa-contact', {
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  
  res.redirect('/current-service/back-office/create-a-case/4-1-has-agent');
});
  

// 4-1 - has agent
router.post('/has-agent-answer', function (req, res) {
  const hasAgent = req.session.data['has-agent'];
  if (!hasAgent) {
    return res.render('current-service/back-office/create-a-case/4-1-has-agent', { errorHasAgent: "Select yes if the applicant is using an agent" });
  }
  if (hasAgent === "Yes") {
    res.redirect('/current-service/back-office/create-a-case/4-2-agent-org-name');
  } 
  else if (hasAgent === "No") {
    res.redirect('/current-service/back-office/create-a-case/5-0-applicant-type');
  }
});


// 4-2 - agent organisation name
router.post('/agent-org-name-answer', function (req, res) {
  const agentOrgName = req.session.data['agent-org-name'];
  if (!agentOrgName) {
    return res.render('current-service/back-office/create-a-case/4-2-agent-org-name', { errorAgentOrgName: "Enter the agent organisation name" });
  }
  res.redirect('/current-service/back-office/create-a-case/4-3-agent-org-address');
});


// 4-3 - agent organisation address
router.post('/agent-org-address-answer', function (req, res) {
  const postcode = req.session.data['agent-org-address-postcode'];
  const postcodeError = validatePostcode(postcode);
  if (postcodeError) {
    return res.render('current-service/back-office/create-a-case/4-3-agent-org-address', { 
      errorAgentOrgAddress: postcodeError 
    });
  }
  res.redirect('/current-service/back-office/create-a-case/4-4-agent-check');
});


// 4-4 - agent check contact details (ATL)
  // --- (1) grab form (edit existing or add) ---
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
    res.render('current-service/back-office/create-a-case/4-5-agent-contact', { 
    data: req.session.data 
    });
  });

  // --- (2) save form data ---
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
      return res.render('current-service/back-office/create-a-case/4-5-agent-contact', { 
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

    res.redirect('/current-service/back-office/create-a-case/4-4-agent-check');
  });

  // --- (3) confirm removal ---
  router.get('/agent-contact-remove', function (req, res) {
    req.session.data['remove-agent-id'] = req.query.id;
    res.render('current-service/back-office/create-a-case/4-4-agent-remove');
  });
  
  router.post('/agent-contact-remove-answer', function (req, res) {
    const confirmRemove = req.session.data['agent-contact-remove'];
    const id = req.session.data['remove-agent-id'];

    if (!confirmRemove) {
      return res.render('current-service/back-office/create-a-case/4-4-agent-remove', {
        errorConfirmRemove: "Select yes if you want to remove this agent contact"
      });
    }
    if (confirmRemove === "Yes") {
      req.session.data['agent-contact-list'] = req.session.data['agent-contact-list'].filter(agent => agent.id !== id);
    }

    // wipe id and radio selection clean
    req.session.data['remove-agent-id'] = "";
    req.session.data['agent-contact-remove'] = "";
    res.redirect('/current-service/back-office/create-a-case/4-4-agent-check');
  });


// 5-0 - applicant type
router.post('/applicant-type-answer', function (req, res) {
  const applicantType = req.session.data['applicant-type'];
  if (!applicantType) {
    return res.render('current-service/back-office/create-a-case/5-0-applicant-type', { errorApplicantType: "Select whether the applicant is an organisation or an individual" });
  }
  if (applicantType === "Organisation") {
    res.redirect('/current-service/back-office/create-a-case/5-1-applicant-check');
  } 
  else if (applicantType === "Individual") {
    res.redirect('/current-service/back-office/create-a-case/6-1-applicant-contact-check');
  }
});

// 5-1 - applicant check organisation details (ATL)
  // --- (1) grab form (edit existing or add) ---
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
      res.render('current-service/back-office/create-a-case/5-2-applicant-org-name', { 
        data: req.session.data
      });
  });

  // --- (2) save applicant org name (page 1) ---
  router.post('/applicant-org-name-answer', function (req, res) {
    const id = req.query.id; 
    const orgName = req.session.data['applicant-org-name'];

    // validate org name
    if (!orgName) {
      return res.render('current-service/back-office/create-a-case/5-2-applicant-org-name', { 
        errorApplicantOrgName: "Enter the name of the applicant organisation name",
        id: id
      });
    }

    // save to temp object
    if (!req.session.data['temp-applicant-org']) req.session.data['temp-applicant-org'] = {};
    req.session.data['temp-applicant-org'].orgName = orgName;

    res.redirect(`/current-service/back-office/create-a-case/5-3-applicant-org-address${id ? '?id=' + id : ''}`);
  });

  // --- (3) save address & finalize array (page 2) ---
  router.post('/applicant-org-address-answer', function (req, res) {
    // grab the ID securely from the session's temp object
    const editId = req.session.data['temp-applicant-org']?.id; 
    const postcode = req.session.data['applicant-org-address-postcode'];

    const postcodeError = validatePostcode(postcode);
    if (postcodeError) {
      return res.render('current-service/back-office/create-a-case/5-3-applicant-org-address', { 
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
    res.redirect('/current-service/back-office/create-a-case/5-1-applicant-check');
  });

  // --- (4) confirm removal ---
  router.get('/applicant-org-remove', function (req, res) {
      // store id to session object
      req.session.data['remove-org-id'] = req.query.id;
      res.render('current-service/back-office/create-a-case/5-4-applicant-org-remove');
    });

  router.post('/applicant-org-remove-answer', function (req, res) {
    const confirmRemove = req.session.data['applicant-org-remove'];
    const id = req.session.data['remove-org-id'];

    if (!confirmRemove) {
      return res.render('current-service/back-office/create-a-case/5-4-applicant-org-remove', {
        errorConfirmRemove: "Select yes if you want to remove this applicant organisation"
      });
    }
    if (confirmRemove === "Yes") {
      // remove the parent organisation
      req.session.data['applicant-org-list'] = req.session.data['applicant-org-list'].filter(org => org.id !== id);
      
      // remove any child contacts linked to this organisation id
      if (req.session.data['applicant-contact-list']) {
        req.session.data['applicant-contact-list'] = req.session.data['applicant-contact-list'].filter(contact => contact.linkedOrg !== id);
      }
    }

    req.session.data['remove-org-id'] = "";
    req.session.data['applicant-org-remove'] = "";
    res.redirect('/current-service/back-office/create-a-case/5-1-applicant-check');
  });


// 6-1 - applicant contact check (ATL)
  // --- (1) grab form (edit existing or Add) ---
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
      res.render('current-service/back-office/create-a-case/6-2-applicant-contact', { 
        data: req.session.data 
      });
  });

  // validate contact list before proceeding to next section
  router.post('/applicant-contact-check-continue', function (req, res) {
    const applicantType = req.session.data['applicant-type']; // "Individual" or "Organisation"
    const hasAgent = req.session.data['has-agent'];           // "Yes" or "No"
    
    const orgList = req.session.data['applicant-org-list'] || [];
    const contactList = req.session.data['applicant-contact-list'] || [];
    const errorList = [];

    // =========================================================
    // MANDATORY / OPTIONAL LOGIC
    // =========================================================
    // If they have an agent, the applicant contact list is entirely optional.
    // We only run these mandatory checks if there is NO agent.
    if (hasAgent === 'No') {
      
      if (applicantType === 'Individual') {
        // Rule: Individual + No Agent = Must have at least 1 contact
        if (contactList.length === 0) {
          errorList.push({ 
            text: "You must add applicant contact details", 
            href: "#add-another-contact" 
          });
        }
      } 
      else {
        // Rule: Organisation + No Agent = Every org must have a linked contact
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

    // If any errors were caught, reload the page
    if (errorList.length > 0) {
      return res.render('current-service/back-office/create-a-case/6-1-applicant-contact-check', {
        errorList: errorList
      });
    }

    // If all clear (or if hasAgent === 'Yes'), safely proceed!
    res.redirect('/current-service/back-office/create-a-case/7-site-address');
  });

// --- (2) save form data ---
  router.post('/applicant-contact-answer', function (req, res) {
    const editId = req.session.data['edit-contact-id']; 
    const applicantType = req.session.data['applicant-type']; // Grab the applicant type
    
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
      return res.render('current-service/back-office/create-a-case/6-2-applicant-contact', { 
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

    res.redirect('/current-service/back-office/create-a-case/6-1-applicant-contact-check');
  });

  // --- (3) confirm removal ---
  router.get('/applicant-contact-remove', function (req, res) {
    // store id to session object
    req.session.data['remove-contact-id'] = req.query.id;
    res.render('current-service/back-office/create-a-case/6-3-applicant-contact-remove');
  });

  router.post('/applicant-contact-remove-answer', function (req, res) {
    const confirmRemove = req.session.data['applicant-contact-remove'];
    const id = req.session.data['remove-contact-id'];

    if (!confirmRemove) {
      return res.render('current-service/back-office/create-a-case/6-3-applicant-contact-remove', {
        errorConfirmRemove: "Select yes if you want to remove this applicant contact"
      });
    }
    if (confirmRemove === "Yes") {
      // Filter the array to instantly delete the person who matches the ID
      req.session.data['applicant-contact-list'] = req.session.data['applicant-contact-list'].filter(c => c.id !== id);
    }

    // wipe id and radio selection clean
    req.session.data['remove-contact-id'] = "";
    req.session.data['applicant-contact-remove'] = "";
    res.redirect('/current-service/back-office/create-a-case/6-1-applicant-contact-check');
  });


// 7 - site address
router.post('/site-address-answer', function (req, res) {
  const postcode = req.session.data['site-address-postcode'];
  const postcodeError = validatePostcode(postcode);
  if (postcodeError) {
    return res.render('current-service/back-office/create-a-case/7-site-address', { 
      errorSiteAddress: postcodeError 
    });
  }
  res.redirect('/current-service/back-office/create-a-case/8-site-coords');
});


// 8 - site coords
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
    return res.render('current-service/back-office/create-a-case/8-site-coords', { 
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/9-site-area');
});


// 9 - site area
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
    return res.render('current-service/back-office/create-a-case/9-site-area', { 
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/10-dev-description');
});


// 10 - dev description
router.post('/dev-description-answer', function (req, res) {
  const devDescription = req.session.data['dev-description'];
  if (!devDescription) {
    return res.render('current-service/back-office/create-a-case/10-dev-description', { errorDevDescription: "Enter a description of the development" });
  }
  res.redirect('/current-service/back-office/create-a-case/11-notification-received-date');
});


// 11 - distressing content - archived
//router.post('/distressing-content-answer', function (req, res) {
  //const distressingContent = req.session.data['distressing-content'];
  //if (!distressingContent) {
    //return res.render('current-service/back-office/create-a-case/11-distressing-content', { errorDisContent: "Select whether this application involves potentially distressing content" });
  //}
  //res.redirect('/current-service/back-office/create-a-case/12-exp-submission-date');
//});


// 11 - notification received date
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
    return res.render('current-service/back-office/create-a-case/11-notification-received-date', {
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/12-exp-submission-date');
});


// 12 - expected submission date
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
    return res.render('current-service/back-office/create-a-case/12-exp-submission-date', {
      errors: errors,
      errorList: errorList
    });
  }
  res.redirect('/current-service/back-office/create-a-case/13-check-your-answers');
});



// 13 - create the final case object and save to array
router.post('/case-created-confirmation', function (req, res) {
  const data = req.session.data;

  // prevent duplicate cases being created if user resubmits form
  if (!data['application-stage']) {
    return res.redirect('/current-service/back-office/create-a-case/14-case-created-success');
  }

  // create case array
  if (!data.cases) { data.cases = []; }

// generate ref number
  let nextCaseNumber = 1;
  if (data.cases.length > 0) {
    const lastCase = data.cases[data.cases.length - 1];
    
    // strip LBC suffix if it exists to get clean 7 last digits
    const cleanRef = lastCase.reference.replace('/LBC', '');
    
    // split slashes and use cleaned up last digits from previous step
    const lastNumberString = cleanRef.split('/').pop();
    
    // convert string into number and + 1 for new case
    nextCaseNumber = parseInt(lastNumberString, 10) + 1;
  }
  const counterString = String(nextCaseNumber).padStart(7, '0');
  
  // conditionally build the reference string based on application stage
  let caseReference;
  if (data['application-stage'] === 'Pre-application') {
    caseReference = `S62A/PRE/2026/${counterString}`;
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
    applicationCategory: data['application-category'],
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
    }
  };

// check for LBC linked case condition
  const isLinkedLBC = (
    data['application-type'] === 'Planning permission and listed building consent (LBC) for alterations, extension or demolition of a listed building' && 
    data['application-stage'] === 'Application'
  );

  if (isLinkedLBC) {
    // generate LBC reference
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
    // save logic for singular cases
    data.cases.push(newCase);
    addAuditLog(req, caseReference, 'Case created');
  }

  // wipe data fields for fresh create a case journey
  const fieldsToClear = [
    'application-stage', 'application-category', 'application-type', 'lpa', 
    'lpa-contact-first-name', 'lpa-contact-last-name', 'lpa-contact-email', 'lpa-contact-phone',
    'has-secondary-lpa', 'secondary-lpa', 
    'secondary-lpa-contact-first-name', 'secondary-lpa-contact-last-name', 'secondary-lpa-contact-email', 'secondary-lpa-contact-phone', // <-- New Secondary LPA fields
    'has-agent', 'agent-org-name', 'agent-org-address-line-1', 'agent-org-address-line-2', 
    'agent-org-address-town', 'agent-org-address-county', 'agent-org-address-postcode', 'agent-contact-list',
    
    // applicant-type is not saved as it's only purpose is to direct user down the correct path, so it's cleared to reset the journey
    'applicant-type', 
    'applicant-org-list', 'applicant-contact-list', 
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

  res.redirect('/current-service/back-office/create-a-case/14-case-created-success');
});


export default router;