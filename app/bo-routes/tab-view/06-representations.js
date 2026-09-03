import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

router.get('/current-service/back-office/tab-view/06-representations', function(req, res) {
  // find the case and lock in session
  const foundCase = getCase(req);

  // safety bounce: If the case doesn't exist, kick them back to the list
  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases'); 
  }

  // handle flash messages (green success banners) for case edits
  const flashMessage = req.session.data['flashMessage'];

  req.session.data['flashMessage'] = null;

  // Render the page
  res.render('current-service/back-office/tab-view/06-representations', { 
    currentCase: foundCase,       
    flashMessage: flashMessage
  });
});

export default router;