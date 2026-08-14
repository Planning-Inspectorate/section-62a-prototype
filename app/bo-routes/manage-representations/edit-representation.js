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
    
    // Use res.render, but manually push the freshly updated session data into the template!
    res.render('current-service/back-office/manage-representations/edit-representation/02-how-was-this-representation-received', {
        rep: rep,
        data: req.session.data // <--- This line completely fixes the radio hydration issue!
    });
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
                
                // trigger success banner
                req.session.data['edit-success-message'] = "How the representation was received has been updated";

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


// 10 - written representation submitted
router.get('/edit-comment', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.comment) {
        req.session.data['written-representation-submitted'] = rep.comment;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/10-written-representation-submitted');
});

    // 10 - post
    router.post('/edit-written-representation-submitted', function (req, res) {
        const rep = getRepresentation(req);
        const writtenRepresentationSubmitted = req.session.data['written-representation-submitted'];

        // validation
        if (!writtenRepresentationSubmitted) {
            return res.render('current-service/back-office/manage-representations/edit-representation/10-written-representation-submitted', {
                errorWrittenRepresentationSubmitted: "Enter what you want to tell us about this proposed application"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.comment = writtenRepresentationSubmitted;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Written representation submitted has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 11 - would you like to be heard at a hearing
router.get('/edit-hearing', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.wantsHearing) {
        req.session.data['would-you-like-to-be-heard-at-a-hearing'] = rep.wantsHearing;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/11-would-you-like-to-be-heard-at-a-hearing');
});

    // 11 - post
    router.post('/edit-would-you-like-to-be-heard-at-a-hearing', function (req, res) {
        const rep = getRepresentation(req);
        const wouldYouLikeToBeHeardAtAHearing = req.session.data['would-you-like-to-be-heard-at-a-hearing'];

        // validation
        if (!wouldYouLikeToBeHeardAtAHearing) {
            return res.render('current-service/back-office/manage-representations/edit-representation/11-would-you-like-to-be-heard-at-a-hearing', {
                errorWouldYouLikeToBeHeardAtAHearing: "Select yes if you would like to be heard at a hearing"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.wantsHearing = wouldYouLikeToBeHeardAtAHearing;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Hearing preference has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 12 - are there any attachments
router.get('/edit-has-attachments' , function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.hasAttachments) {
        req.session.data['are-there-any-attachments'] = rep.hasAttachments;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/12-are-there-any-attachments');
});

    // 12 - post
    router.post('/edit-are-there-any-attachments', function (req, res) {
        const rep = getRepresentation(req);
        const areThereAnyAttachments = req.session.data['are-there-any-attachments'];

        // validation
        if (!areThereAnyAttachments) {
            return res.render('current-service/back-office/manage-representations/edit-representation/12-are-there-any-attachments', {
                errorAreThereAnyAttachments: "Select yes if there are any attachments to this representation"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.hasAttachments = areThereAnyAttachments;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Attachment preference has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 13 - upload attachments
router.get('/edit-attachments', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.attachments) {
        req.session.data['uploadedFiles'] = rep.attachments.join('||');
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/13-upload-attachments');
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
                errors: errors,
                errorList: errorList
            });
        }
        // save back to the exact object property
        if (rep) {
            // Convert the '||' string back into an array
            rep.attachments = uploadedFiles.split('||');
        }
        // set success banner and redirect
        req.session.data['edit-success-message'] = "Attachments updated";
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


// 15 - was the representation submitted by an agent
router.get('/edit-is-agent', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.isAgent) {
        req.session.data['is-agent'] = rep.isAgent;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/15-was-the-representation-submitted-by-an-agent');
});

    // 15 - post
    router.post('/edit-bo-is-agent', function (req, res) {
        const rep = getRepresentation(req);
        const isAgent = req.session.data['is-agent'];

        // validation
        if (!isAgent) {
            return res.render('current-service/back-office/manage-representations/edit-representation/15-was-the-representation-submitted-by-an-agent', {
                errorIsAgent: "Select yes if the representation was submitted by an agent"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.isAgent = isAgent;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Agent submission preference has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 16 - agent organisation name
router.get('/edit-agent-org', function(req, res) {
    const rep = getRepresentation(req); // find the representation based on currentRepRef
    
    // pre-populate session data if rep exists
    if (rep && rep.agentOrgName) {
        req.session.data['agent-organisation-name'] = rep.agentOrgName;
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/16-name-of-agents-organisation');
});

    // 16 - post
    router.post('/edit-bo-agent-organisation-name', function (req, res) {
        const rep = getRepresentation(req);
        const agentOrganisationName = req.session.data['agent-organisation-name'];

        // validation
        if (!agentOrganisationName) {
            return res.render('current-service/back-office/manage-representations/edit-representation/16-name-of-agents-organisation', {
                errorAgentOrganisationName: "Enter the agent organisation name"
            });
        }
        // save and update the exact object property
        if (rep) {
            rep.agentOrgName = agentOrganisationName;
        }
        // trigger success banner
        req.session.data['edit-success-message'] = "Agent organisation name has been updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
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
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/17-name-of-the-individual-being-represented');
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
            errors: errors,
            errorList: errorList
        });
        }
        if (rep) {
            // stitch first and last name back together and save to object
            rep.representedPerson = `${firstName} ${lastName}`;
        }
        req.session.data['edit-success-message'] = "Represented person's name updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 18 - name of senders organisation or charity
router.get('/edit-represented-org-charity', function(req, res) {
    const rep = getRepresentation(req); 
    
    // pre-populate session data if rep exists
    if (rep && rep.representedOrgWorkFor && rep.representedOrgWorkFor.name) {
        req.session.data['name-of-senders-org-or-charity'] = rep.representedOrgWorkFor.name; 
    }
    // render page with pre-populated data
    res.redirect('/current-service/back-office/manage-representations/edit-representation/18-name-of-senders-organisation-or-charity');
});

    // 18 - post
    router.post('/edit-name-of-senders-org-or-charity', function(req, res) {
        const rep = getRepresentation(req);
        const nameOfSendersOrgOrCharity = req.session.data['name-of-senders-org-or-charity'];
        
        // validation
        if (!nameOfSendersOrgOrCharity) {
            return res.render('current-service/back-office/manage-representations/edit-representation/18-name-of-senders-organisation-or-charity', {
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
        req.session.data['edit-success-message'] = "Organisation name updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 19 - senders job title or role
router.get('/edit-represented-org-charity-role', function(req, res) {
    const rep = getRepresentation(req); 
    
    // pre-populate session data if rep exists
    if (rep && rep.representedOrgWorkFor && rep.representedOrgWorkFor.role) {
        req.session.data['senders-job-title-or-role'] = rep.representedOrgWorkFor.role;
    } 
    // Redirect to the page
    res.redirect('/current-service/back-office/manage-representations/edit-representation/19-senders-job-title-or-role');
});

    // 19 - post
    router.post('/edit-senders-job-title-or-role', function(req, res) {
        const rep = getRepresentation(req);
        const sendersJobTitleOrRole = req.session.data['senders-job-title-or-role'];

        // validation
        if (!sendersJobTitleOrRole) {
            return res.render ('/current-service/back-office/manage-representations/edit-representation/19-senders-job-title-or-role', {
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
        req.session.data['edit-success-message'] = "Role or job title updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 20 - name of organisation or charity being represented
router.get('/edit-represented-org-i-do-not', function(req, res) {
    const rep = getRepresentation(req); 
    
    // pre-populate session data if rep exists
    if (rep && rep.representedOrgOther) {
        req.session.data['org-or-charity-being-represented'] = rep.representedOrgOther;
    } 
    // Redirect to the page
    res.redirect('/current-service/back-office/manage-representations/edit-representation/20-name-of-organisation-or-charity-being-represented');
});

    // 20 - post
    router.post('/edit-bo-org-or-charity-being-represented', function(req, res) {
        const rep = getRepresentation(req);
        const orgOrCharityBeingRepresented = req.session.data['org-or-charity-being-represented'];

        // validation
        if (!orgOrCharityBeingRepresented) {
            return res.render ('/current-service/back-office/manage-representations/edit-representation/20-name-of-organisation-or-charity-being-represented', {
                errorOrgOrCharityBeingRepresented: "Enter the name of the organisation or charity being represented"
            });
        }
        // Save back to the exact object property
        if (rep) {
            rep.representedOrgOther = orgOrCharityBeingRepresented;
        }
        // Set success banner and redirect
        req.session.data['edit-success-message'] = "Name of organisation or charity being represented updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 21 - group name
router.get('/edit-group-name', function(req, res) {
    const rep = getRepresentation(req); 
    
    // check if group and group name object 
    if (rep && rep.representedGroup && rep.representedGroup.name) {
        req.session.data['name-of-the-group'] = rep.representedGroup.name;
    } 
    // redirect to group name page
    res.redirect('/current-service/back-office/manage-representations/edit-representation/21-group-name');
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
        req.session.data['edit-success-message'] = "Group name updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
    });


// 22, 23 - check group name details (ATL)

// 22 - check group name details (pre-load names if existing)
router.get('/edit-group-members', function(req, res) {
    const rep = getRepresentation(req);
    
    // stage the members array into the session data so the html table can read it
    if (rep && rep.representedGroup && rep.representedGroup.members) {
        req.session.data['group-name-list'] = rep.representedGroup.members;
    } else {
        req.session.data['group-name-list'] = [];
    }
    res.redirect('/current-service/back-office/manage-representations/edit-representation/22-check-group-name-details');
});

// 23 - name of person in the group (prefill if editing)
router.get('/edit-bo-setup-next-person', function(req, res) {
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

    // Redirecting to your page 23 inside the edit folder
    res.redirect('/current-service/back-office/manage-representations/edit-representation/23-name-of-person-in-the-group');
});

    // 23 - post save person to temp array
    router.post('/edit-bo-name-of-person', function(req, res) {
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
        res.redirect('/current-service/back-office/manage-representations/edit-representation/22-check-group-name-details');
    });

// 22 - remove get route
router.get('/edit-bo-remove-group-person', function(req, res) {
    const idToRemove = req.query.id;

    if (idToRemove && req.session.data['group-name-list']) {
        req.session.data['group-name-list'] = req.session.data['group-name-list'].filter(person => person.id !== idToRemove);
    }
    res.redirect('/current-service/back-office/manage-representations/edit-representation/22-check-group-name-details');
});

    // 22 - final save to rep object post route
    router.post('/edit-bo-check-group-name-details', function(req, res) {
        const rep = getRepresentation(req);
        const groupNameList = req.session.data['group-name-list'] || [];
        
        // validation for empty list
        if (groupNameList.length === 0) {
            return res.render('current-service/back-office/manage-representations/edit-representation/22-check-group-name-details', {
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
        // Set success banner and redirect to Review
        req.session.data['edit-success-message'] = "Group members updated";
        res.redirect('/current-service/back-office/manage-representations/review-representation/review');
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