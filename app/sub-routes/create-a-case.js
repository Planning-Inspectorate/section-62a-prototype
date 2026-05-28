import { Router } from 'express';
import govukPrototypeKit from 'govuk-prototype-kit';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber } from '../helpers.js';

const router = Router();

// --- ROUTES ---

router.get('/create-case-start', function (req, res) {
  const savedCases = req.session.data['cases'] || [];
  req.session.data = {};
  req.session.data['cases'] = savedCases;
  res.redirect('/current-service/back-office/create-a-case/1-application-type');
});


// 1 - application type
router.post('/application-type-answer', function (req, res) {
  const applicationType = req.session.data['application-type'];
  if (!applicationType) {
    return res.render('current-service/back-office/create-a-case/1-application-type', { errorApplicationType: "Select the type of application" });
}
  res.redirect('/current-service/back-office/create-a-case/2-lpa');
});


// 2 - primary lpa input
router.post('/lpa-answer', function(req, res) {
  const lpa = req.session.data['lpa'];
  if (!lpa) {
    return res.render('current-service/back-office/create-a-case/2-lpa', { errorLpa: "Enter the name of the local planning authority" });
  }
  if (!validAuthorities.includes(lpa)) {
    return res.render('current-service/back-office/create-a-case/2-lpa', { lpa: lpa, errorLpa: "Select a Local Planning Authority from the list" });
  }
  res.redirect('/current-service/back-office/create-a-case/3-1-has-secondary-lpa');
});


// 3 - has secondary lpa
router.post('/has-secondary-lpa-answer', function (req, res) {
  const hasSecondaryLpa = req.session.data['has-secondary-lpa'];
  if (!hasSecondaryLpa) {
    return res.render('current-service/back-office/create-a-case/3-1-has-secondary-lpa', { errorHasSecondaryLpa: "Select if the applicant is using a secondary local planning authority" });
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
    return res.render('current-service/back-office/create-a-case/3-2-secondary-lpa-input', { errorSecondaryLpa: "Enter the name of the secondary local planning authority" });
  }
  if (!validAuthorities.includes(secondaryLpa)) {
    return res.render('current-service/back-office/create-a-case/3-2-secondary-lpa-input', { secondaryLpa: secondaryLpa, errorSecondaryLpa: "Select a Local Planning Authority from the list" });
  }
  if (secondaryLpa === req.session.data['lpa']) {
    return res.render('current-service/back-office/create-a-case/3-2-secondary-lpa-input', { secondaryLpa: secondaryLpa, errorSecondaryLpa: "Secondary local planning authority cannot be the same as the local planning authority" });
  }
  res.redirect('/current-service/back-office/create-a-case/4-1-has-agent');
});


// 4-1 - has agent
router.post('/has-agent-answer', function (req, res) {
  const hasAgent = req.session.data['has-agent'];
  if (!hasAgent) {
    return res.render('current-service/back-office/create-a-case/4-1-has-agent', { errorHasAgent: "Select if the applicant is using an agent" });
  }
  if (hasAgent === "Yes") {
    res.redirect('/current-service/back-office/create-a-case/4-2-agent-org-name');
  } 
  else if (hasAgent === "No") {
    res.redirect('/current-service/back-office/create-a-case/5-1-applicant-check');
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
        errorApplicantOrgName: "Enter the applicant organisation name",
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
    const orgList = req.session.data['applicant-org-list'] || [];
    const contactList = req.session.data['applicant-contact-list'] || [];
    const errorList = [];

    // cross ref, loop through every organisation
    orgList.forEach(org => {
      // check if at least one contact is linked to the org
      const hasContact = contactList.some(contact => contact.linkedOrg === org.id);
      
      // throw error if no contacts linked to org
      if (!hasContact) {
        errorList.push({ 
          text: `You must add a contact for ${org.orgName}`, 
          href: "#add-another-contact" // This links to the 'Add another' button
        });
      }
    });

    // If any organisation is missing a contact, reload the page and show the errors
    if (errorList.length > 0) {
      return res.render('current-service/back-office/create-a-case/6-1-applicant-contact-check', {
        errorList: errorList
      });
    }

    // If all clear, safely proceed to the next section!
    res.redirect('/current-service/back-office/create-a-case/7-site-address');
  });

  // --- (2) save form data ---
  router.post('/applicant-contact-answer', function (req, res) {
    // grad edit ID securely from session
    const editId = req.session.data['edit-contact-id']; 
    
    const firstName = req.session.data['applicant-contact-first-name'];
    const lastName = req.session.data['applicant-contact-last-name'];
    const email = req.session.data['applicant-contact-email'];
    const phone = req.session.data['applicant-contact-phone'];
    let linkedOrg = req.session.data['applicant-contact-linked-org'];
    
    const orgList = req.session.data['applicant-org-list'] || [];

    const errors = {};
    const errorList = [];

    // validate fields
    if (!firstName) {
      errors.firstName = { text: "Enter the applicant contact's first name" };
      errorList.push({ text: "Enter the applicant contact's first name", href: "#applicant-contact-first-name" });
    }
    if (!lastName) {
      errors.lastName = { text: "Enter the applicant contact's last name" };
      errorList.push({ text: "Enter the applicant contact's last name", href: "#applicant-contact-last-name" });
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

    if (orgList.length > 1) {
      if (!linkedOrg) {
        errors.linkedOrg = { text: "Select which organisation this contact is for" };
        errorList.push({ text: "Select which organisation this contact is for", href: "#linked-org-1" });
      }
    } else if (orgList.length === 1) {
      linkedOrg = orgList[0].id;
    }

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

  const siteCoordsEastingError = validateOptionalSiteCoords(siteCoordsEasting, "The Easting grid reference", "site-coords-easting");
  if (siteCoordsEastingError) {
    errors.siteCoordsEasting = { text: siteCoordsEastingError.text };
    errorList.push(siteCoordsEastingError);
  }
  const siteCoordsNorthingError = validateOptionalSiteCoords(siteCoordsNorthing, "The Northing grid reference", "site-coords-northing");
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
  const siteArea = req.session.data['site-area'];
  const siteAreaError = validateOptionalNumber(siteArea, "The area of the site", "site-area");
  if (siteAreaError) {
    return res.render('current-service/back-office/create-a-case/9-site-area', { 
      errorSiteArea: siteAreaError.text
    });
  }
  res.redirect('/current-service/back-office/create-a-case/10-dev-description');
});









export default router;