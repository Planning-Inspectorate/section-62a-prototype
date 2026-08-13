import { Router } from 'express';
import { getRepresentation } from '../../helpers.js'; 

const router = Router();

// VIEW REP - load correct rep
router.get('/current-service/back-office/manage-representations/view', function (req, res) {
  const rep = getRepresentation(req);
  // if rep is missing, send back to manage-representations page
  if (!rep) {
    return res.redirect('/current-service/back-office/manage-representations/manage-representations');
  }

  // success message logic
  const successMessage = req.session.data['edit-success-message'];
  delete req.session.data['edit-success-message']; // clear message after showing once

  // render page using the found representation
  res.render('current-service/back-office/manage-representations/view', {
    rep: rep,
    successMessage: successMessage // pass success message to page template
  });
});




export default router;