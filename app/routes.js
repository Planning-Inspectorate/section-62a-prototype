import { Router } from 'express';
import govukPrototypeKit from "govuk-prototype-kit";
import { applyAzureHostingFix } from "./azure-hosting-fix.js";

// import bo-routers
import createCaseRouter from './bo-routes/create-a-case.js';
import caseDetailsRouter from './bo-routes/case-details.js';
import caseAuditLogRouter from './bo-routes/case-audit-log.js';

// import edit case bo-routers
import editCaseTeamRouter from './bo-routes/edit-case/case-team.js';
import editContactsRouter from './bo-routes/edit-case/contacts.js';
import editDatesRouter from './bo-routes/edit-case/dates.js';
import editDetailsRouter from './bo-routes/edit-case/details.js';
import editEiaRouter from './bo-routes/edit-case/eia.js';
import editFeeRouter from './bo-routes/edit-case/fee.js';
import editOverviewRouter from './bo-routes/edit-case/overview.js';
import editCaseRepsPeriodRouter from './bo-routes/edit-case/reps-period.js';


// import fo-routers
import applicationInformationRouter from './fo-routes/application-information.js';
import allApplicationsRouter from './fo-routes/all-applications.js';

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
  validateOptionalName,
  validateOptionalDecimalNumber
} from './helpers.js';

// run initialization fixes
applyAzureHostingFix();

const router = govukPrototypeKit.requests.setupRouter();

// mount bo-routers
router.use('/', createCaseRouter);
router.use('/', caseDetailsRouter);
router.use('/', caseAuditLogRouter);

// mount edit case bo-routers
router.use('/', editCaseTeamRouter);
router.use('/', editContactsRouter);
router.use('/', editDatesRouter);
router.use('/', editDetailsRouter);
router.use('/', editEiaRouter);
router.use('/', editFeeRouter);
router.use('/', editOverviewRouter);
router.use('/', editCaseRepsPeriodRouter);


// mount fo-routers
router.use('/', applicationInformationRouter);
router.use('/', allApplicationsRouter);

// New routes below this




export default router;