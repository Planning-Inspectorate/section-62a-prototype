import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

// load index page for correct case
router.get('/current-service/back-office/manage-documents/index', function(req, res) {
  // find the case and lock in session
  const foundCase = getCase(req);

  // safety bounce: If the case doesn't exist, kick them back to the list
  if (!foundCase) {
    return res.redirect('/current-service/back-office/cases'); 
  }

  // handle flash messages (green success banners) for case edits
  const flashMessage = req.session.data['flashMessage'];
  req.session.data['flashMessage'] = null;

  // Render the page
  res.render('current-service/back-office/manage-documents/index', { 
    currentCase: foundCase,       
    flashMessage: flashMessage
  });
});


// find specific folder for correct case
router.get('/current-service/back-office/manage-documents/folder/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    
    // Find the current folder object so you can display its name in the h1
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);
    // Find any subfolders that have this folder as their parentId
    const subfolders = req.session.data.folders.filter(f => f.parentId === folderId);
    // Grab the case data
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);

    // --- INTERCEPT AND CLEAR FLASH MESSAGE ---
    const flashMessage = req.session.data['flashMessage'];
    req.session.data['flashMessage'] = null;

    res.render('current-service/back-office/manage-documents/folder', {
        currentCase,
        currentFolder,
        subfolders,
        flashMessage
    });
});

export default router;