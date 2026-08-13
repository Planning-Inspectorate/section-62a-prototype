import { Router } from 'express';
import { getCase } from '../helpers.js';

const router = Router();

// routes below this

router.get('/current-service/back-office/archived/case-audit-log', function(req, res) {
  const foundCase = getCase(req);
  
  // if isn't found, kick them back to the list (safety bounce)
  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases'); 
  }

  res.render('current-service/back-office/archived/case-audit-log', { 
    currentCase: foundCase
  });
});


export default router;