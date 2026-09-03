import { Router } from 'express';
import { getCase, validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../../helpers.js';

const router = Router();

// --- ROUTES ---


// what  is the pre-app reference (PINS) - GET
router.get('/pre-app-ref-pins-change', function(req, res) {
    const foundCase = getCase(req); 

    // Pre-populate session data if the case has this data saved
    if (foundCase && foundCase.preApplicationReferencePins) {
        req.session.data['pre-app-ref-pins'] = foundCase.preApplicationReferencePins;
    } else {
        delete req.session.data['pre-app-ref-pins'];
    }

    // Build the dynamic list of PRE cases 
    const cases = req.session.data.cases || [];
    const preAppCases = cases.filter(c => c.reference && c.reference.endsWith('/PRE'));
    
    const preAppItems = preAppCases.map(c => ({
        value: c.reference,
        text: c.reference,
        selected: req.session.data['pre-app-ref-pins'] === c.reference
    }));

    preAppItems.unshift({
        value: "",
        text: "Select the pre-application reference or historic reference",
        selected: !req.session.data['pre-app-ref-pins']
    });

    // Render edit page with pre-populated data and items list
    // (Ensure this file path matches exactly where your edit HTML file lives)
    res.render('current-service/back-office/edit-case/17-pre-application/what-is-the-pre-application-reference-pins', {
        foundCase: foundCase,
        preAppItems: preAppItems,
        data: req.session.data
    });
});

    // what is the pre-app ref (PINS) - POST
    router.post('/edit-pre-app-ref-pins', function(req, res) {
        const foundCase = getCase(req);
        const preAppRef = req.session.data['pre-app-ref-pins'];

        // validation: if left blank
        if (!preAppRef || preAppRef.trim() === "") {
            // rebuild list on error
            const cases = req.session.data.cases || [];
            const preAppCases = cases.filter(c => c.reference && c.reference.endsWith('/PRE'));
            const preAppItems = preAppCases.map(c => ({
                value: c.reference,
                text: c.reference,
                selected: false
            }));
            preAppItems.unshift({
                value: "",
                text: "Select the pre-application reference or historic reference",
                selected: true
            });

            return res.render('current-service/back-office/edit-case/17-pre-application/what-is-the-pre-application-reference-pins', {
                foundCase: foundCase,
                preAppItems: preAppItems,
                data: req.session.data,
                errorPreAppRefPins: "Select a pre-application reference"
            });
        }
        // Save and update the object property
        if (foundCase) {
            foundCase.preApplicationReferencePins = preAppRef;
        }
        // Trigger success banner
        req.session.data['flashMessage'] = "Pre-application reference updated";

        res.redirect('/current-service/back-office/tab-view/17-pre-application'); 
    });


// what  is the pre-app reference (Council) - GET
router.get('/pre-app-ref-council-change', function(req, res) {
    const foundCase = getCase(req);

    // Pre-populate session data if the case has this data saved
    if (foundCase && foundCase.preApplicationReferenceCouncil) {
        req.session.data['pre-app-ref-council'] = foundCase.preApplicationReferenceCouncil;
    } else {
        delete req.session.data['pre-app-ref-council'];
    }

    res.render('current-service/back-office/edit-case/17-pre-application/what-is-the-pre-application-reference-council', {
        foundCase: foundCase,
        data: req.session.data
    });
});

    // what is the pre-app ref (PINS) - POST
    router.post('/edit-pre-app-ref-council', function(req, res) {
        const foundCase = getCase(req);
        const preAppRef = req.session.data['pre-app-ref-council'];

        // Validation
        if (!preAppRef || preAppRef.trim() === "") {
            return res.render('current-service/back-office/edit-case/17-pre-application/what-is-the-pre-application-reference-council', {
                foundCase: foundCase,
                data: req.session.data,
                errorPreAppRefCouncil: "Enter the pre-application reference"
            });
        }

        // Save and update the object property
        if (foundCase) {
            foundCase.preApplicationReferenceCouncil = preAppRef;
        }
        // Trigger success banner
        req.session.data['flashMessage'] = "Pre-application reference updated";

        res.redirect('/current-service/back-office/tab-view/17-pre-application');
    });



export default router;