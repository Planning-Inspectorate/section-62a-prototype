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

// import tab-view case bo-routers
import overviewTabRouter from './bo-routes/tab-view/01-overview.js';
import detailsTabRouter from './bo-routes/tab-view/02-details.js';
import updatesTabRouter from './bo-routes/tab-view/03-updates.js';
import contactsTabRouter from './bo-routes/tab-view/04-contacts.js';
import datesTabRouter from './bo-routes/tab-view/05-dates.js';
import representationsTabRouter from './bo-routes/tab-view/06-representations.js';
import caseTeamTabRouter from './bo-routes/tab-view/07-case-team.js';
import eventTabRouter from './bo-routes/tab-view/08-event.js';
import outcomeTabRouter from './bo-routes/tab-view/09-outcome.js';
import eiaTabRouter from './bo-routes/tab-view/10-eia.js';
import feeTabRouter from './bo-routes/tab-view/11-fee.js';
import pressNoticeTabRouter from './bo-routes/tab-view/12-press-notice.js';
import residentialTabRouter from './bo-routes/tab-view/13-residential.js';
import nonResidentialTabRouter from './bo-routes/tab-view/14-non-residential.js';
import vehicleParkingTabRouter from './bo-routes/tab-view/15-vehicle-parking.js';
import wasteTabRouter from './bo-routes/tab-view/16-waste.js';
import preApplicationTabRouter from './bo-routes/tab-view/17-pre-application.js';

// import fo-routers
import applicationInformationRouter from './fo-routes/application-information.js';
import allApplicationsRouter from './fo-routes/all-applications.js';
import haveYourSayUrRouter from './fo-routes/have-your-say-ur.js';

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

// mount tab-view bo-routes
router.use('/', overviewTabRouter);
router.use('/', detailsTabRouter);
router.use('/', updatesTabRouter);
router.use('/', contactsTabRouter);
router.use('/', datesTabRouter);
router.use('/', representationsTabRouter);
router.use('/', caseTeamTabRouter);
router.use('/', eventTabRouter);
router.use('/', outcomeTabRouter);
router.use('/', eiaTabRouter);
router.use('/', feeTabRouter);
router.use('/', pressNoticeTabRouter);
router.use('/', residentialTabRouter);
router.use('/', nonResidentialTabRouter);
router.use('/', vehicleParkingTabRouter);
router.use('/', wasteTabRouter);
router.use('/', preApplicationTabRouter);


// mount fo-routers
router.use('/', applicationInformationRouter);
router.use('/', allApplicationsRouter);
router.use('/', haveYourSayUrRouter);

// New routes below this




export default router;