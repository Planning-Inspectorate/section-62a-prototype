import { Router } from 'express';
import { getCase } from '../../helpers.js';
import { createFolder } from '../../folder-helpers.js';

const router = Router();

// routes below this

// GET: Load the create folder page
router.get('/current-service/back-office/manage-documents/create-folder', function (req, res) {
    const caseRef = req.query.ref;
    const parentId = req.query.parentId || 'root';
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    let parentFolder = null;

    if (parentId !== 'root') {
        parentFolder = req.session.data.folders.find(f => f.id === parentId);
    }

    if (req.session.data) {
        delete req.session.data['create-folder'];
    }
    if (res.locals.data) {
        delete res.locals.data['create-folder'];
    }

    res.render('current-service/back-office/manage-documents/create.html', {
        currentCase,
        parentId,
        parentFolder,
        errorCreateFolder: null
    });
});

// POST: Validate and save the new folder
router.post('/current-service/back-office/manage-documents/create-folder', function (req, res) {
    const caseRef = req.body.ref;
    const parentId = req.body.parentId;
    const folderName = (req.body['create-folder'] || '').trim();
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    let parentFolder = null;
    if (parentId !== 'root') {
        parentFolder = req.session.data.folders.find(f => f.id === parentId);
    }

    let errorCreateFolder = null;

    // Validation 1: Length check
    if (!folderName || folderName.length < 3 || folderName.length > 255) {
        errorCreateFolder = "Folder name must be between 3 and 255 characters";
    } 
    // Validation 2: Allowed characters check (Letters, numbers, spaces, _ - & ( ) / ')
    else if (!/^[a-zA-Z0-9 _\-&()\/']+$/.test(folderName)) {
        errorCreateFolder = "Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens, ampersand, brackets, forward slashes and single apostrophes";
    } 
    // Validation 3: Duplicate check within the exact same parent location
    else {
        const actualParentId = parentId === 'root' ? null : parentId;
        const isDuplicate = req.session.data.folders.some(f => 
            f.caseReference === caseRef && 
            f.parentId === actualParentId && 
            f.name.toLowerCase() === folderName.toLowerCase()
        );

        if (isDuplicate) {
            errorCreateFolder = "Folder name already exists";
        }
    }

    // If there is an error, re-render the page with the error message
    if (errorCreateFolder) {
        return res.render('current-service/back-office/manage-documents/create.html', {
            currentCase,
            parentId,
            parentFolder,
            errorCreateFolder
        });
    }

    // SUCCESS: Save the new folder using the helper
    const actualParentId = parentId === 'root' ? null : parentId;
    const newFolder = createFolder(req.session.data.folders, caseRef, folderName, actualParentId);

    // Clear the input from session data so it's empty next time
    delete req.session.data['create-folder'];

    // --- SET FLASH MESSAGE ---
    req.session.data['flashMessage'] = {
        name: newFolder.name,
        id: newFolder.id
    };

    // Redirect back to the correct location
    if (parentId === 'root') {
        res.redirect(`/current-service/back-office/manage-documents/index?ref=${caseRef}`);
    } else {
        res.redirect(`/current-service/back-office/manage-documents/folder/${parentId}?ref=${caseRef}`);
    }
});


export default router;