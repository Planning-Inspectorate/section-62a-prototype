import { Router } from 'express';
import { 
    updateCaseData,
    addAuditLog,
    getCase,
    validatePostcode, 
    validateDate, 
    validateDateTime, 
    validateNumber,
    validateEmail,
    validatePhone,
    validateOptionalEmail,
    validateOptionalPhone,
    validateOptionalSiteCoords,
    validateOptionalNumber,
    validateOptionalDate,
    validateName,
    validateOptionalName
} from '../../helpers.js';

const router = Router();

// routes below this


// applicant overview contact - GET
router.get('/current-service/back-office/edit-case/overview/applicant-overview-contact', function(req, res) {
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/current-service/back-office/cases');

  // look for array
  const contact = (currentCase.applicantOverviewContacts && currentCase.applicantOverviewContacts.length > 0) 
    ? currentCase.applicantOverviewContacts[0] 
    : {};

  // pre-populate session data
  req.session.data['applicant-overview-contact-org-name'] = contact.orgName || ''; 
  req.session.data['applicant-overview-contact-email'] = contact.email || '';
  req.session.data['applicant-overview-contact-phone'] = contact.phone || '';

  res.render('current-service/back-office/edit-case/overview/applicant-overview-contact', {
    currentCase: currentCase,
    data: req.session.data
  });
});

// applicant overview contact - POST
router.post('/applicant-overview-contact-answer', function(req, res) {
  const data = req.session.data;
  const currentCase = getCase(req);
  if (!currentCase) return res.redirect('/current-service/back-office/cases');

  let errors = {};
  let errorList = [];

  const orgName = data['applicant-overview-contact-org-name'];
  const email = data['applicant-overview-contact-email'];
  const phone = data['applicant-overview-contact-phone'];

  // name validation
  const orgNameError = validateName(orgName, 'Applicant organisation name', 'applicant-overview-contact-org-name');
  if (orgNameError) {
    errors.orgName = { text: orgNameError.text };
    errorList.push(orgNameError);
  }

  // email validation
  const emailError = validateOptionalEmail(email, 'email address', 'applicant-overview-contact-email');
  if (emailError) {
    errors.email = { text: emailError.text };
    errorList.push(emailError);
  }

  // phone validation
  const phoneError = validatePhone(phone, 'telephone number', 'applicant-overview-contact-phone');
  if (phoneError) {
    errors.phone = { text: phoneError.text };
    errorList.push(phoneError);
  }

  // render errors if any
  if (errorList.length > 0) {
    return res.render('current-service/back-office/edit-case/overview/applicant-overview-contact', {
      currentCase: currentCase,
      data: data,
      errors: errors,
      errorList: errorList
    });
  }
  // save data after validation + post save cleanup
  const updatedContact = {
    orgName: orgName, 
    email: email,
    phone: phone
  };

  updateCaseData(req, currentCase.reference, {
    applicantOverviewContacts: [updatedContact] 
  });

  addAuditLog(req, currentCase.reference, 'Applicant contact details updated');

  delete data['applicant-overview-contact-org-name']; 
  delete data['applicant-overview-contact-email'];
  delete data['applicant-overview-contact-phone'];

  data.flashMessage = "Applicant contact details updated";
  res.redirect(`/current-service/back-office/case-details?reference=${currentCase.reference}`);
});







export default router;