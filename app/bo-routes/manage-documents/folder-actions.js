import { Router } from 'express';
import { getCase } from '../../helpers.js';
import { createFolder, renameFolder, deleteFolder } from '../../folder-helpers.js';

const router = Router();

// routes below this

// CREATE A FOLDER
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



// RENAME A FOLDER
// GET: Load the rename folder page
router.get('/current-service/back-office/manage-documents/rename-folder/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    // Wipe the session data so the input pre-fills with the actual folder name on first load
    if (req.session.data) delete req.session.data['rename-folder'];
    if (res.locals.data) delete res.locals.data['rename-folder'];

    res.render('current-service/back-office/manage-documents/rename', {
        currentCase,
        currentFolder,
        errorRenameFolder: null
    });
});

// POST: Validate and save the renamed folder
router.post('/current-service/back-office/manage-documents/rename-folder/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    const folderName = (req.body['rename-folder'] || '').trim();
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    let errorRenameFolder = null;

    // Validation 1: Length check
    if (!folderName || folderName.length < 3 || folderName.length > 255) {
        errorRenameFolder = "Folder name must be between 3 and 255 characters";
    } 
    // Validation 2: Allowed characters check
    else if (!/^[a-zA-Z0-9 _\-&()\/']+$/.test(folderName)) {
        errorRenameFolder = "Folder name must only include letters a to z, numbers and special characters such as spaces, underscores, hyphens, ampersand, brackets, forward slashes and single apostrophes";
    } 
    // Validation 3: Duplicate check (excluding THIS folder's current name)
    else {
        const isDuplicate = req.session.data.folders.some(f => 
            f.caseReference === caseRef && 
            f.parentId === currentFolder.parentId && 
            f.id !== folderId && // Don't check against itself
            f.name.toLowerCase() === folderName.toLowerCase()
        );

        if (isDuplicate) {
            errorRenameFolder = "Folder name already exists";
        }
    }

    if (errorRenameFolder) {
        return res.render('current-service/back-office/manage-documents/rename', {
            currentCase,
            currentFolder,
            errorRenameFolder
        });
    }

    // SUCCESS: Rename the folder using the helper
    renameFolder(req.session.data.folders, folderId, folderName);
    delete req.session.data['rename-folder'];

    // Set flash message (adding an "action" property)
    req.session.data['flashMessage'] = {
        name: folderName,
        id: folderId,
        action: "renamed"
    };

    // Redirect back to the folder view
    res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
});



// DELETE A FOLDER
// GET: Load the delete folder page
router.get('/current-service/back-office/manage-documents/delete-folder/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    res.render('current-service/back-office/manage-documents/delete', {
        currentCase,
        currentFolder,
        errors: null
    });
});

// POST: Validate and delete the folder
router.post('/current-service/back-office/manage-documents/delete-folder/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    let errors = [];

    // Validation 1: Check for subfolders
    const hasSubfolders = req.session.data.folders.some(f => f.parentId === folderId);
    if (hasSubfolders) {
        errors.push("It contains subfolders");
    }

    // Validation 2: Check for documents (Setting up array if it doesn't exist yet for future use)
    if (!req.session.data.files) {
        req.session.data.files = [];
    }
    const hasDocuments = req.session.data.files.some(file => file.folderId === folderId);
    if (hasDocuments) {
        errors.push("It contains documents");
    }

    // If there are issues, re-render the page with the customized error block
    if (errors.length > 0) {
        return res.render('current-service/back-office/manage-documents/delete', {
            currentCase,
            currentFolder,
            errors
        });
    }

    // SUCCESS: Capture parentId and name BEFORE deleting so we know where to redirect
    const parentId = currentFolder.parentId;
    const folderName = currentFolder.name;

    // Delete the folder
    deleteFolder(req.session.data.folders, folderId);

    // Set the specific delete banner variable you created earlier for the index/folder view
    req.session.data['deleteBanner'] = folderName;

    // Redirect back to the parent folder (or the index if it was a root folder)
    if (parentId) {
        res.redirect(`/current-service/back-office/manage-documents/folder/${parentId}?ref=${caseRef}`);
    } else {
        res.redirect(`/current-service/back-office/manage-documents/index?ref=${caseRef}`);
    }
});


export default router;