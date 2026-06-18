import { Router } from 'express';
import { getCase } from '../helpers.js';

const router = Router();

// routes

router.get('/current-service/front-office/application-information', function (req, res) {
  
  // 1. Find the case using your existing helper
  const currentCase = getCase(req);

  // 2. Fallback if no case is found (e.g., they jump straight to the page without a reference)
  if (!currentCase) {
    // You could redirect to a front-office case list here, or render an error state
    // res.redirect('/current-service/front-office/all-applications');
    // return;
  }

  // 3. Render the page, passing the specific case object to Nunjucks
  res.render('current-service/front-office/application-information', {
    currentCase: currentCase
  });
});

export default router;