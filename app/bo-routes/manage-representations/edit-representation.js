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
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/01-date-the-representation-was-received');
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
        req.session.data['edit-success-message'] = "Date the representation was received has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 02 - how was this representation received
router.get('/edit-how-received', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef

    // pre-populate session data if rep exists
    if (rep && rep.howReceived) {
        req.session.data['how-was-this-representation-received'] = rep.howReceived;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/02-how-was-this-representation-received');
});

    // 02 - post
    router.post('/edit-how-was-this-representation-received', function (req, res) {
        const rep = getRepresentation(req);
        const howWasThisRepresentationReceived = req.session.data['how-was-this-representation-received'];

        // validation
        if (!howWasThisRepresentationReceived) {
            return res.render('current-service/back-office/manage-representations/edit-representation/02-how-was-this-representation-received', {
                errorHowWasThisRepresentationReceived: "Select how this representation was received"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.howReceived = howWasThisRepresentationReceived;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "How the representation was received has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 03 - reason for not using online service
router.get('/edit-reason-not-online', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.reasonNotOnline) {
        req.session.data['reason-for-not-using-online-service'] = rep.reasonNotOnline;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/03-reason-for-not-using-online-service');
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
        req.session.data['edit-success-message'] = "Reason for not using the online service has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 04 - representation type
router.get('/edit-rep-type', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.type) {
        req.session.data['type-of-representation-submitted'] = rep.type;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/04-type-of-representation-submitted');
});

    // 04 - post
    router.post('/edit-type-of-representation-submitted', function (req, res) {
        const rep = getRepresentation(req);
        const typeOfRepresentationSubmitted = req.session.data['type-of-representation-submitted'];
        
        // validation
        if (!typeOfRepresentationSubmitted) {
            return res.render('current-service/back-office/manage-representations/edit-representation/04-type-of-representation-submitted', {
                errorTypeOfRepresentationSubmitted: "Select the type of representation submitted"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.type = typeOfRepresentationSubmitted;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Type of representation submitted has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 05 - source of the representation
router.get('/edit-rep-source', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.submitterType) {
        req.session.data['source-of-representation'] = rep.submitterType;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/05-source-of-the-representation');
});

    // 05 - post
    router.post('/edit-source-of-representation', function (req, res) {
        const rep = getRepresentation(req);
        const sourceOfRepresentation = req.session.data['source-of-representation'];

        // validation
        if (!sourceOfRepresentation) {
            return res.render('current-service/back-office/manage-representations/edit-representation/05-source-of-the-representation', {
                errorSourceOfRepresentation: "Select the source of the representation"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.submitterType = sourceOfRepresentation;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Source of the representation has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
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
    res.redirect('/current-service/back-office/manage-representations/edit-representation/06-name-of-the-person-submitting-the-representation');
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
            errors.firstName = {text: "Enter your first name"};
            errorList.push({ text: "Enter your first name", href: "#your-first-name" });
        }
        if (!lastName) {
            errors.lastName = {text: "Enter your last name"};
            errorList.push({ text: "Enter your last name", href: "#your-last-name" });
        }

        // render errors if any
        if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/edit-representation/06-name-of-the-person-submitting-the-representation', { 
            errors: errors,
            errorList: errorList
        });
        }

        if (rep) {
            // stitch first and last name back together and save to object
            rep.submitterName = `${firstName} ${lastName}`;
        }

        req.session.data['edit-success-message'] = "Submitter name updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 07 - contact method
router.get('/edit-contact-method', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.contactMethod) {
        req.session.data['preferred-contact-method'] = rep.contactMethod;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/07-preferred-contact-method');
});

    // 07 - post
    router.post('/edit-preferred-contact-method', function (req, res) {
        const rep = getRepresentation(req);
        const preferredContactMethod = req.session.data['preferred-contact-method'];
        
        // validation
        if (!preferredContactMethod) {
            return res.render('current-service/back-office/manage-representations/edit-representation/07-preferred-contact-method', {
                errorPreferredContactMethod: "Select your preferred contact method"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.contactMethod = preferredContactMethod;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Preferred contact method has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 08 - email address provided
router.get('/edit-email', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.submitterEmail) {
        req.session.data['your-email-address'] = rep.submitterEmail;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/08-email-address-provided');
});

    // 08 - post
    router.post('/edit-your-email-address', function (req, res) {
        const rep = getRepresentation(req);
        const yourEmailAddress = req.session.data['your-email-address'];

        // validation
        const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;

        if (!yourEmailAddress) {
            return res.render('current-service/back-office/manage-representations/edit-representation/08-email-address-provided', { 
                errorYourEmailAddress: "Enter your email address" 
            });
        }
        if (!emailRegex.test(yourEmailAddress)) {
            return res.render('current-service/back-office/manage-representations/edit-representation/08-email-address-provided', { 
                errorYourEmailAddress: "Enter your email address in the correct format, like name@example.com" 
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.submitterEmail = yourEmailAddress;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Email address has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
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
    // redirect to render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/09-postal-address-provided');
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
        req.session.data['edit-success-message'] = "Postal address updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });







    

// 14 - representations made on behalf of
router.get('/edit-rep-on-behalf-of', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.representing) {
        req.session.data['representation-made-on-behalf-of'] = rep.representing;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/14-representation-made-on-behalf-of');
});

    // 14 - post
    router.post('/edit-representation-made-on-behalf-of', function (req, res) {
        const rep = getRepresentation(req);
        const representationMadeOnBehalfOf = req.session.data['representation-made-on-behalf-of'];

        // validation
        if (!representationMadeOnBehalfOf) {
            return res.render('current-service/back-office/manage-representations/edit-representation/14-representation-made-on-behalf-of', {
                errorRepresentationMadeOnBehalfOf: "Select who you are representing"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.representing = representationMadeOnBehalfOf;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Who you are representing has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


export default router;