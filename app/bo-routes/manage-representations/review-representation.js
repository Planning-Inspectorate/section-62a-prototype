import { Router } from 'express';
import { getRepresentation } from '../../helpers.js'; 

const router = Router();


router.get('/current-service/back-office/manage-representations/review-representation/review', function (req, res) {
  
  // use the helper function to get the representation from the session
  const foundRep = getRepresentation(req);

  // fall back if the representation isn't found, redirect back to the manage representations page
  if (!foundRep) {
    return res.redirect('/current-service/back-office/manage-representations/manage-representations');
  }

  // render page using the found representation
  res.render('current-service/back-office/manage-representations/review-representation/review', {
    rep: foundRep
  });
});

export default router;