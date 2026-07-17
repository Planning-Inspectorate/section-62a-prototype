import { Router } from 'express';
import { validAuthorities, validatePostcode, validateEmail, validateOptionalPhone, validateNumber, validateOptionalSiteCoords, validateOptionalNumber, validateDate, addAuditLog, validateOptionalDate, validateOptionalDecimalNumber, validateName } from '../helpers.js';

const router = Router();

// --- ROUTES ---

router.get('/have-your-say-start-ur', function (req, res) {
  const savedRepresentations = req.session.data.representations || [];
  req.session.data = {};
  req.session.data.representations = savedRepresentations;
  res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/01-who-are-you-submitting-a-representation-for');
});

// 01 - who are you submitting a representation for?
router.post('/who-submit-rep-answer', function (req, res) {
  const whoSubmitRep = req.session.data['who-submit-rep'];
  if (!whoSubmitRep) {
    return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/01-who-are-you-submitting-a-representation-for', { errorWhoSubmitRep: "Select if you are submitting a representation for yourself or someone else" });
  }
  if (whoSubmitRep === "Myself") {
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/05-what-is-your-name');
  }
  else {
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/02-who-are-you-representing');
  }
});


// 02 - who are you submitting a representation on behalf of?
router.post('/who-are-you-representing-answer', function (req, res) {
    const whoAreYouRepresenting = req.session.data['who-are-you-representing'];
    if (!whoAreYouRepresenting) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/02-who-are-you-representing', { errorWhoAreYouRepresenting: "Select who you are representing" });
    }
    if (whoAreYouRepresenting === "A person") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/03-are-you-acting-as-an-agent-on-behalf-of-a-client');
    }
    else if (whoAreYouRepresenting === "An organisation or charity that I work or volunteer for") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/05-what-is-your-name');
    }
    else if (whoAreYouRepresenting === "An organisation or charity that I do not work or volunteer for") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/03-are-you-acting-as-an-agent-on-behalf-of-a-client');
    }
    else if (whoAreYouRepresenting === "A group of people") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/03-are-you-acting-as-an-agent-on-behalf-of-a-client');
    }
});


// 03 - are you acting as an agent on behalf of a client?
router.post('/is-agent-answer', function (req, res) {
    const isAgent = req.session.data['is-agent'];
    if (!isAgent) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/03-are-you-acting-as-an-agent-on-behalf-of-a-client', { errorIsAgent: "Select yes if you are acting as an agent on behalf of a client" });
    }
    if (isAgent === "Yes") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/04-what-is-the-name-of-the-organisation-you-work-for');
    }
    else if (isAgent === "No") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/05-what-is-your-name');
    }
});


// 04 - what is the name of the organisation you work for?
router.post('/agent-organisation-name-answer', function (req, res) {
    const agentOrganisationName = req.session.data['agent-organisation-name'];
    if (!agentOrganisationName) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/04-what-is-the-name-of-the-organisation-you-work-for', { errorAgentOrganisationName: "Enter the name of the organisation you work for" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/05-what-is-your-name');
});


// 05 - what is your name?
router.post('/your-name-answer', function (req, res) {
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
      return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/05-what-is-your-name', { 
        errors: errors,
        errorList: errorList
      });
    }

    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/06-what-is-your-email-address');
});


// 06 - what is your email address?
router.post('/your-email-address-answer', function (req, res) {
    const yourEmailAddress = req.session.data['your-email-address'];
    const whoSubmitRep = req.session.data['who-submit-rep'];
    const whoAreYouRepresenting = req.session.data['who-are-you-representing'];

    if (!yourEmailAddress) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/06-what-is-your-email-address', { errorYourEmailAddress: "Enter your email address" });
    }
    if ( whoSubmitRep === "Myself" ) {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/16-add-your-comments');
    }
    else if ( whoAreYouRepresenting === "A person" ) {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/07-what-is-the-name-of-the-person-you-are-representing');
    }
    else if ( whoAreYouRepresenting === "An organisation or charity that I work or volunteer for" ) {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/08-what-is-the-name-of-your-organisation-or-charity');
    }
    else if ( whoAreYouRepresenting === "An organisation or charity that I do not work or volunteer for" ) {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/10-what-is-the-full-name-of-the-organisation-or-charity-that-you-are-representing');
    }
    else if ( whoAreYouRepresenting === "A group of people" ) {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/11-does-the-group-have-a-name');
    }
});


