import { Router } from 'express';
import govukPrototypeKit from 'govuk-prototype-kit';
import { addAuditLog, validAuthorities, validatePostcode, validateEmail, validateOptionalPhone } from '../helpers.js';

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
      const existingAgent = agentList.find(agent => agent.id === id);
      if (existingAgent) {
        req.session.data['agent-contact-first-name'] = existingAgent.firstName;
        req.session.data['agent-contact-last-name'] = existingAgent.lastName;
        req.session.data['agent-contact-email'] = existingAgent.email;
        req.session.data['agent-contact-phone'] = existingAgent.phone;
      }
    } else {
      req.session.data['agent-contact-first-name'] = "";
      req.session.data['agent-contact-last-name'] = "";
      req.session.data['agent-contact-email'] = "";
      req.session.data['agent-contact-phone'] = "";
    }
    res.render('current-service/back-office/create-a-case/4-5-agent-contact', { id: id });
  });

  // --- (2) save form data ---
  router.post('/agent-contact-answer', function (req, res) {
    const id = req.query.id; 
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
        errorList: errorList, 
        id: id 
      });
    }

    // create new array or hydrate if already exists
    if (!req.session.data['agent-contact-list']) {
      req.session.data['agent-contact-list'] = [];
    }

    if (id) {
      const index = req.session.data['agent-contact-list'].findIndex(a => a.id === id);
      if (index > -1) {
        req.session.data['agent-contact-list'][index] = { id: id, firstName, lastName, email, phone };
      }
    } else {
      const newAgent = { id: 'agent-' + Date.now(), firstName, lastName, email, phone };
      req.session.data['agent-contact-list'].push(newAgent);
    }

    req.session.data['agent-contact-first-name'] = "";
    req.session.data['agent-contact-last-name'] = "";
    req.session.data['agent-contact-email'] = "";
    req.session.data['agent-contact-phone'] = "";

    res.redirect('/current-service/back-office/create-a-case/4-4-agent-check');
  });

  // --- (3) confirm removal ---
  router.get('/agent-contact-remove', function (req, res) {
    // get ID from URL
    const id = req.query.id;
    
    // pass ID directly to form URL to ensure the exact contact is removed
    res.render('current-service/back-office/create-a-case/4-4-agent-remove', { 
      id: id 
    });
  });
  
  router.post('/agent-contact-remove-answer', function (req, res) {
    const confirmRemove = req.session.data['agent-contact-remove'];
    const id = req.query.id;

    if (!confirmRemove) {
      return res.render('current-service/back-office/create-a-case/4-4-agent-remove', {
        id: id,
        errorConfirmRemove: "Select yes if you want to remove this agent contact"
      });
    }

    if (confirmRemove === "Yes") {
      req.session.data['agent-contact-list'] = req.session.data['agent-contact-list'].filter(agent => agent.id !== id);
    }

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

    res.redirect(`/current-service/back-office/create-a-case/5-2-applicant-org-name${id ? '?id=' + id : ''}`);
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
    const id = req.query.id; 
    const postcode = req.session.data['applicant-org-address-postcode'];

    // validate optional postcode
    const postcodeError = validatePostcode(postcode);
    if (postcodeError) {
      return res.render('current-service/back-office/create-a-case/5-3-applicant-org-address', { 
        errorApplicantOrgAddress: postcodeError,
        id: id
      });
    }

    // hydrate address into temp object
    if (!req.session.data['temp-applicant-org']) req.session.data['temp-applicant-org'] = {};
    
    req.session.data['temp-applicant-org'].address = {
      line1: req.session.data['applicant-org-address-line-1'],
      line2: req.session.data['applicant-org-address-line-2'],
      town: req.session.data['applicant-org-address-town'],
      county: req.session.data['applicant-org-address-county'],
      postcode: postcode
    };

    // create new array or hydrate if already exists
    if (!req.session.data['applicant-org-list']) {
      req.session.data['applicant-org-list'] = [];
    }

    if (id) {
      const index = req.session.data['applicant-org-list'].findIndex(a => a.id === id);
      if (index > -1) {
        req.session.data['applicant-org-list'][index] = { 
          id: id, 
          ...req.session.data['temp-applicant-org'] 
        };
      }
    } else {
      const newOrg = { 
        id: 'org-' + Date.now(), 
        ...req.session.data['temp-applicant-org'] 
      };
      req.session.data['applicant-org-list'].push(newOrg);
    }

    // wipe temp object
    req.session.data['temp-applicant-org'] = {};

    res.redirect('/current-service/back-office/create-a-case/5-1-applicant-check');
  });

  // --- (4) confirm removal ---
  router.get('/applicant-org-remove', function (req, res) {
    // get ID from URL
    const id = req.query.id;
    
    // pass ID directly to form URL to ensure the exact org is removed
    res.render('current-service/back-office/create-a-case/5-4-applicant-org-remove', { 
      id: id 
    });
  });

  router.post('/applicant-org-remove-answer', function (req, res) {
    const confirmRemove = req.session.data['applicant-org-remove'];
    const id = req.query.id;

    if (!confirmRemove) {
      return res.render('current-service/back-office/create-a-case/5-4-applicant-org-remove', {
        id: id,
        errorConfirmRemove: "Select yes if you want to remove this applicant organisation"
      });
    }

    if (confirmRemove === "Yes") {
      req.session.data['applicant-org-list'] = req.session.data['applicant-org-list'].filter(org => org.id !== id);
    }

    req.session.data['applicant-org-remove'] = "";
    res.redirect('/current-service/back-office/create-a-case/5-1-applicant-check');
  });







  

export default router;