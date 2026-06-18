import { Router } from 'express';
import { getCase } from '../helpers.js';

const router = Router();

// routes

router.get('/current-service/front-office/all-applications', function (req, res) {
  
  // 1. Grab all cases from the session data (fallback to empty array if undefined)
  const allCases = req.session.data.cases || [];

  // 2. Filter using standard JavaScript. 
  // We only keep the cases where applicationStage is strictly "Application"
  const publishedCases = allCases.filter(c => c.applicationStage === "Application");

  // 3. Render the page and pass the clean array directly into Nunjucks
  res.render('current-service/front-office/all-applications', {
    publishedCases: publishedCases
  });
});


export default router;