// 07 - what is the name of the person you are representing?
router.post('/person-you-are-representing-answer', function (req, res) {
    const firstName = req.session.data['person-you-are-representing-first-name'];
    const lastName = req.session.data['person-you-are-representing-last-name'];

    // error containers
    const errors = {};
    const errorList = [];

    // validate name fields
    if (!firstName) {
        errors.firstName = {text: "Enter a first name"};
        errorList.push({ text: "Enter a first name", href: "#person-you-are-representing-first-name" });
    }
    if (!lastName) {
        errors.lastName = {text: "Enter a last name"};
        errorList.push({ text: "Enter a last name", href: "#person-you-are-representing-last-name" });
    }

    // render errors if any
    if (errorList.length > 0) {
      return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/07-what-is-the-name-of-the-person-you-are-representing', { 
        errors: errors,
        errorList: errorList
      });
    }

    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/16-add-your-comments');
});


// 08 - what is the name of your organisation or charity?
router.post('/your-org-or-charity-name-answer', function (req, res) {
    const yourOrgOrCharityName = req.session.data['your-org-or-charity-name'];
    if (!yourOrgOrCharityName) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/08-what-is-the-name-of-your-organisation-or-charity', { errorYourOrgOrCharityName: "Enter the name of your organisation or charity" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/09-what-is-your-job-title-or-volunteer-role');
});


// 09 - what is your job title or volunteer role?
router.post('/your-job-title-or-volunteer-role-answer', function (req, res) {
    const yourJobTitleOrVolunteerRole = req.session.data['your-job-title-or-volunteer-role'];
    if (!yourJobTitleOrVolunteerRole) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/09-what-is-your-job-title-or-volunteer-role', { errorYourJobTitleOrVolunteerRole: "Enter your job title or volunteer role" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/16-add-your-comments');
});


// 10 - what is the full name of the organisation or charity that you are representing?
router.post('/org-or-charity-you-are-representing-answer', function (req, res) {
    const orgOrCharityYouAreRepresenting = req.session.data['org-or-charity-you-are-representing'];
    if (!orgOrCharityYouAreRepresenting) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/10-what-is-the-full-name-of-the-organisation-or-charity-that-you-are-representing', { errorOrgOrCharityYouAreRepresenting: "Enter the full name of the organisation or charity that you are representing" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/16-add-your-comments');
});


// 11 - does the group have a name?
router.post('/does-the-group-have-a-name-answer', function (req, res) {
    const doesTheGroupHaveAName = req.session.data['does-the-group-have-a-name'];
    if (!doesTheGroupHaveAName) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/11-does-the-group-have-a-name', { errorDoesTheGroupHaveAName: "Select yes if the group has a name" });
    }
    if (doesTheGroupHaveAName === "Yes") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/12-what-is-the-name-of-the-group');
    }
    else if (doesTheGroupHaveAName === "No") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/13-what-is-the-name-of-the-first-person-you-are-representing');
    }
});


// 12 - what is the name of the group?
router.post('/name-of-the-group-answer', function (req, res) {
    const nameOfTheGroup = req.session.data['name-of-the-group'];
    if (!nameOfTheGroup) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/12-what-is-the-name-of-the-group', { errorNameOfTheGroup: "Enter the name of the group" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/13-what-is-the-name-of-the-first-person-you-are-representing');
});


// 13 - what is the name of the first person you are representing?
router.post('/name-of-first-person-you-are-representing-answer', function (req, res) {
    const firstName = req.session.data['name-of-first-person-you-are-representing-first-name'];
    const lastName = req.session.data['name-of-first-person-you-are-representing-last-name'];

    // error containers
    const errors = {};
    const errorList = [];

    // validate name fields
    if (!firstName) {
        errors.firstName = {text: "Enter a first name"};
        errorList.push({ text: "Enter a first name", href: "#name-of-first-person-you-are-representing-first-name" });
    }
    if (!lastName) {
        errors.lastName = {text: "Enter a last name"};
        errorList.push({ text: "Enter a last name", href: "#name-of-first-person-you-are-representing-last-name" });
    }

    // render errors if any
    if (errorList.length > 0) {
      return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/13-what-is-the-name-of-the-first-person-you-are-representing', { 
        errors: errors,
        errorList: errorList
      });
    }

    // Initialize the array if it doesn't exist
    if (!req.session.data['group-name-list']) {
        req.session.data['group-name-list'] = [];
    }

    // Safety check: Prevent duplicate entries if they press 'Back' to page 13 and resubmit
    if (req.session.data['group-name-list'].length === 0) {
        req.session.data['group-name-list'].push({ id: 'person-' + Date.now(), firstName, lastName });
    } else {
        // If they go back to the gateway and change the name, update the first item in the list
        req.session.data['group-name-list'][0].firstName = firstName;
        req.session.data['group-name-list'][0].lastName = lastName;
    }

    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/14-check-group-name-details');
});


