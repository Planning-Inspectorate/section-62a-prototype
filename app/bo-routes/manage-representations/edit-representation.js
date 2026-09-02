import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName, getRepresentation } from '../../helpers.js';

const router = Router();

// edit routes below this

// 01 - date the representation was received
router.get('/edit-date-received', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef

    // pre-populate session data if rep exists
    if (rep && rep.submissionDate) {
    req.session.data['date-the-representation-was-received-day'] = rep.submissionDate.day;
    req.session.data['date-the-representation-was-received-month'] = rep.submissionDate.month;
    req.session.data['date-the-representation-was-received-year'] = rep.submissionDate.year;
    }
    else {
        delete req.session.data['date-the-representation-was-received-day'];
        delete req.session.data['date-the-representation-was-received-month'];
        delete req.session.data['date-the-representation-was-received-year'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/01-date-the-representation-was-received', {
        rep: rep,
        data: req.session.data
    });
    
});

    // 01 - post
    router.post('/edit-date-the-representation-was-received', function (req, res) {
        const rep = getRepresentation(req);
        const day = req.session.data['date-the-representation-was-received-day'];
        const month = req.session.data['date-the-representation-was-received-month'];
        const year = req.session.data['date-the-representation-was-received-year'];

        // error containers
        const errors = {};
        const errorList = [];
        
        // pass objects to the helper and create error object
        const dateError = validateDate(day, month, year, "Representation received date", "date-the-representation-was-received");

        // set error message from helper
        if (dateError) {
        errors.dateTheRepresentationWasReceived = { text: dateError.text };
        
        // loop array of dateError and create simple flags for the html to add error classes to relevant inputs
        if (dateError.errorFields) {
            dateError.errorFields.forEach(field => {
            errors[field] = true; 
            });
        }
        errorList.push(dateError);
        }
        if (errorList.length > 0) {
            return res.render('current-service/back-office/manage-representations/edit-representation/01-date-the-representation-was-received', {
            rep: rep,
            data: req.session.data,
            errors: errors,
            errorList: errorList
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.submissionDate = {
            day: day,
            month: month,
            year: year
            };

        // update the backup ISO string so the main table sorting doesn't break
        const paddedDay = (day || '').padStart(2, '0');
        const paddedMonth = (month || '').padStart(2, '0');
        rep.backupIso = (year && month && day) ? `${year}-${paddedMonth}-${paddedDay}T00:00:00.000Z` : new Date().toISOString();
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";

        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 02 - how was this representation received
router.get('/edit-how-received', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef

    // pre-populate session data if rep exists
    if (rep && rep.howReceived) {
        req.session.data['how-was-this-representation-received'] = rep.howReceived;
    }
    else {
        delete req.session.data['how-was-this-representation-received'];
    }
    
    // Use res.render, but manually push the freshly updated session data into the template 
    res.render('current-service/back-office/manage-representations/edit-representation/02-how-was-this-representation-received', {
        rep: rep, // load rep information
        data: req.session.data // hydrate fields
    });
});

    // 02 - post
        router.post('/edit-how-was-this-representation-received', function (req, res) {
            const rep = getRepresentation(req);
            const howWasThisRepresentationReceived = req.session.data['how-was-this-representation-received'];

            // validation
            if (!howWasThisRepresentationReceived) {
                return res.render('current-service/back-office/manage-representations/edit-representation/02-how-was-this-representation-received', {
                    rep: rep,
                    data: req.session.data,
                    errorHowWasThisRepresentationReceived: "Select how this representation was received"
                });
            }
        
            // save and update the exact object property
            if (rep) {
                rep.howReceived = howWasThisRepresentationReceived;
                
                // trigger success banner
                req.session.data['edit-success-message'] = "Representation has been updated";

                // redirect based on the overall status 
                if (rep.status === "Accepted" || rep.status === "Rejected") {
                    res.redirect('/current-service/back-office/manage-representations/view');
                }
                else if (rep.status === "Awaiting review") {
                    res.redirect('/current-service/back-office/manage-representations/review-representation/review');
                }
                else {
                    // fallback
                    res.redirect('/current-service/back-office/manage-representations/manage-representations');
                }
            }
        });


// 03 - reason for not using online service
router.get('/edit-reason-not-online', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.reasonNotOnline) {
        req.session.data['reason-for-not-using-online-service'] = rep.reasonNotOnline;
    }
    else {
        delete req.session.data['reason-for-not-using-online-service'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/03-reason-for-not-using-online-service', {
        rep: rep,
        data: req.session.data
    });
});

    // 03 - post
    router.post('/edit-reason-for-not-using-online-service', function (req, res) {
        const rep = getRepresentation(req);
        const reasonForNotUsingOnlineService = req.session.data['reason-for-not-using-online-service'];

        // no validation needed as this is optional

        // save and update the exact object property
        if (rep) {
            rep.reasonNotOnline = reasonForNotUsingOnlineService;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 04 - representation type
router.get('/edit-rep-type', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.type) {
        req.session.data['type-of-representation-submitted'] = rep.type;
    }
    else {
        delete req.session.data['type-of-representation-submitted'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/04-type-of-representation-submitted', {
        rep: rep,
        data: req.session.data
    });
});

    // 04 - post
    router.post('/edit-type-of-representation-submitted', function (req, res) {
        const rep = getRepresentation(req);
        const typeOfRepresentationSubmitted = req.session.data['type-of-representation-submitted'];
        
        // validation
        if (!typeOfRepresentationSubmitted) {
            return res.render('current-service/back-office/manage-representations/edit-representation/04-type-of-representation-submitted', {
                rep: rep,
                data: req.session.data,
                errorTypeOfRepresentationSubmitted: "Select the type of representation submitted"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.type = typeOfRepresentationSubmitted;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 05 - source of the representation
router.get('/edit-rep-source', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // re-populate if it exists, wipe form if not to clear ghost data
    if (rep && rep.isAgent) {
        req.session.data['is-agent'] = rep.isAgent;
    } else {
        delete req.session.data['is-agent']; 
    }

    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/05-source-of-the-representation', {
        rep: rep,
        data: req.session.data
    });
});

    // 05 - post
    router.post('/edit-source-of-representation', function (req, res) {
        const rep = getRepresentation(req);
        const sourceOfRepresentation = req.session.data['source-of-representation'];

        // validation
        if (!sourceOfRepresentation) {
            return res.render('current-service/back-office/manage-representations/edit-representation/05-source-of-the-representation', {
                rep: rep,
                data: req.session.data,
                errorSourceOfRepresentation: "Select the source of the representation"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.submitterType = sourceOfRepresentation;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 06 - name of the person submitting the representation
router.get('/edit-submitter-name', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.submitterName) {
        // split submitterName into first and last name to match form inputs
        const nameParts = rep.submitterName.split(' ');
        
        // First word is the first name, the rest is the last name
        req.session.data['your-first-name'] = nameParts[0];
        req.session.data['your-last-name'] = nameParts.slice(1).join(' ');
    }
    
    // redirect to render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/06-name-of-the-person-submitting-the-representation', {
        rep: rep,
        data: req.session.data
    });
});

    // 06 - post
    router.post('/edit-your-name', function(req, res) {
        const rep = getRepresentation(req);
        const firstName = req.session.data['your-first-name'];
        const lastName = req.session.data['your-last-name'];

        // error containers
        const errors = {};
        const errorList = [];

        // validate name fields
        if (!firstName) {
            errors.firstName = {text: "First name must be between 1 and 250 characters"};
            errorList.push({ text: "First name must be between 1 and 250 characters", href: "#your-first-name" });
        }
        if (!lastName) {
            errors.lastName = {text: "Last name must be between 1 and 250 characters"};
            errorList.push({ text: "Last name must be between 1 and 250 characters", href: "#your-last-name" });
        }
        // render errors if any
        if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/edit-representation/06-name-of-the-person-submitting-the-representation', {
            rep: rep,
            data: req.session.data,
            errors: errors,
            errorList: errorList
        });
        }
        if (rep) {
            // stitch first and last name back together and save to object
            rep.submitterName = `${firstName} ${lastName}`;
        }
        req.session.data['edit-success-message'] = "Representation has been updated";

        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 06a - would you like to hide your name from being published
router.get('/edit-hide-name', function(req, res) {
    const rep = getRepresentation (req);

    //pre-populate session data
    if (rep && rep.obscureName) {
        req.session.data['obscure-name'] = rep.obscureName;
    }
    else {
        delete req.session.data['obscure-name'];
    }

    // Use res.render, but manually push the freshly updated session data into the template 
    res.render('current-service/back-office/manage-representations/edit-representation/06a-does-the-interested-party-want-their-name-obscured', {
        rep: rep, // load rep information
        data: req.session.data // hydrate fields
    });
});

    // 06a - post
    router.post('/edit-obscure-name', function (req, res) {
            const rep = getRepresentation(req);
            const obscureName = req.session.data['obscure-name'];

            // validation
            if (!obscureName) {
                return res.render('current-service/back-office/manage-representations/edit-representation/06a-does-the-interested-party-want-their-name-obscured', {
                    rep: rep,
                    data: req.session.data,
                    errorObscureName: "Select yes if the interested party wants their name withheld"
                });
            }
        
            // save and update the exact object property
            if (rep) {
                rep.obscureName = obscureName;
                
                // trigger success banner
                req.session.data['edit-success-message'] = "Representation has been updated";

                // redirect based on the overall status 
                if (rep.status === "Accepted" || rep.status === "Rejected") {
                    res.redirect('/current-service/back-office/manage-representations/view');
                }
                else if (rep.status === "Awaiting review") {
                    res.redirect('/current-service/back-office/manage-representations/review-representation/review');
                }
                else {
                    // fallback
                    res.redirect('/current-service/back-office/manage-representations/manage-representations');
                }
            }
        });


// 07 - contact method
router.get('/edit-contact-method', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.contactMethod) {
        req.session.data['preferred-contact-method'] = rep.contactMethod;
    }
    else {
        delete req.session.data['preferred-contact-method'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/07-preferred-contact-method', {
        rep: rep,
        data: req.session.data
    });
});

    // 07 - post
    router.post('/edit-preferred-contact-method', function (req, res) {
        const rep = getRepresentation(req);
        const preferredContactMethod = req.session.data['preferred-contact-method'];
        
        // validation
        if (!preferredContactMethod) {
            return res.render('current-service/back-office/manage-representations/edit-representation/07-preferred-contact-method', {
                rep: rep,
                data: req.session.data,
                errorPreferredContactMethod: "Select your preferred contact method"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.contactMethod = preferredContactMethod;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";

        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 08 - email address provided
router.get('/edit-email', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.submitterEmail) {
        req.session.data['your-email-address'] = rep.submitterEmail;
    }
    else {
        delete req.session.data['your-email-address'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/08-email-address-provided', {
        rep: rep,
        data: req.session.data
    });
});

    // 08 - post
    router.post('/edit-your-email-address', function (req, res) {
        const rep = getRepresentation(req);
        const yourEmailAddress = req.session.data['your-email-address'];

        // validation
        const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;

        if (!yourEmailAddress) {
            return res.render('current-service/back-office/manage-representations/edit-representation/08-email-address-provided', {
                rep: rep,
                data: req.session.data, 
                errorYourEmailAddress: "Enter your email address" 
            });
        }
        if (!emailRegex.test(yourEmailAddress)) {
            return res.render('current-service/back-office/manage-representations/edit-representation/08-email-address-provided', {
                rep: rep,
                data: req.session.data, 
                errorYourEmailAddress: "Enter your email address in the correct format, like name@example.com" 
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.submitterEmail = yourEmailAddress;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 09 - postal address provided
router.get('/edit-postal-address', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists and has an address
    if (rep && rep.postalAddress) {
        req.session.data['postal-address-line-1'] = rep.postalAddress.line1;
        req.session.data['postal-address-line-2'] = rep.postalAddress.line2;
        req.session.data['postal-address-town'] = rep.postalAddress.town;
        req.session.data['postal-address-county'] = rep.postalAddress.county;
        req.session.data['postal-address-postcode'] = rep.postalAddress.postcode;
    }
    else {
        delete req.session.data['postal-address-line-1'];
        delete req.session.data['postal-address-line-2'];
        delete req.session.data['postal-address-town'];
        delete req.session.data['postal-address-county'];
        delete req.session.data['postal-address-postcode'];
    }
    // redirect to render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/09-postal-address-provided', {
        rep: rep,
        data: req.session.data
    });
});

    // 09 - post
    router.post('/edit-postal-address', function(req, res) {
        const rep = getRepresentation(req);
        
        const postalAddressLine1 = req.session.data['postal-address-line-1'];
        const postalAddressLine2 = req.session.data['postal-address-line-2']; // optional
        const postalAddressTown = req.session.data['postal-address-town'];
        const postalAddressCounty = req.session.data['postal-address-county']; // optional
        const postalAddressPostcode = req.session.data['postal-address-postcode'];
        
        const postcodeError = validatePostcode(postalAddressPostcode);
        
        // error containers
        const errors = {};
        const errorList = [];

        // validation
        if (!postalAddressLine1) {
            errors.postalAddressLine1 = {text: "Enter your address line 1"};
            errorList.push({ text: "Enter your address line 1", href: "#postal-address-line-1" });
        }
        if (!postalAddressTown) {
            errors.postalAddressTown = {text: "Enter your town or city"};
            errorList.push({ text: "Enter your town or city", href: "#postal-address-town" });
        }
        if (!postalAddressPostcode) {
            errors.postalAddressPostcode = {text: "Enter your postcode"};
            errorList.push({ text: "Enter your postcode", href: "#postal-address-postcode" });
        }
        if (postcodeError) {
            errors.postalAddressPostcode = { text: postcodeError };
            errorList.push({ text: postcodeError, href: "#postal-address-postcode" });
        }
        // render errors if any
        if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/edit-representation/09-postal-address-provided', {
            rep: rep,
            data: req.session.data, 
            errors: errors,
            errorList: errorList
        });
        }
        // save back to the exact object property
        if (rep) {
            rep.postalAddress = {
                line1: postalAddressLine1,
                line2: postalAddressLine2,
                town: postalAddressTown,
                county: postalAddressCounty,
                postcode: postalAddressPostcode
            };
        }
        // Set success banner and redirect
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 10 - written representation submitted
router.get('/edit-comment', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.comment) {
        req.session.data['written-representation-submitted'] = rep.comment;
    }
    else {
        delete req.session.data['written-representation-submitted'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/10-written-representation-submitted', {
        rep: rep,
        data: req.session.data
    });
});

    // 10 - post
    router.post('/edit-written-representation-submitted', function (req, res) {
        const rep = getRepresentation(req);
        const writtenRepresentationSubmitted = req.session.data['written-representation-submitted'];

        // validation
        if (!writtenRepresentationSubmitted) {
            return res.render('current-service/back-office/manage-representations/edit-representation/10-written-representation-submitted', {
                rep: rep,
                data: req.session.data,
                errorWrittenRepresentationSubmitted: "Enter what you want to tell us about this proposed application"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.comment = writtenRepresentationSubmitted;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 11 - would you like to be heard at a hearing
router.get('/edit-hearing', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.wantsHearing) {
        req.session.data['would-you-like-to-be-heard-at-a-hearing'] = rep.wantsHearing;
    }
    else {
        delete req.session.data['would-you-like-to-be-heard-at-a-hearing'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/11-would-you-like-to-be-heard-at-a-hearing', {
        rep: rep,
        data: req.session.data
    });
});

    // 11 - post
    router.post('/edit-would-you-like-to-be-heard-at-a-hearing', function (req, res) {
        const rep = getRepresentation(req);
        const wouldYouLikeToBeHeardAtAHearing = req.session.data['would-you-like-to-be-heard-at-a-hearing'];

        // validation
        if (!wouldYouLikeToBeHeardAtAHearing) {
            return res.render('current-service/back-office/manage-representations/edit-representation/11-would-you-like-to-be-heard-at-a-hearing', {
                rep: rep,
                data: req.session.data,
                errorWouldYouLikeToBeHeardAtAHearing: "Select yes if you would like to be heard at a hearing"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.wantsHearing = wouldYouLikeToBeHeardAtAHearing;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 12 - are there any attachments
router.get('/edit-has-attachments' , function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.hasAttachments) {
        req.session.data['are-there-any-attachments'] = rep.hasAttachments;
    }
    else {
        req.session.data['are-there-any-attachments'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/12-are-there-any-attachments', {
        rep: rep,
        data: req.session.data
    });
});

    // 12 - post
    router.post('/edit-are-there-any-attachments', function (req, res) {
        const rep = getRepresentation(req);
        const areThereAnyAttachments = req.session.data['are-there-any-attachments'];

        // validation
        if (!areThereAnyAttachments) {
            return res.render('current-service/back-office/manage-representations/edit-representation/12-are-there-any-attachments', {
                rep: rep,
                data: req.session.data,
                errorAreThereAnyAttachments: "Select yes if there are any attachments to this representation"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.hasAttachments = areThereAnyAttachments;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 13 - upload attachments
router.get('/edit-attachments', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.attachments) {
        req.session.data['uploadedFiles'] = rep.attachments.join('||');
    }
    else {
        delete req.session.data['uploadedFiles'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/13-upload-attachments', {
        rep: rep,
        data: req.session.data
    });
});

    // 13 - post
    router.post('/edit-bo-upload-supporting-attachments', function(req, res) {
        const rep = getRepresentation(req);
        const uploadedFiles = req.session.data['uploadedFiles'];
        
        // error containers
        const errors = {};
        const errorList = [];

        // validation
        if (!uploadedFiles || uploadedFiles.length === 0) {
            errors.uploadedFiles = { text: "Upload an attachment" };
            errorList.push({ text: "Upload an attachment", href: "#documents" });
        }
        // render errors if any
        if (errorList.length > 0) {
            return res.render('current-service/back-office/manage-representations/edit-representation/13-upload-attachments', {
                rep: rep,
                data: req.session.data,
                errors: errors,
                errorList: errorList
            });
        }
        // save back to the exact object property
        if (rep) {
            // Convert the '||' string back into an array
            rep.attachments = uploadedFiles.split('||');
        
        // set success banner and redirect
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status
                if (rep.status === "Accepted" || rep.status === "Rejected") {
                    // If it's already processed, send them back to the 'view' page
                    res.redirect('/current-service/back-office/manage-representations/view');
                }
                else if (rep.status === "Awaiting review") {
                    // If it's still being reviewed, send them back to the 'review' page
                    res.redirect('/current-service/back-office/manage-representations/review-representation/review');
                }
                else {
                    // Safe fallback just in case!
                    res.redirect('/current-service/back-office/manage-representations/manage-representations');
                }
        }
    });


// 14 - representations made on behalf of
router.get('/edit-rep-on-behalf-of', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef

    // re-populate if it exists, wipe form if not to clear ghost data
    if (rep && rep.representing) {
        req.session.data['representation-made-on-behalf-of'] = rep.representing;
    } 
    else {
        delete req.session.data['representation-made-on-behalf-of']; 
    }

    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/14-representation-made-on-behalf-of', {
        rep: rep,
        data: req.session.data
    });
});

    // 14 - post
    router.post('/edit-representation-made-on-behalf-of', function (req, res) {
        const rep = getRepresentation(req);
        const representationMadeOnBehalfOf = req.session.data['representation-made-on-behalf-of'];

        // validation
        if (!representationMadeOnBehalfOf) {
            return res.render('current-service/back-office/manage-representations/edit-representation/14-representation-made-on-behalf-of', {
                rep: rep,
                data: req.session.data,
                errorRepresentationMadeOnBehalfOf: "Select who you are representing"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.representing = representationMadeOnBehalfOf;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 15 - was the representation submitted by an agent
router.get('/edit-is-agent', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.isAgent) {
        req.session.data['is-agent'] = rep.isAgent;
    }
    else {
        delete req.session.data['is-agent'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/15-was-the-representation-submitted-by-an-agent', {
        rep: rep,
        data: req.session.data
    });
});

    // 15 - post
    router.post('/edit-bo-is-agent', function (req, res) {
        const rep = getRepresentation(req);
        const isAgent = req.session.data['is-agent'];

        // validation
        if (!isAgent) {
            return res.render('current-service/back-office/manage-representations/edit-representation/15-was-the-representation-submitted-by-an-agent', {
                rep: rep,
                data: req.session.data,
                errorIsAgent: "Select yes if the representation was submitted by an agent"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.isAgent = isAgent;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 16 - agent organisation name
router.get('/edit-agent-org', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.agentOrgName) {
        req.session.data['agent-organisation-name'] = rep.agentOrgName;
    }
    else {
        delete req.session.data['agent-organisation-name'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/16-name-of-agents-organisation', {
        rep: rep,
        data: req.session.data
    });
});

    // 16 - post
    router.post('/edit-bo-agent-organisation-name', function (req, res) {
        const rep = getRepresentation(req);
        const agentOrganisationName = req.session.data['agent-organisation-name'];

        // validation
        if (!agentOrganisationName) {
            return res.render('current-service/back-office/manage-representations/edit-representation/16-name-of-agents-organisation', {
                rep: rep,
                data: req.session.data,
                errorAgentOrganisationName: "Enter the agent organisation name"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.agentOrgName = agentOrganisationName;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 17 - name of the individual being represented
router.get('/edit-represented-person', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.representedPerson) {
       // split representedPerson into first and last name to match form inputs
        const nameParts = rep.representedPerson.split(' ');
        
        // First word is the first name, the rest is the last name
        req.session.data['name-of-individual-first-name'] = nameParts[0];
        req.session.data['name-of-individual-last-name'] = nameParts.slice(1).join(' ');
    }
    else {
        delete req.session.data['name-of-individual-first-name'];
        delete req.session.data['name-of-individual-last-name'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/17-name-of-the-individual-being-represented', {
        rep: rep,
        data: req.session.data
    });
});

    // 17 - post
    router.post('/edit-bo-name-of-individual-being-represented', function(req, res) {
        const rep = getRepresentation(req);
        const firstName = req.session.data['name-of-individual-first-name'];
        const lastName = req.session.data['name-of-individual-last-name'];

        // error containers
        const errors = {};
        const errorList = [];

        // validate name fields
        if (!firstName) {
            errors.firstName = {text: "Enter the first name"};
            errorList.push({ text: "Enter the first name", href: "#name-of-individual-first-name" });
        }
        if (!lastName) {
            errors.lastName = {text: "Enter the last name"};
            errorList.push({ text: "Enter the last name", href: "#name-of-individual-last-name" });
        }
        // render errors if any
        if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/edit-representation/17-name-of-the-individual-being-represented', {
            rep: rep,
            data: req.session.data, 
            errors: errors,
            errorList: errorList
        });
        }
        if (rep) {
            // stitch first and last name back together and save to object
            rep.representedPerson = `${firstName} ${lastName}`;
        }
        req.session.data['edit-success-message'] = "Representation has been updated";
       
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 18 - name of senders organisation or charity
router.get('/edit-represented-org-charity', function(req, res) {
    const rep = getRepresentation(req); 
    
    // pre-populate session data if rep exists
    if (rep && rep.representedOrgWorkFor && rep.representedOrgWorkFor.name) {
        req.session.data['name-of-senders-org-or-charity'] = rep.representedOrgWorkFor.name; 
    }
    else {
        delete req.session.data['name-of-senders-org-or-charity'];
    }
    // render page with pre-populated data
    res.render('current-service/back-office/manage-representations/edit-representation/18-name-of-senders-organisation-or-charity', {
        rep: rep,
        data: req.session.data
    });
});

    // 18 - post
    router.post('/edit-name-of-senders-org-or-charity', function(req, res) {
        const rep = getRepresentation(req);
        const nameOfSendersOrgOrCharity = req.session.data['name-of-senders-org-or-charity'];
        
        // validation
        if (!nameOfSendersOrgOrCharity) {
            return res.render('current-service/back-office/manage-representations/edit-representation/18-name-of-senders-organisation-or-charity', {
                rep: rep,
                data: req.session.data,
                errorNameOfSendersOrgOrCharity: "Enter the name of the sender's organisation or charity"
            });
        }
        // Save back to the exact object property
        if (rep) {
            // If representedOrgWorkFor is undefined (null), create empty object first
            if (!rep.representedOrgWorkFor) {
                rep.representedOrgWorkFor = {};
            }
            // save and assign name data to object
            rep.representedOrgWorkFor.name = nameOfSendersOrgOrCharity;
        }
        // set success banner and redirect
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 19 - senders job title or role
router.get('/edit-represented-org-charity-role', function(req, res) {
    const rep = getRepresentation(req); 
    
    // pre-populate session data if rep exists
    if (rep && rep.representedOrgWorkFor && rep.representedOrgWorkFor.role) {
        req.session.data['senders-job-title-or-role'] = rep.representedOrgWorkFor.role;
    } 
    else {
        delete req.session.data['senders-job-title-or-role'];
    }
    // Redirect to the page
    res.render('current-service/back-office/manage-representations/edit-representation/19-senders-job-title-or-role', {
        rep: rep,
        data: req.session.data
    });
});

    // 19 - post
    router.post('/edit-senders-job-title-or-role', function(req, res) {
        const rep = getRepresentation(req);
        const sendersJobTitleOrRole = req.session.data['senders-job-title-or-role'];

        // validation
        if (!sendersJobTitleOrRole) {
            return res.render ('current-service/back-office/manage-representations/edit-representation/19-senders-job-title-or-role', {
                rep: rep,
                data: req.session.data,
                errorSendersJobTitleOrRole: "Enter the name of the sender's job title or role"
            });
        }
        // Save back to the exact object property
        if (rep) {
            // If representedOrgWorkFor is undefined (null), create empty object first
            if (!rep.representedOrgWorkFor) {
                rep.representedOrgWorkFor = {};
            }
            // save and assign role data to object
            rep.representedOrgWorkFor.role = sendersJobTitleOrRole;
        }
        // Set success banner and redirect
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 20 - name of organisation or charity being represented
router.get('/edit-represented-org-i-do-not', function(req, res) {
    const rep = getRepresentation(req); 
    
    // pre-populate session data if rep exists
    if (rep && rep.representedOrgOther) {
        req.session.data['org-or-charity-being-represented'] = rep.representedOrgOther;
    } 
    else {
        delete req.session.data['org-or-charity-being-represented'];
    }
    // Redirect to the page
    res.render('current-service/back-office/manage-representations/edit-representation/20-name-of-organisation-or-charity-being-represented', {
        rep: rep,
        data: req.session.data
    });
});

    // 20 - post
    router.post('/edit-bo-org-or-charity-being-represented', function(req, res) {
        const rep = getRepresentation(req);
        const orgOrCharityBeingRepresented = req.session.data['org-or-charity-being-represented'];

        // validation
        if (!orgOrCharityBeingRepresented) {
            return res.render ('current-service/back-office/manage-representations/edit-representation/20-name-of-organisation-or-charity-being-represented', {
                rep: rep,
                data: req.session.data,
                errorOrgOrCharityBeingRepresented: "Enter the name of the organisation or charity being represented"
            });
        }
        // Save back to the exact object property
        if (rep) {
            rep.representedOrgOther = orgOrCharityBeingRepresented;
        }
        // Set success banner and redirect
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 21 - group name
router.get('/edit-group-name', function(req, res) {
    const rep = getRepresentation(req); 
    
    // check if group and group name object 
    if (rep && rep.representedGroup && rep.representedGroup.name) {
        req.session.data['name-of-the-group'] = rep.representedGroup.name;
    }
    else {
        delete req.session.data['name-of-the-group'];
    }
    // redirect to group name page
    res.render('current-service/back-office/manage-representations/edit-representation/21-group-name', {
        rep: rep,
        data: req.session.data
    });
});

    // 21 - post
    router.post('/edit-bo-name-of-the-group', function(req, res) {
        const rep = getRepresentation(req);
        const groupName = req.session.data['name-of-the-group'];
        
        // no validation as group name is optional

        // Save back to the exact object property
        if (rep) {
            // initialise representedGroup if null
            // create empty members array for group names to save names into it later safely
            if (!rep.representedGroup) {
                rep.representedGroup = { members: [] }; 
            }
            rep.representedGroup.name = groupName;
        }
        // Set success banner and redirect
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });


// 22, 23 - check group name details (ATL)

// 22 - check group name details (pre-load names if existing)
router.get('/edit-group-members', function(req, res) {
    const rep = getRepresentation(req);

    if (req.query.action === 'start') {
        delete req.session.data['group-name-list'];
    }
    
    if (!req.session.data['group-name-list']) {
        if (rep && rep.representedGroup && rep.representedGroup.members) {
            // THE FIX: Deep copy the array so objects are completely disconnected from the database
            req.session.data['group-name-list'] = JSON.parse(JSON.stringify(rep.representedGroup.members));
        } else {
            req.session.data['group-name-list'] = [];
        }
    }
    
    res.render('current-service/back-office/manage-representations/edit-representation/22-check-group-name-details', {
        rep: rep,
        data: req.session.data
    });
});

// 23 - name of person in the group (prefill if editing)
router.get('/edit-bo-setup-next-person', function(req, res) {
    const rep = getRepresentation (req);
    const id = req.query.id;
    const groupNameList = req.session.data['group-name-list'] || [];

    if (id) {
        // Editing: Store ID and hydrate form variables
        req.session.data['edit-group-id'] = id;
        const existingPerson = groupNameList.find(p => p.id === id);
        
        if (existingPerson) {
            req.session.data['person-first-name'] = existingPerson.firstName;
            req.session.data['person-last-name'] = existingPerson.lastName; 
        }
    } else {
        // Adding: Wipe variables clean
        req.session.data['edit-group-id'] = "";
        req.session.data['person-first-name'] = "";
        req.session.data['person-last-name'] = "";
    }

    // redirect to actual page
    res.render('current-service/back-office/manage-representations/edit-representation/23-name-of-person-in-the-group', {
        rep: rep,
        data: req.session.data
    });
});

    // 23 - post save person to temp array
    router.post('/edit-bo-name-of-person', function(req, res) {
        const rep = getRepresentation (req);
        const editId = req.session.data['edit-group-id'];
        const firstName = req.session.data['person-first-name'];
        const lastName = req.session.data['person-last-name'];

        const errors = {};
        const errorList = [];

        // Validation
        if (!firstName) {
            errors.firstName = {text: "Enter a first name"};
            errorList.push({ text: "Enter a first name", href: "#person-first-name" }); 
        }
        if (!lastName) {
            errors.lastName = {text: "Enter a last name"};
            errorList.push({ text: "Enter a last name", href: "#person-last-name" });
        }

        // Render EDIT page if errors
        if (errorList.length > 0) {
            return res.render('current-service/back-office/manage-representations/edit-representation/23-name-of-person-in-the-group', {
                rep: rep,
                data: req.session.data,
                errors: errors,
                errorList: errorList
            });
        }

        if (!req.session.data['group-name-list']) {
            req.session.data['group-name-list'] = [];
        }

        if (editId) {
            // Updating an existing person
            const index = req.session.data['group-name-list'].findIndex(p => p.id === editId);
            if (index > -1) {
                req.session.data['group-name-list'][index].firstName = firstName;
                req.session.data['group-name-list'][index].lastName = lastName;
            }
        } else {
            // Adding a brand new person
            req.session.data['group-name-list'].push({ id: 'person-' + Date.now(), firstName, lastName });
        }

        // Wipe temporary variables clean
        req.session.data['edit-group-id'] = "";
        req.session.data['person-first-name'] = "";
        req.session.data['person-last-name'] = "";

        // Send back to the check page
        res.redirect('/edit-group-members');
    });

// 22 - remove get route
router.get('/edit-bo-remove-group-person', function(req, res) {
    const rep = getRepresentation (req)
    const idToRemove = req.query.id;

    if (idToRemove && req.session.data['group-name-list']) {
        req.session.data['group-name-list'] = req.session.data['group-name-list'].filter(person => person.id !== idToRemove);
    }
    res.redirect('/edit-group-members');
});

    // 22 - final save to rep object post route
    router.post('/edit-bo-check-group-name-details', function(req, res) {
        const rep = getRepresentation(req);
        const groupNameList = req.session.data['group-name-list'] || [];
        
        // validation for empty list
        if (groupNameList.length === 0) {
            return res.render('current-service/back-office/manage-representations/edit-representation/22-check-group-name-details', {
                rep: rep,
                data: req.session.data,
                errorList: [{ text: "You must add at least one person to the group", href: "#add-person-link" }]
            });
        }
        // save to final object
        if (rep) {
            // if object doesn't exist, create empty object
            if (!rep.representedGroup) {
                rep.representedGroup = { name: '' };
            }
            rep.representedGroup.members = groupNameList;
        }
        // wipe temp array
        delete req.session.data['group-name-list'];

        // Set success banner and redirect to Review
        req.session.data['edit-success-message'] = "Representation has been updated";
        
        // redirect based on the overall status 
        if (rep.status === "Accepted" || rep.status === "Rejected") {
            res.redirect('/current-service/back-office/manage-representations/view');
        }
        else if (rep.status === "Awaiting review") {
            res.redirect('/current-service/back-office/manage-representations/review-representation/review');
        }
        else {
            // fallback
            res.redirect('/current-service/back-office/manage-representations/manage-representations');
        }
    });




// WITHDRAWAL FIELDS

// 01 - enter date of withdrawal request
router.get('/edit-withdrawal-date', function (req, res) {
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
    res.render('current-service/back-office/manage-representations/edit-representation/withdraw-representation/01-enter-date-of-withdrawal-request', {
        rep: rep,
        data: req.session.data
    });
});

    // 01 - post
    router.post('/edit-enter-date-of-withdrawal-request', function (req, res) {
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
            return res.render('current-service/back-office/manage-representations/edit-representation/withdraw-representation/01-enter-date-of-withdrawal-request', {
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
        // trigger success banner
        req.session.data['edit-success-message'] = "Withdrawal date has been updated";
        // redirect back to view page
        res.redirect('/current-service/back-office/manage-representations/view');
    });


// 02 - why is the representation being withdrawn
router.get('/edit-withdrawal-reason', function (req, res) {
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
    res.render('current-service/back-office/manage-representations/edit-representation/withdraw-representation/02-why-is-the-representation-being-withdrawn', {
        rep: rep,
        data: req.session.data
    });
});

    // 02 - post
    router.post('/edit-why-is-the-representation-being-withdrawn', function(req, res) {
        const rep = getRepresentation(req);
        const withdrawReason = req.session.data['why-is-the-representation-being-withdrawn'];

        // validation
        if (!withdrawReason) {
            return res.render('current-service/back-office/manage-representations/edit-representation/withdraw-representation/02-why-is-the-representation-being-withdrawn', {
                rep: rep,
                data: req.session.data,
                errorWhyIsTheRepresentationBeingWithdrawn: "Select why the representation is being withdrawn"
            });
        }
        // save data to the representation object
        if (rep) {
            rep.withdrawnReason = withdrawReason;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation withdrawal reason has been updated";
        // redirect back to view
        res.redirect('/current-service/back-office/manage-representations/view'); 
    });


// 03 - upload withdrawal request
router.get('/edit-upload-withdrawal-reason', function(req, res) {
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
    res.render('current-service/back-office/manage-representations/edit-representation/withdraw-representation/03-upload-the-withdrawal-request', {
        rep: rep,
        data: req.session.data
    });
});

    // 03 - post
    router.post('/edit-upload-the-withdrawal-request', function(req, res) {
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
            return res.render('current-service/back-office/manage-representations/edit-representation/withdraw-representation/03-upload-the-withdrawal-request', {
                rep: rep,
                data: req.session.data,
                errors: errors,
                errorList: errorList
            });
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Representation withdrawal request has been updated";
        // redirect to cya
        res.redirect('/current-service/back-office/manage-representations/view');
    });






export default router;