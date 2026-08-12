import { Router } from 'express';
import { getRepresentation } from '../../helpers.js'; 

const router = Router();

// MANAGE REPRESENTATIONS - get the correct rep
router.get('/current-service/back-office/manage-representations/review-representation/review', function (req, res) {
  const rep = getRepresentation(req);
  // if rep is missing, send back to manage-representations page
  if (!rep) {
    return res.redirect('/current-service/back-office/manage-representations/manage-representations');
  }

  // success message logic
  const successMessage = req.session.data['edit-success-message'];
  delete req.session.data['edit-success-message']; // clear message after showing once

  // render page using the found representation
  res.render('current-service/back-office/manage-representations/review-representation/review', {
    rep: rep,
    successMessage: successMessage // pass success message to page template
  });
});

  // MANAGE REPRESENTATIONS - post
  router.post('/review-answer', function (req, res) {
    const rep = getRepresentation(req);
    
    const errors = {};
    const errorList = [];

    // check if they are acting on behalf of someone
    const isOnBehalf = rep && rep.submitterType === 'On behalf of another person, an organisation or group of people';

    if (isOnBehalf) {
        
        // run validation only if they answered on submitting on behalf
        if (!rep.representing) {
            errors.representing = { text: "Enter who they are representing" };
            errorList.push({ text: "Enter who they are representing", href: "/current-service/back-office/manage-representations/edit-representation/14-representation-made-on-behalf-of" });
        } 
        // validation logic
        else {
            
            // --- AGENT LOGIC (for 3 of the 4 options) ---
            const requiresAgentCheck = ['A person', 'An organisation or charity that I do not work or volunteer for', 'A group of people'].includes(rep.representing);
            
            if (requiresAgentCheck) {
                if (!rep.isAgent) {
                    errors.isAgent = { text: "Select if they are acting as an agent" };
                    errorList.push({ text: "Select if they are acting as an agent", href: "/current-service/back-office/manage-representations/edit-representation/15-was-the-representation-submitted-by-an-agent" });
                } else if (rep.isAgent === 'Yes' && !rep.agentOrgName) {
                    errors.agentOrgName = { text: "Enter the agent's organisation name" };
                    errorList.push({ text: "Enter the agent's organisation name", href: "/current-service/back-office/manage-representations/edit-representation/16-name-of-agents-organisation" });
                }
            }

            // --- ENTITY LOGIC (radio-specific validation) ---
            if (rep.representing === 'A person') {
                // Based on your HTML {{ rep.representedPerson | default('-', true) }}, this is saved as a simple string
                if (!rep.representedPerson) {
                    errors.representedPerson = { text: "Enter the represented person's name" };
                    errorList.push({ text: "Enter the represented person's name", href: "/current-service/back-office/manage-representations/edit-representation/17-name-of-the-individual-being-represented" });
                }
            } 
            else if (rep.representing === 'An organisation or charity that I work or volunteer for') {
                if (!rep.representedOrgWorkFor || !rep.representedOrgWorkFor.name) {
                    errors.orgName = { text: "Enter the organisation or charity name" };
                    errorList.push({ text: "Enter the organisation or charity name", href: "/current-service/back-office/manage-representations/edit-representation/18-name-of-senders-organisation-or-charity" });
                }
                if (!rep.representedOrgWorkFor || !rep.representedOrgWorkFor.role) {
                    errors.orgRole = { text: "Enter your job or volunteer role" };
                    errorList.push({ text: "Enter your job or volunteer role", href: "/current-service/back-office/manage-representations/edit-representation/19-senders-job-title-or-role" });
                }
            }
            else if (rep.representing === 'An organisation or charity that I do not work or volunteer for') {
                if (!rep.representedOrgOther) {
                    errors.orgOther = { text: "Enter the full name of the organisation you are representing" };
                    errorList.push({ text: "Enter the full name of the organisation you are representing", href: "/current-service/back-office/manage-representations/edit-representation/20-name-of-organisation-or-charity-being-represented" });
                }
            }
            else if (rep.representing === 'A group of people') {
                if (!rep.representedGroup || !rep.representedGroup.members || rep.representedGroup.members.length === 0) {
                    errors.groupMembers = { text: "Add at least one person to the group" };
                    errorList.push({ text: "Add at least one person to the group", href: "/current-service/back-office/manage-representations/edit-representation/22-check-group-name-details" });
                }
            }
        }
    }
    // render errors if any
    if (errorList.length > 0) {
        return res.render('current-service/back-office/manage-representations/review-representation/review', {
            rep: rep,
            errors: errors,
            errorList: errorList
        });
    }
    // redirect if successful
    res.redirect('/current-service/back-office/manage-representations/review-representation/task-list'); 
  });


// TASK LIST VIEW - get the correct rep
router.get('/current-service/back-office/manage-representations/review-representation/task-list', function(req, res) {
    const rep = getRepresentation(req);
    
    // if rep can't be found, kick back to rep list
    if (!rep) {
        return res.redirect('/current-service/back-office/manage-representations/manage-representations');
    }
    res.render('current-service/back-office/manage-representations/review-representation/task-list', {
        rep: rep
    });
});

  // TASK LIST VIEW - post