// --- (1) GET: Setup Page 15 (Add Next Person or Edit Existing) ---
router.get('/setup-next-person', function(req, res) {
    const id = req.query.id;
    const groupNameList = req.session.data['group-name-list'] || [];

    if (id) {
        // Editing: Store ID and hydrate form variables
        req.session.data['edit-group-id'] = id;
        const existingPerson = groupNameList.find(p => p.id === id);
        
        if (existingPerson) {
            req.session.data['next-person-first-name'] = existingPerson.firstName;
            req.session.data['next-person-last-name'] = existingPerson.lastName;
        }
    } else {
        // Adding: Wipe variables clean
        req.session.data['edit-group-id'] = "";
        req.session.data['next-person-first-name'] = "";
        req.session.data['next-person-last-name'] = "";
    }

    // Redirect to prevent the data lag!
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/15-what-is-the-name-of-the-next-person-you-are-representing');
});


// --- (2) POST: Save Data from Page 15 ---
router.post('/name-of-next-person-answer', function(req, res) {
    const editId = req.session.data['edit-group-id'];
    const firstName = req.session.data['next-person-first-name'];
    const lastName = req.session.data['next-person-last-name'];

    const errors = {};
    const errorList = [];

    // Validation
    if (!firstName) {
        errors.firstName = {text: "Enter a first name"};
        errorList.push({ text: "Enter a first name", href: "#next-person-first-name" });
    }
    if (!lastName) {
        errors.lastName = {text: "Enter a last name"};
        errorList.push({ text: "Enter a last name", href: "#next-person-last-name" });
    }

    if (errorList.length > 0) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/15-what-is-the-name-of-the-next-person-you-are-representing', {
            errors: errors,
            errorList: errorList
        });
    }

    if (!req.session.data['group-name-list']) {
        req.session.data['group-name-list'] = [];
    }

    if (editId) {
        // We are updating an existing person
        const index = req.session.data['group-name-list'].findIndex(p => p.id === editId);
        if (index > -1) {
            req.session.data['group-name-list'][index].firstName = firstName;
            req.session.data['group-name-list'][index].lastName = lastName;
            
            // THE FIX: Sync the data back to Page 13 if it was the first person!
            if (index === 0) {
                req.session.data['name-of-first-person-you-are-representing-first-name'] = firstName;
                req.session.data['name-of-first-person-you-are-representing-last-name'] = lastName;
            }
        }
    } else {
        // We are adding a brand new person
        req.session.data['group-name-list'].push({ id: 'person-' + Date.now(), firstName, lastName });
    }

    // Wipe temporary variables clean
    req.session.data['edit-group-id'] = "";
    req.session.data['next-person-first-name'] = "";
    req.session.data['next-person-last-name'] = "";

    // Send back to the check details summary page
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/14-check-group-name-details');
});


