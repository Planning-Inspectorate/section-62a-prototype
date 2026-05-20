import { Router } from 'express';
import govukPrototypeKit from "govuk-prototype-kit";
import { applyAzureHostingFix } from "./azure-hosting-fix.js";
import createCaseRouter from './sub-routes/create-a-case.js';
import { 
  getCase, 
  addAuditLog, 
  validatePostcode, 
  validateAndSaveDate, 
  validateAndSaveDateTime, 
  validateAndSaveNumber
} from './helpers.js';

// Run initialization fixes
applyAzureHostingFix();

const router = govukPrototypeKit.requests.setupRouter();

// Mount sub-routers
router.use('/', createCaseRouter);

// New routes below this




export default router;