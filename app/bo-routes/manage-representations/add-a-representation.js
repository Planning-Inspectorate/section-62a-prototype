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
    'rep-received-day',
    'rep-received-month',
    'rep-received-year',
    'rep-type',
    'rep-first-name',
    'rep-last-name',
    'rep-email',
    'rep-comment'
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
  res.redirect('/current-service/back-office/manage-representations/add-a-representation/02-how-was-the-representation-received');
});



export default router;