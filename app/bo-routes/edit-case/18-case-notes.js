import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// --- ROUTES ---

// add a case note - GET
router.get('/add-case-note', function(req, res) {
    const foundCase = getCase(req); // find the correct case

    if (!foundCase) {
        return res.redirect('/current-service/back-office/cases'); // redirect if case not found
    }

    res.render('current-service/back-office/edit-case/18-case-notes/add-case-note', {
        foundCase: foundCase,
        data: req.session.data
    });
});


// add a case note - POST
router.post('/edit-add-case-note', function(req, res) {
    const caseNote = req.session.data['add-case-note'];
    const foundCase = getCase(req);

    if (!caseNote || caseNote.trim() === "") {
        return res.render('current-service/back-office/edit-case/18-case-notes/add-case-note', {
            foundCase: foundCase,
            data: req.session.data,
            errorAddCaseNote: "Enter a case note"
        });
    }

    if (foundCase) {
        // 1. Create the caseNotes array if it doesn't exist yet
        if (!foundCase.caseNotes) {
            foundCase.caseNotes = [];
        }

        // 2. Generate Dates
        const now = new Date();
        const isoDate = now.toISOString(); // Used for hidden table sorting

        // Format Date: "21 October 2026"
        const formattedDate = new Intl.DateTimeFormat('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        }).format(now);
        
        // Format Time: "5:00pm"
        const formattedTime = new Intl.DateTimeFormat('en-GB', { 
            hour: 'numeric', minute: '2-digit', hour12: true 
        }).format(now).toLowerCase().replace(' ', ''); 

        // Combine for display
        const displayDateTime = `${formattedDate}<br>${formattedTime}`;

        // 3. Push the new object into the case array
        foundCase.caseNotes.push({
            isoDate: isoDate,
            displayDateTime: displayDateTime,
            details: caseNote,
            user: "User Account"
        });
    }

    // 4. Clear the textarea session data so it is empty next time
    delete req.session.data['add-case-note'];

    // Trigger success banner
    req.session.data['flashMessage'] = "Case note added";

    res.redirect('/current-service/back-office/tab-view/18-case-notes');
});

export default router;