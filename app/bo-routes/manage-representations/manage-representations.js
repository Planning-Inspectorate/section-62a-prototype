import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

router.get('/current-service/back-office/manage-representations/manage-representations', function(req, res) {
  // find the case and lock in session
  const foundCase = getCase(req);

  // safety bounce: If the case doesn't exist, kick them back to the list
  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases'); 
  }

  // banner logic for accepted or rejected rep
  const successMessage = req.session.data['task-list-success-message'];
  delete req.session.data['task-list-success-message']; // clear message after showing once

    // showing results and pagination logic
    //  find total number of reps
    let totalReps = 0;
    if (foundCase && foundCase.representations) {
        totalReps = foundCase.representations.length;
    }

    // set up pagination logic
    const itemsPerPage = 25; // 25 | 50 | 100 options
    const currentPage = parseInt(req.query.page) || 1;

    // calculate start and end numbers
    const startItem = totalReps === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalReps);
    
  // Render the page
  res.render('current-service/back-office/manage-representations/manage-representations', { 
    currentCase: foundCase,
    totalReps: totalReps,
    startItem: startItem,
    endItem: endItem,
    successMessage: successMessage
  });
});

export default router;