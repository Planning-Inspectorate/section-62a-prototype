import { Router } from 'express';
import govukPrototypeKit from "govuk-prototype-kit";
import { applyAzureHostingFix } from "./azure-hosting-fix.js";

// import sub-routers
import createCaseRouter from './sub-routes/create-a-case.js';
import caseDetailsRouter from './sub-routes/case-details.js';
import caseAuditLogRouter from './sub-routes/case-audit-log.js';

// import edit case sub-routers
import editCaseTeamRouter from './sub-routes/edit-case/case-team.js';
import editContactsRouter from './sub-routes/edit-case/contacts.js';
import editDatesRouter from './sub-routes/edit-case/dates.js';
import editDetailsRouter from './sub-routes/edit-case/details.js';
import editEiaRouter from './sub-routes/edit-case/eia.js';
import editFeeRouter from './sub-routes/edit-case/fee.js';
import editOverviewRouter from './sub-routes/edit-case/overview.js';
import editCaseRepsPeriodRouter from './sub-routes/edit-case/reps-period.js';

// import helpers
import { 
  getCase, 
  addAuditLog, 
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
  updateCaseData,
  validateName,
  validateOptionalName
} from './helpers.js';

// run initialization fixes
applyAzureHostingFix();

const router = govukPrototypeKit.requests.setupRouter();

// mount sub-routers
router.use('/', createCaseRouter);
router.use('/', caseDetailsRouter);
router.use('/', caseAuditLogRouter);

// mount edit case sub-routers
router.use('/', editCaseTeamRouter);
router.use('/', editContactsRouter);
router.use('/', editDatesRouter);
router.use('/', editDetailsRouter);
router.use('/', editEiaRouter);
router.use('/', editFeeRouter);
router.use('/', editOverviewRouter);
router.use('/', editCaseRepsPeriodRouter);


// New routes below this




export default router;