// --- (3) GET: Direct Remove (No confirmation page) ---
router.get('/remove-group-person', function(req, res) {
    const idToRemove = req.query.id;

    if (idToRemove && req.session.data['group-name-list']) {
        // 1. Instantly filter out the object that matches the ID
        req.session.data['group-name-list'] = req.session.data['group-name-list'].filter(person => person.id !== idToRemove);
        
        // 2. THE FIX: Sync Page 13 variables with the new array state
        if (req.session.data['group-name-list'].length > 0) {
            // If there are still people left, make Page 13 match the new first person
            req.session.data['name-of-first-person-you-are-representing-first-name'] = req.session.data['group-name-list'][0].firstName;
            req.session.data['name-of-first-person-you-are-representing-last-name'] = req.session.data['group-name-list'][0].lastName;
        } else {
            // If the array is empty, wipe Page 13 clean so it doesn't show ghost data
            req.session.data['name-of-first-person-you-are-representing-first-name'] = "";
            req.session.data['name-of-first-person-you-are-representing-last-name'] = "";
        }
    }

    // Safety check: If the list is empty after removal, force them back to the start
    if (!req.session.data['group-name-list'] || req.session.data['group-name-list'].length === 0) {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/13-what-is-the-name-of-the-first-person-you-are-representing');
    } else {
        // Otherwise, send them right back to the updated summary table
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/14-check-group-name-details');
    }
});


// 16 - add your comments
router.post('/add-your-comments-answer', function (req, res) {
    const addYourComments = req.session.data['add-your-comments'];
    if (!addYourComments) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/16-add-your-comments', { errorAddYourComments: "Enter what you want to tell us about this proposed application" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/17-do-you-want-to-include-any-supporting-attachments-with-your-comment');
});



// 17 - do you want to include any supporting attachments with your comment?
router.post('/include-attachments-answer', function (req, res) {
    const includeAttachments = req.session.data['include-attachments'];
    if (!includeAttachments) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/17-do-you-want-to-include-any-supporting-attachments-with-your-comment', { errorIncludeAttachments: "Select yes if you want to include any supporting attachments with your comment" });
    }
    if (includeAttachments === "Yes") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/18-upload-supporting-attachments');
    }
    else if (includeAttachments === "No") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/19-did-you-use-artificial-intelligence-for-this-written-representation');
    }
});


// 18 - upload supporting attachments
router.post('/upload-supporting-attachments-answer', function(req, res) {
    const uploadedFiles = req.session.data['uploadedFiles'];
    // error containers
    const errors = {};
    const errorList = [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
        errors.uploadedFiles = { text: "Upload an attachment" };
    
        errorList.push({ text: "Upload an attachment", href: "#documents" });
    }

    // If there is an error, re-render the page
    if (errorList.length > 0) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/18-upload-supporting-attachments', {
            errors: errors,
            errorList: errorList
        });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/19-did-you-use-artificial-intelligence-for-this-written-representation');
});


// 19 - did you use artificial intelligence for this written representation?
router.post('/did-you-use-ai-answer', function (req, res) {
    const didYouUseAi = req.session.data['did-you-use-ai'];
    if (!didYouUseAi) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/19-did-you-use-artificial-intelligence-for-this-written-representation', { errorDidYouUseAi: "Select yes if you used artificial intelligence (AI) for this written representation" });
    }
    if (didYouUseAi === "Yes") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/20-how-did-you-use-artificial-intelligence');
    }
    else if (didYouUseAi === "No") {
        res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/21-check-your-answers');
    }
});


// 20 - how did you use artificial intelligence?
router.post('/how-did-you-use-ai-answer', function (req, res) {
    const howDidYouUseAi = req.session.data['how-did-you-use-ai'];
    if (!howDidYouUseAi) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/20-how-did-you-use-artificial-intelligence', { errorHowDidYouUseAi: "Enter how you used artificial intelligence (AI)" });
    }
    res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/21-check-your-answers');
});


