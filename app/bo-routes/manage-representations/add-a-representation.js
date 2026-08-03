import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../../helpers.js';

const router = Router();

// --- ROUTES ---
router.get('/add-a-representation-start', function (req, res) {
  const data = req.session.data;
  
  // 1. Grab the case reference from the URL query string
  // (Assuming your link looks like: href="/.../add-a-representation-start?caseRef={{ currentCase.reference }}")
  const caseRef = req.query.caseRef;
  
  if (caseRef) {
    // Save it to the session so your POST route knows which case to attach the rep to
    data['currentBackOfficeCase'] = caseRef;
  }

  // 2. Clear out any temporary variables from a previous manual entry attempt
  // Swap these out with the actual 'name' attributes you are using in your back-office forms
  const fieldsToClear = [
    'date-the-representation-was-received-day',
    'date-the-representation-was-received-month',
    'date-the-representation-was-received-year',
    'how-was-this-representation-received'
  ];

  fieldsToClear.forEach(field => {
    delete data[field];
  });

  // 3. Redirect to the first page of your manual representations journey
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
      res.redirect('/current-service/back-office/manage-representations/add-a-representation/x-');
    }
});


// 06 - name of the person submitting the representation
router.post('/their-name-answer', function (req, res) {
    const firstName = req.session.data['their-first-name'];
    const lastName = req.session.data['their-last-name'];

    // error containers
    const errors = {};
    const errorList = [];

    // validate name fields
    if (!firstName) {
        errors.firstName = {text: "Enter their first name"};
        errorList.push({ text: "Enter their first name", href: "#their-first-name" });
    }
    if (!lastName) {
        errors.lastName = {text: "Enter their last name"};
        errorList.push({ text: "Enter their last name", href: "#their-last-name" });
    }

    // render errors if any
    if (errorList.length > 0) {
      return res.render('current-service/back-office/manage-representations/add-a-representation/06-name-of-the-person-submitting-the-representation', { 
        errors: errors,
        errorList: errorList
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
    else if (preferredContactMethod === "Phone") {
        res.redirect('/current-service/back-office/manage-representations/add-a-representation/09-postal-address-provided');
    }
});



export default router;