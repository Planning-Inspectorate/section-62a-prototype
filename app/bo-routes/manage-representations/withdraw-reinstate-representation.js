import { Router } from 'express';
import { getRepresentation, validateDate } from '../../helpers.js'; 

const router = Router();


// WITHDRAW JOURNEY
router.get('/withdraw-representation-start', function (req, res) {
    const rep = getRepresentation(req);
    const data = req.session.data;

    // if rep is missing, send back to manage-representations page
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }

    // Add the name of your file upload variable to this list too!
    const fieldsToClear = [
        'enter-date-of-withdrawal-request-day',
        'enter-date-of-withdrawal-request-month',
        'enter-date-of-withdrawal-request-year',
        'why-is-the-representation-being-withdrawn',
        'uploadedFiles'
    ];

    fieldsToClear.forEach(field => {
        delete data[field];
    });

    res.render('current-service/back-office/manage-representations/withdraw-representation/01-enter-date-of-withdrawal-request', {
        rep: rep,
        data: req.session.data // Passes the freshly scrubbed/hydrated data
    });
});


// 01 - enter date of withdrawal request
router.get('/current-service/back-office/manage-representations/withdraw-representation/01-enter-date-of-withdrawal-request', function (req, res) {
    const rep = getRepresentation(req);

    // if rep is missing, send back to manage-representations page
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }

    // Pre-populate session data if the rep already has a withdrawn date
    if (rep.withdrawnDate && rep.withdrawnDate.day) {
        req.session.data['enter-date-of-withdrawal-request-day'] = rep.withdrawnDate.day;
        req.session.data['enter-date-of-withdrawal-request-month'] = rep.withdrawnDate.month;
        req.session.data['enter-date-of-withdrawal-request-year'] = rep.withdrawnDate.year;
    }

    // render page using the found representation
    res.render('current-service/back-office/manage-representations/withdraw-representation/01-enter-date-of-withdrawal-request', {
        rep: rep,
        data: req.session.data
    });
});

    // 01 - post
    router.post('/enter-date-of-withdrawal-request-answer', function (req, res) {
        const rep = getRepresentation(req);
        
        // Grab the date values from session data
        const day = req.session.data['enter-date-of-withdrawal-request-day'];
        const month = req.session.data['enter-date-of-withdrawal-request-month'];
        const year = req.session.data['enter-date-of-withdrawal-request-year'];

        // error containers
        const errors = {};
        const errorList = [];
        
        // pass objects to the helper and create error object
        const dateError = validateDate(day, month, year, "Withdrawal request date", "enter-date-of-withdrawal-request");

        // set error message from helper
        if (dateError) {
            errors.enterDateOfWithdrawalRequest = { text: dateError.text };
            
            // loop array of dateError and create simple flags for the html to add error classes to relevant inputs
            if (dateError.errorFields) {
                dateError.errorFields.forEach(field => {
                    errors[field] = true; 
                });
            }
            errorList.push(dateError);
        }

        // if there are errors, re-render the page
        if (errorList.length > 0) {
            return res.render('current-service/back-office/manage-representations/withdraw-representation/01-enter-date-of-withdrawal-request', {
                rep: rep,
                errors: errors,
                errorList: errorList
            });
        }

        // save and update the exact object property
        if (rep) {
            rep.withdrawnDate = {
                day: day,
                month: month,
                year: year
            };
        }

        // redirect to next question
        res.redirect('/current-service/back-office/manage-representations/withdraw-representation/02-why-is-the-representation-being-withdrawn');
    });


// 02 - why is the representation being withdrawn
router.get('/current-service/back-office/manage-representations/withdraw-representation/02-why-is-the-representation-being-withdrawn', function (req, res) {
    const rep = getRepresentation(req);

    // safety bounce
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }
    // hydrate session data if it exists in the rep object
    if (rep.withdrawnReason) {
        req.session.data['why-is-the-representation-being-withdrawn'] = rep.withdrawnReason;
    }
    // render the page
    res.render('current-service/back-office/manage-representations/withdraw-representation/02-why-is-the-representation-being-withdrawn', {
        rep: rep,
        data: req.session.data
    });
});

    // 02 - post
    router.post('/why-is-the-representation-being-withdrawn-answer', function(req, res) {
        const rep = getRepresentation(req);
        const withdrawReason = req.session.data['why-is-the-representation-being-withdrawn'];

        // validation
        if (!withdrawReason) {
            return res.render('current-service/back-office/manage-representations/withdraw-representation/02-why-is-the-representation-being-withdrawn', {
                rep: rep,
                data: req.session.data,
                errorWhyIsTheRepresentationBeingWithdrawn: "Select why the representation is being withdrawn"
            });
        }
        // save data to the representation object
        if (rep) {
            rep.withdrawnReason = withdrawReason;
        }
        res.redirect('/current-service/back-office/manage-representations/withdraw-representation/03-upload-the-withdrawal-request'); 
    });


