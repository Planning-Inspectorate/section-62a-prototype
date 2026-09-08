import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

router.get('/current-service/back-office/tab-view/12-press-notice', function(req, res) {
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
  res.render('current-service/back-office/tab-view/12-press-notice', { 
    currentCase: foundCase,       
    flashMessage: flashMessage
  });
});


// specific route for publish button
router.post('/publish-status-answer-12-press-notice', function (req, res) {
  const foundCase = getCase(req);
  // Safety check: kick to case list if case not found
  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases');
  }
  // validation check
  if (foundCase.publishStatus !== "Yes") {
    
    // check if first line of site address exists and isn't empty
    const hasAddress = foundCase.siteAddress && 
                       foundCase.siteAddress.postcode && 
                       foundCase.siteAddress.postcode.trim() !== "";
    
    // check if both easting and northing exist and aren't empty
    const hasCoords = foundCase.siteCoords && 
                      foundCase.siteCoords.easting && foundCase.siteCoords.easting.trim() !== "" &&
                      foundCase.siteCoords.northing && foundCase.siteCoords.northing.trim() !== "";

    // block the publish if neither exists and re-render the page with an error
    if (!hasAddress && !hasCoords) {
      return res.render('current-service/back-office/tab-view/12-press-notice', {
        currentCase: foundCase,
        errorPublishValidation: "You must enter site coordinates or postcode within the site address"
      });
    }
  }
  
  // flip the publish status and set a flash message for the banner
  if (foundCase.publishStatus === "Yes") {
    foundCase.publishStatus = "No";
    req.session.data['flashMessage'] = "Application unpublished";
  } else {
    foundCase.publishStatus = "Yes";
    req.session.data['flashMessage'] = "Application published";
  }

  res.redirect(`/current-service/back-office/tab-view/12-press-notice?reference=${foundCase.reference}`);
});
export default router;