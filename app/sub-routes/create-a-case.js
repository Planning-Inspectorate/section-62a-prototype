import { Router } from 'express';
import govukPrototypeKit from 'govuk-prototype-kit';
import { addAuditLog, validAuthorities, validateAndSaveAddress } from '../helpers.js';

const router = Router();

// --- ROUTES ---

router.get('/create-case-start', function (req, res) {
  const savedCases = req.session.data['cases'] || [];
  req.session.data = {};
  req.session.data['cases'] = savedCases;
  res.redirect('/current-service/back-office/create-a-case/1-application-type');
});



export default router;