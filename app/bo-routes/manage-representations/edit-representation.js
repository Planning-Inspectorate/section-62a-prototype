import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName, getRepresentation } from '../../helpers.js';

const router = Router();

// edit routes below this

// 01 - date the representation was received
router.get('/edit-date-received', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef

    // pre-populate session data if rep exists
    if (rep && rep.submissionDate) {
    req.session.data['date-the-representation-was-received-day'] = rep.submissionDate.day;
    req.session.data['date-the-representation-was-received-month'] = rep.submissionDate.month;
    req.session.data['date-the-representation-was-received-year'] = rep.submissionDate.year;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/01-date-the-representation-was-received');
});

    // 01 - post
router.post('/edit-date-the-representation-was-received', function (req, res) {
  const rep = getRepresentation(req);
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
    return res.render('current-service/back-office/manage-representations/edit-representation/01-date-the-representation-was-received', {
      errors: errors,
      errorList: errorList
    });
  }
  // save and update the exact object property
  if (rep) {
    rep.submissionDate = {
      day: day,
      month: month,
      year: year
    };

    // update the backup ISO string so the main table sorting doesn't break
    const paddedDay = (day || '').padStart(2, '0');
    const paddedMonth = (month || '').padStart(2, '0');
    rep.backupIso = (year && month && day) ? `${year}-${paddedMonth}-${paddedDay}T00:00:00.000Z` : new Date().toISOString();
  }
  // trigger success banner
  req.session.data['edit-success-message'] = "Date the representation was received has been updated";
  res.redirect('/current-service/back-office/manage-representations/review-representation/review');
});




// 02 - how was this representation received
router.get('/edit-how-received', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef

    // pre-populate session data if rep exists
    if (rep && rep.howReceived) {
        req.session.data['how-was-this-representation-received'] = rep.howReceived;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/02-how-was-this-representation-received');
});



// 03 - reason for not using online service
router.get('/edit-reason-not-online', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.reasonNotOnline) {
        req.session.data['reason-for-not-using-online-service'] = rep.reasonNotOnline;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/03-reason-for-not-using-online-service');
});



// 04 - representation type
router.get('/edit-rep-type', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.type) {
        req.session.data['type-of-representation-submitted'] = rep.type;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/04-type-of-representation-submitted');
});
export default router;