// REVIEW REPRESENTATION (Task List)
router.get('/task-list-review-rep', function(req, res) {
    const rep = getRepresentation(req);
    
    // calculate exactly what the radio should be based only on the saved object
    let currentDecision = '';
    
    if (rep && rep.reviewStatus) {
        if (rep.reviewStatus === 'Accepted') {
            currentDecision = 'Accept';
        } else if (rep.reviewStatus === 'Rejected') {
            currentDecision = 'Reject';
        } else if (rep.reviewStatus === 'Accepted and redacted') {
            currentDecision = 'Accept and redact';
        }
    }
    // safety: remove cache to prevent auto-filling of radios
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    // pass the exact radio value to the page
    res.render('current-service/back-office/manage-representations/review-representation/task-list/representation', { 
        rep: rep,
        currentDecision: currentDecision 
    });
});

  // REVIEW REPRESENTATION (Task List) - post
  router.post('/task-list-review-rep-answer', function(req, res) {
      const rep = getRepresentation(req);
      const reviewRepDecision = req.body['review-rep-decision'];
    
      // error validation
      if (!reviewRepDecision) {
          return res.render('current-service/back-office/manage-representations/review-representation/task-list/representation', {
              rep: rep,
              errorReviewRepDecision: "Select the review decision",
              currentDecision: '' // to keep radio safely unchecked on error screen
          });
      }
      // set rep status or redirect to redaction page
      if (rep) {
        if (reviewRepDecision === 'Reject') {
            rep.reviewStatus = 'Rejected';

            rep.redactedComment = null;
            
            // auto-reject all attachments if they exist
            if (rep.attachments && rep.attachments.length > 0) {
                rep.attachmentReviews = rep.attachmentReviews || {};
                rep.attachments.forEach(file => {
                    rep.attachmentReviews[file] = 'Rejected';
                });
            }
            res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
            
        } else if (reviewRepDecision === 'Accept') {
            rep.reviewStatus = 'Accepted';

            rep.redactedComment = null;
            
            // revert rejected attachments to incomplete
            if (rep.attachments && rep.attachments.length > 0 && rep.attachmentReviews) {
                rep.attachments.forEach(file => {
                    if (rep.attachmentReviews[file] === 'Rejected') {
                        rep.attachmentReviews[file] = 'Incomplete';
                    }
                });
            }
            res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
            
        // prevent accept and redact status from being set if journey unfinished
        } else if (reviewRepDecision === 'Accept and redact') {
            
            // revert rejected attachments to incomplete
            if (rep.attachments && rep.attachments.length > 0 && rep.attachmentReviews) {
                rep.attachments.forEach(file => {
                    if (rep.attachmentReviews[file] === 'Rejected') {
                        rep.attachmentReviews[file] = 'Incomplete';
                    }
                });
            }
            res.redirect('/current-service/back-office/manage-representations/review-representation/task-list/representation-redact');
        }
    }
  });


// REPRESENTATION REDACT - redact the comment
router.get('/current-service/back-office/manage-representations/review-representation/task-list/representation-redact', function(req, res) {
    const rep = getRepresentation(req);
    
    // ensures rep comment re-hydrates
    if (rep) {
        // if there is a saved redaction, use it, otherwise, use the original comment
        req.session.data['redactedComment'] = rep.redactedComment || rep.comment;
    }
    // stop the browser from caching this page just like the radio buttons
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    res.render('current-service/back-office/manage-representations/review-representation/task-list/representation-redact', { 
        rep: rep 
    });
});

  // REPRESENTATION REDACT - post
  router.post('/representation-redact-answer', function(req, res) {
      const rep = getRepresentation(req);
      const redactedComment = req.body['customRedactedComment'];
      
      if (rep) {
          // if the text is exactly the same as the original, assume they didn't redact anything and set to 'accepted'
          if (redactedComment === rep.comment) {
              rep.reviewStatus = 'Accepted'; // Auto-accept instead
              rep.redactedComment = null;    // Wipe any ghost redactions
              return res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
          } 
          // if changes were made, redirect to confirmation page
          else {
              rep.redactedComment = redactedComment;
              return res.redirect('/current-service/back-office/manage-representations/review-representation/task-list/confirm-representation-redact');
          }
      }
      res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
  });


// CONFIRM REPRESENTATION REDACT - check details and redact representation
router.get('/current-service/back-office/manage-representations/review-representation/task-list/confirm-representation-redact', function(req, res) {
    const rep = getRepresentation(req);

    res.render('current-service/back-office/manage-representations/review-representation/task-list/confirm-representation-redact', { rep: rep });
});

  // CONFIRM REPRESENTATION REDACT - post
  router.post('/confirm-representation-redact-answer', function(req, res) {
      const rep = getRepresentation(req);
      if (rep) {
          rep.reviewStatus = 'Accepted and redacted';
      }
      res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
  });











export default router;