import { Router } from 'express';
import { getRepresentation } from '../../helpers.js'; 

const router = Router();


router.get('/current-service/back-office/manage-representations/review-representation/review', function (req, res) {
  const foundRep = getRepresentation(req);
  // if rep is missing, send back to manage-representations page
  if (!foundRep) {
    return res.redirect('/current-service/back-office/manage-representations/manage-representations');
  }

  // success message logic
  const successMessage = req.session.data['edit-success-message'];
  delete req.session.data['edit-success-message']; // clear message after showing once

  // render page using the found representation
  res.render('current-service/back-office/manage-representations/review-representation/review', {
    rep: foundRep,
    successMessage: successMessage // pass success message to page template
  });
});

export default router;