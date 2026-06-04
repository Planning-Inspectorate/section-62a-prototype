import { Router } from 'express';
import govukPrototypeKit from "govuk-prototype-kit";
import { applyAzureHostingFix } from "./azure-hosting-fix.js";

// import sub-routers
import createCaseRouter from './sub-routes/create-a-case.js';
import caseDetailsRouter from './sub-routes/case-details.js';
import caseAuditLogRouter from './sub-routes/case-audit-log.js';

// import helpers
import { 
  getCase, 
  addAuditLog, 
  validatePostcode, 
  validateDate, 
  validateDateTime, 
  validateNumber,
  validateEmail,
  validateOptionalPhone,
  validateOptionalSiteCoords,
  validateOptionalNumber,
  validateOptionalDate,
  updateCaseData
} from './helpers.js';

// run initialization fixes
applyAzureHostingFix();

const router = govukPrototypeKit.requests.setupRouter();

// mount sub-routers
router.use('/', createCaseRouter);
router.use('/', caseDetailsRouter);
router.use('/', caseAuditLogRouter);

// New routes below this

// Fix deployed manifest.json 404 fallback syntax errors
router.get(['/manifest.json', '*/manifest.json'], function (req, res) {
  res.json({ "icons": [] });
});




export default router;