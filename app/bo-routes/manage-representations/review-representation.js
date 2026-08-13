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
  router.post('/task-list-submit', function(req, res) {
      const rep = getRepresentation(req);
      
      if (rep) {
          // map the specific review decision to the overall representation status
          if (rep.reviewStatus === 'Accepted and redacted') {
              rep.status = 'Accepted';
          } else {
              // this safely handles both 'Accepted' and 'Rejected'
              rep.status = rep.reviewStatus; 
          }
          req.session.data['task-list-success-message'] = `Representation has been ${rep.status.toLowerCase()}`;
      }
      // Redirect to the manage representations page
      res.redirect('/current-service/back-office/manage-representations/manage-representations');
  });



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
              currentDecision: '' 
          });
      }

      if (rep) {
        // ensure storage objects exist
        rep.attachmentReviews = rep.attachmentReviews || {};
        rep.redactedAttachments = rep.redactedAttachments || {};

        if (reviewRepDecision === 'Reject') {
            rep.reviewStatus = 'Rejected';
            rep.redactedComment = null;
            
            // auto-reject all attachments if they exist
            if (rep.attachments && rep.attachments.length > 0) {
                rep.attachments.forEach(file => {
                    rep.attachmentReviews[file] = 'Rejected';
                });
            }
            res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
            
        } else if (reviewRepDecision === 'Accept') {
            rep.reviewStatus = 'Accepted';
            rep.redactedComment = null;
            
            // revert rejected attachments to incomplete and wipe ghost redacted attachments
            if (rep.attachments && rep.attachments.length > 0) {
                rep.attachments.forEach(file => {
                    if (rep.attachmentReviews[file] === 'Rejected') {
                        rep.attachmentReviews[file] = 'Incomplete';
                        
                        // wipe previously redacted attachments
                        rep.redactedAttachments[file] = null; 
                    }
                });
            }
            res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
            
        } else if (reviewRepDecision === 'Accept and redact') {
            
            // revert rejected attachments to incomplete and wipe ghost redacted attachments
            if (rep.attachments && rep.attachments.length > 0) {
                rep.attachments.forEach(file => {
                    if (rep.attachmentReviews[file] === 'Rejected') {
                        rep.attachmentReviews[file] = 'Incomplete';
                        
                        // wipe previously uploaded redacted attachments
                        rep.redactedAttachments[file] = null; 
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


// REVIEW ATTACHMENTS (Task List)
router.get('/task-list-review-attachment', function(req, res) {
    const rep = getRepresentation(req);
    const fileName = req.query.file; // Grab the filename from the URL
    
    let currentDecision = '';
    
    if (rep && rep.attachmentReviews && rep.attachmentReviews[fileName]) {
        if (rep.attachmentReviews[fileName] === 'Accepted') currentDecision = 'Accept';
        if (rep.attachmentReviews[fileName] === 'Rejected') currentDecision = 'Reject';
        if (rep.attachmentReviews[fileName] === 'Accepted and redacted') currentDecision = 'Accept and redact';
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment', { 
        rep: rep,
        fileName: fileName,
        currentDecision: currentDecision 
    });
});

// REVIEW ATTACHMENTS (Task List) - post
  router.post('/task-list-attachment-answer', function(req, res) {
      const rep = getRepresentation(req);
      const fileName = req.body['fileName']; // Pass via hidden input in HTML
      const decision = req.body['review-attachment-decision'];

      if (!decision) {
          return res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment', {
              rep: rep,
              fileName: fileName,
              errorReviewDecision: "Select the review decision",
              currentDecision: ''
          });
      }

      if (rep) {
          // ensure storage objects exist
          rep.attachmentReviews = rep.attachmentReviews || {};
          rep.redactedAttachments = rep.redactedAttachments || {};

          if (decision === 'Reject' || decision === 'Accept') {
              rep.attachmentReviews[fileName] = decision === 'Reject' ? 'Rejected' : 'Accepted';
              
              // wipe any ghost redactions
              rep.redactedAttachments[fileName] = null; 
              
              res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
              
          } else if (decision === 'Accept and redact') {
              // pass file name to next screen, do not save status here
              res.redirect(`/current-service/back-office/manage-representations/review-representation/task-list/attachment-redact?file=${encodeURIComponent(fileName)}`);
          }
      }
  });


// ATTACHMENT REDACT - load the upload page
router.get('/current-service/back-office/manage-representations/review-representation/task-list/attachment-redact', function(req, res) {
    const rep = getRepresentation(req);
    const fileName = req.query.file;
    
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment-redact', { 
        rep: rep,
        fileName: fileName
    });
});

  // ATTACHMENT REDACT - upload, remove, continue with redacted attachment + validation
  router.post('/task-list-attachment-redact-answer', function(req, res) {
      const rep = getRepresentation(req);
      const fileName = req.body['fileName']; // The original file name
      const action = req.body['action'];
      
      rep.redactedAttachments = rep.redactedAttachments || {};
      rep.attachmentReviews = rep.attachmentReviews || {};

      if (action === 'remove') {
          rep.redactedAttachments[fileName] = null;
          
          // Optional: clear the session data array if your component relies on it
          req.session.data['uploadedFiles'] = []; 
          
          return res.redirect(`/current-service/back-office/manage-representations/review-representation/task-list/attachment-redact?file=${encodeURIComponent(fileName)}`);
      } 
      
      if (action === 'upload') {
          // 1. Grab the file directly from the session data
          const uploadedFile = req.session.data['redactedFileUpload'];

          if (!uploadedFile) {
              return res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment-redact', {
                  rep: rep, fileName: fileName, errorUpload: "Select a file to upload"
              });
          }

          // 2. Strip out fake C:\fakepath\ that browsers add
          const cleanUploadedFileName = uploadedFile.replace(/^.*[\\\/]/, '');

          if (cleanUploadedFileName === fileName) {
              return res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment-redact', {
                  rep: rep, fileName: fileName, errorUpload: "Original attachment has the same name."
              });
          }

          const allRedactedFiles = Object.values(rep.redactedAttachments);
          if (allRedactedFiles.includes(cleanUploadedFileName)) {
              return res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment-redact', {
                  rep: rep, fileName: fileName, errorUpload: "A redacted attachment with this name has already been uploaded."
              });
          }

          // 3. Save it to the database object!
          rep.redactedAttachments[fileName] = cleanUploadedFileName;
          
          // 4. Wipe the session data so it doesn't accidentally auto-fill the NEXT time you upload!
          req.session.data['redactedFileUpload'] = null;

          return res.redirect(`/current-service/back-office/manage-representations/review-representation/task-list/attachment-redact?file=${encodeURIComponent(fileName)}`);
      }

      if (action === 'continue') {
          if (!rep.redactedAttachments[fileName]) {
              return res.render('current-service/back-office/manage-representations/review-representation/task-list/attachment-redact', {
                  rep: rep,
                  fileName: fileName,
                  errorUpload: "Upload an attachment"
              });
          }

          rep.attachmentReviews[fileName] = 'Accepted and redacted';
          res.redirect('/current-service/back-office/manage-representations/review-representation/task-list');
      }
  });










export default router;