// 22 - declaration + ref generation + save logic
router.post('/written-rep-submitted', function(req, res) {
    const data = req.session.data;

    if (!data['who-submit-rep']) {
            return res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/23-success');
        }

  // checkbox validation
    const declaration = req.session.data['declaration'];
    const usedAi = req.session.data['did-you-use-ai'] === 'Yes';
    // how many boxes were used for declaration page
    const requiredBoxesCount = usedAi ? 5 : 3;

    // error containers
    const errors = {};
    const errorList = [];

    // check if array exists and matches required amount of boxes checked
    if (!declaration || declaration.length < requiredBoxesCount) {
        errors.declaration = {
            text: "You must agree to all statements to submit your comment"
        };
        
        errorList.push({
            text: "You must agree to all statements to submit your comment",
            href: "#declaration"
        });
    }
    // render the page with errors if any
    if (errorList.length > 0) {
        return res.render('current-service/front-office/testing/s62a-2026-0048/have-your-say/22-declaration', {
            errors: errors,
            errorList: errorList
        });
    }

  // ref generation
    // Generate first 3 random numbers (100 to 999)
    const firstThreeDigits = Math.floor(100 + Math.random() * 900); 
    
    // Generate 2 random uppercase letters
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter1 = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    const letter2 = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    
    // Generate last 4 random numbers (1000 to 9999)
    const lastFourDigits = Math.floor(1000 + Math.random() * 9000); 

    // Combine them all
    const repReference = `${firstThreeDigits}${letter1}${letter2}-${lastFourDigits}`;

    // map representation object
    const isBehalf = data['who-submit-rep'] === 'On behalf of another person, an organisation or group of people';

    // define agent specific rule
    const asksAgentQuestions = isBehalf && [
    'A person', 
    'An organisation or charity that I do not work or volunteer for', 
    'A group of people'
    ].includes(data['who-are-you-representing']);

    const newRep = {
        reference: repReference,
        status: "Received",
        submissionDate: new Date().toISOString(),
        
        // Submitter Details
        submitterType: data['who-submit-rep'],
        submitterName: `${data['your-first-name']} ${data['your-last-name']}`,
        submitterEmail: data['your-email-address'],

        // Conditional: Who are they representing?
        representing: isBehalf ? data['who-are-you-representing'] : 'Myself',

        // Conditional: Agent Details
        isAgent: asksAgentQuestions ? data['is-agent'] : null,
        agentOrgName: (asksAgentQuestions && data['is-agent'] === 'Yes') ? data['agent-organisation-name'] : null,

        // Conditional: Represented Person
        representedPerson: (isBehalf && data['who-are-you-representing'] === 'A person') ? {
        firstName: data['person-you-are-representing-first-name'],
        lastName: data['person-you-are-representing-last-name']
        } : null,

        // Conditional: Represented Org (Work for)
        representedOrgWorkFor: (isBehalf && data['who-are-you-representing'] === 'An organisation or charity that I work or volunteer for') ? {
        name: data['your-org-or-charity-name'],
        role: data['your-job-title-or-volunteer-role']
        } : null,

        // Conditional: Represented Org (Do not work for)
        representedOrgOther: (isBehalf && data['who-are-you-representing'] === 'An organisation or charity that I do not work or volunteer for') ? data['org-or-charity-you-are-representing'] : null,

        // Conditional: Represented Group
        representedGroup: (isBehalf && data['who-are-you-representing'] === 'A group of people') ? {
        hasName: data['does-the-group-have-a-name'],
        name: data['does-the-group-have-a-name'] === 'Yes' ? data['name-of-the-group'] : null,
        members: data['group-name-list'] || []
        } : null,

        // Representation Content
        comment: data['add-your-comments'],
        
        // Attachments (Split back into an array for easy use in Back Office)
        hasAttachments: data['include-attachments'],
        attachments: data['include-attachments'] === 'Yes' && data['uploadedFiles'] ? data['uploadedFiles'].split('||') : [],

        // AI Declarations
        usedAi: data['did-you-use-ai'],
        howUsedAi: data['did-you-use-ai'] === 'Yes' ? data['how-did-you-use-ai'] : null,

        // Legal Declarations Array
        declarationsAgreed: data['declaration']
    };

    // save to array
    if (!data.representations) { data.representations = []; }
    data.representations.push(newRep);

    // wipe fields for fresh form
    const fieldsToClear = [
        'who-submit-rep',
        'who-are-you-representing',
        'is-agent',
        'agent-organisation-name',
        'your-first-name',
        'your-last-name',
        'your-email-address',
        'person-you-are-representing-first-name',
        'person-you-are-representing-last-name',
        'your-org-or-charity-name',
        'your-job-title-or-volunteer-role',
        'org-or-charity-you-are-representing',
        'does-the-group-have-a-name',
        'name-of-the-group',
        'group-name-list',
        'add-your-comments',
        'include-attachments',
        'uploadedFiles',
        'did-you-use-ai',
        'how-did-you-use-ai',
        'declaration'
    ];

    fieldsToClear.forEach(field => {
        delete data[field];
    });

    // pass reference to success page
    data.submittedRepReference = repReference;

  res.redirect('/current-service/front-office/testing/s62a-2026-0048/have-your-say/23-success');
});


export default router;

