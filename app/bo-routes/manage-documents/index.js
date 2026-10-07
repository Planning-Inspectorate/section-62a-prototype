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

  // --- NEW: Handle delete banner ---
  const deleteBanner = req.session.data['deleteBanner'];
  req.session.data['deleteBanner'] = null;

  // Render the page
  res.render('current-service/back-office/manage-documents/index', { 
    currentCase: foundCase,       
    flashMessage: flashMessage,
    deleteBanner: deleteBanner
  });
});


// GET: Load the specific folder view
router.get('/current-service/back-office/manage-documents/folder/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);
    const subfolders = req.session.data.folders.filter(f => f.parentId === folderId);
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);

    if (!req.session.data.files) {
        req.session.data.files = [];
    }
    const files = req.session.data.files.filter(f => f.folderId === folderId);

    // --- NEW: Calculate Breadcrumb Path ---
    const breadcrumbs = [];
    let currentBreadcrumbFolder = currentFolder;
    
    // Climb up the tree until there are no more parentIds
    while (currentBreadcrumbFolder && currentBreadcrumbFolder.parentId) {
        const parent = req.session.data.folders.find(f => f.id === currentBreadcrumbFolder.parentId);
        if (parent) {
            breadcrumbs.unshift(parent); // Add to the front of the array so it reads left-to-right
            currentBreadcrumbFolder = parent;
        } else {
            break; // Stop if parent is missing
        }
    }

    const flashMessage = req.session.data['flashMessage'];
    req.session.data['flashMessage'] = null;

    const deleteBanner = req.session.data['deleteBanner'];
    req.session.data['deleteBanner'] = null;

    res.render('current-service/back-office/manage-documents/folder', {
        currentCase,
        currentFolder,
        subfolders,
        flashMessage,
        deleteBanner,
        files,
        breadcrumbs
    });
});

export default router;