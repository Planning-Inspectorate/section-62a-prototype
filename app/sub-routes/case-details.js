import { Router } from 'express';
import { getCase } from '../helpers.js';

const router = Router();

// routes below this

router.get('/current-service/back-office/case-details', function(req, res) {
  // find the case and lock in session
  const foundCase = getCase(req);

  // Safety bounce: If the case doesn't exist, kick them back to the list
  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases'); 
  }

  // Handle flash messages (green success banners) for edits
  const sectionToJumpTo = req.session.data['flashSection'];
  const flashMessage = req.session.data['flashMessage'];
  
  req.session.data['flashSection'] = null; 
  req.session.data['flashMessage'] = null;

  // Render the page
  res.render('current-service/back-office/case-details', { 
    currentCase: foundCase,       
    flashSection: sectionToJumpTo,
    flashMessage: flashMessage
  });
});

export default router;