// 03 - upload withdrawal request
router.get('/current-service/back-office/manage-representations/withdraw-representation/03-upload-the-withdrawal-request', function(req, res) {
    const rep = getRepresentation(req); 
    
    // safety bounce
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }
    // pre-populate session data if files were already uploaded
    if (rep.withdrawnRequest && rep.withdrawnRequest.length > 0) {
        req.session.data['uploadedFiles'] = rep.withdrawnRequest.join('||');
    }
    // render page with pre-populated data to ensure instant hydration
    res.render('current-service/back-office/manage-representations/withdraw-representation/03-upload-the-withdrawal-request', {
        rep: rep,
        data: req.session.data
    });
});

    // 03 - post
    router.post('/upload-the-withdrawal-request-answer', function(req, res) {
        const rep = getRepresentation(req);
        const uploadedFiles = req.session.data['uploadedFiles'];
        
        const errors = {};
        const errorList = [];

        // validation
        if (!uploadedFiles || uploadedFiles.length === 0) {
            errors.uploadedFiles = { text: "Upload the withdrawal request" };
            errorList.push({ text: "Upload the withdrawal request", href: "#documents" }); 
        }

        // render errors if any
        if (errorList.length > 0) {
            return res.render('current-service/back-office/manage-representations/withdraw-representation/03-upload-the-withdrawal-request', {
                rep: rep,
                data: req.session.data,
                errors: errors,
                errorList: errorList
            });
        }
        // redirect to cya
        res.redirect('/current-service/back-office/manage-representations/withdraw-representation/check-your-answers');
    });


// 04 - check your answers
router.post('/withdrawal-request-submitted', function(req, res) {
    const rep = getRepresentation(req);
    const data = req.session.data;
    
    if (rep) {
        // save date data
        rep.withdrawnDate = {
            day: data['enter-date-of-withdrawal-request-day'],
            month: data['enter-date-of-withdrawal-request-month'],
            year: data['enter-date-of-withdrawal-request-year']
        };

        // save reason
        rep.withdrawnReason = data['why-is-the-representation-being-withdrawn'];

        // save uploaded files
        const uploadedFiles = data['uploadedFiles'];
        if (uploadedFiles) {
            rep.withdrawnRequest = uploadedFiles.split('||');
        }

        // save previous status
        rep.previousStatus = rep.status;

        // update overall status
        rep.status = "Withdrawn"; 
    }
    const fieldsToClear = [
        'enter-date-of-withdrawal-request-day',
        'enter-date-of-withdrawal-request-month',
        'enter-date-of-withdrawal-request-year',
        'why-is-the-representation-being-withdrawn',
        'uploadedFiles'
    ];

    fieldsToClear.forEach(field => {
        delete data[field];
    });
    // redirect to success page
    res.redirect('/current-service/back-office/manage-representations/withdraw-representation/success');
});


// 05 - success page
router.get('/current-service/back-office/manage-representations/withdraw-representation/success', function(req, res) {
    const rep = getRepresentation(req);
    
    // safety bounce if they try to access this URL directly without an active rep
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }

    res.render('current-service/back-office/manage-representations/withdraw-representation/success', {
        rep: rep
    });
});



// REINSTATE JOURNEY
// 01 - reinstate representation
router.get('/reinstate-representation-start', function(req, res) {
    const rep = getRepresentation(req);
    
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }

    res.render('current-service/back-office/manage-representations/reinstate-representation/01-reinstate-representation', {
        rep: rep
    });
});

    // 01 - post
    router.post('/reinstate-request-submitted', function(req, res) {
        const rep = getRepresentation(req);
        
        if (rep) {
            // restore the previous status (with a safe fallback just in case)
            rep.status = rep.previousStatus || "Awaiting review"; 
            
            // wipe the withdrawal data so it's a clean slate
            rep.withdrawn = false;
            rep.withdrawnDate = null;
            rep.withdrawnReason = null;
            rep.withdrawnRequest = [];
            rep.previousStatus = null; // clean up previous status
        }

        // Redirect to the success page
        res.redirect('/current-service/back-office/manage-representations/reinstate-representation/success');
    });


// success page
router.get('/current-service/back-office/manage-representations/reinstate-representation/success', function(req, res) {
    const rep = getRepresentation(req);
    
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }

    res.render('current-service/back-office/manage-representations/reinstate-representation/success', {
        rep: rep
    });
});
export default router;