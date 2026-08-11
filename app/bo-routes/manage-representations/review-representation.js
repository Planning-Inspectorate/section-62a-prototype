import { Router } from 'express';
import { getRepresentation } from '../../helpers.js'; 

const router = Router();

// load the manage representations page with the correct reps
router.get('/current-service/back-office/manage-representations/review-representation/review', function (req, res) {
  const foundRep = getRepresentation(req);
  // if rep is missing, send back to manage-representations page
  if (!foundRep) {
    return res.redirect('/current-service/back-office/manage-representations/manage-representations');
  }

  // success message logic
  const successMessage = req.session.data['edit-success-message'];
  delete req.session.data['edit-success-message']; // clear message after showing once

  // render page using the found representation
  res.render('current-service/back-office/manage-representations/review-representation/review', {
    rep: foundRep,
    successMessage: successMessage // pass success message to page template
  });
});

// redirect and error validation for review
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
  res.redirect('/current-service/back-office/manage-representations/to-continue'); 
});


export default router;