import { Router } from 'express';
import { getCase, validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../../helpers.js';

const router = Router();

// --- ROUTES ---

// pre-application advice requested
router.get('/pre-application-advice-requested-change', function(req, res) {
    const foundCase = getCase(req); // find the correct case

    // pre-populate session data if the case has this data saved
    if (foundCase && foundCase.preApplicationRequested) {
        req.session.data['pre-application-advice-requested'] = foundCase.preApplicationRequested;
    }
    else {
        delete req.session.data['pre-application-advice-requested'];
    }
    
    // render page with pre-populated data
    res.render('current-service/back-office/edit-case/01-overview/has-pre-application-advice-been-requested-for-this-case', {
        foundCase: foundCase,
        data: req.session.data
    });
});

    // pre-application advice requested - post
    router.post('/edit-pre-application-advice-requested', function (req, res) {
        const foundCase = getCase(req); // find the correct case
        const preApplicationAdviceRequested = req.session.data['pre-application-advice-requested'];

        // validation
        if (!preApplicationAdviceRequested) {
            return res.render('current-service/back-office/edit-case/01-overview/has-pre-application-advice-been-requested-for-this-case', {
                foundCase: foundCase,
                data: req.session.data,
                errorPreApplicationAdviceRequested: "Select if pre-application advice has been requested for this application" 
            });
        }

        // save and update the exact object property
        if (foundCase) {
            foundCase.preApplicationRequested = preApplicationAdviceRequested;
            
            // clean references up if pre-app advice requested changes
            if (preApplicationAdviceRequested === "Yes - PINS") {
                foundCase.preApplicationReferenceCouncil = null; // wipe council
            } 
            else if (preApplicationAdviceRequested === "Yes - Council") {
                foundCase.preApplicationReferencePins = null; // wipe PINS
            } 
            else if (preApplicationAdviceRequested === "No") {
                foundCase.preApplicationReferencePins = null; // wipe both
                foundCase.preApplicationReferenceCouncil = null;
            }
        }
        
        // trigger success banner using the exact variables the overview tab expects
        req.session.data['flashMessage'] = "Pre-application advice updated";

        res.redirect('/current-service/back-office/tab-view/01-overview');
    });




export default router;