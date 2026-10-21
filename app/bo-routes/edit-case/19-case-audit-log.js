import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

// application history
router.get('/get-application-history', function(req, res) {
  const foundCase = getCase(req);

  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases'); 
  }

  const flashMessage = req.session.data['flashMessage'];
  
  req.session.data['flashMessage'] = null;

  res.render('current-service/back-office/edit-case/19-case-audit-log/application-history', { 
    currentCase: foundCase,       
    flashMessage: flashMessage
  });
});


export default router;