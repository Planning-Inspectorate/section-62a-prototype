import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

// Unique ID generator
const generateId = () => 'f-' + Math.random().toString(36).substr(2, 9);

// =========================
// upload routes
// =========================

// GET: Load the upload files page
router.get('/current-service/back-office/manage-documents/upload-files/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    // Clear previous upload data from session
    if (req.session.data) delete req.session.data['folderUploadedFiles'];
    if (res.locals.data) delete res.locals.data['folderUploadedFiles'];

    res.render('current-service/back-office/manage-documents/files/upload', {
        currentCase,
        currentFolder,
        errorList: null,
        errors: {}
    });
});

// POST: Process the uploaded files
router.post('/current-service/back-office/manage-documents/upload-files/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    // Grab the string of file names separated by '||'
    const uploadedFilesString = req.body.folderUploadedFiles || '';

    // Validation: Check if they actually uploaded anything
    if (!uploadedFilesString) {
        const errorList = [{
            text: "You must upload at least one file",
            href: "#documents"
        }];
        
        const errors = {
            folderUploadedFiles: { text: "You must upload at least one file" }
        };

        return res.render('current-service/back-office/manage-documents/files/upload', {
            currentCase,
            currentFolder,
            errorList,
            errors
        });
    }

    // Process the files
    const fileNames = uploadedFilesString.split('||').filter(name => name.trim() !== '');

    // Ensure the global files array exists
    if (!req.session.data.files) {
        req.session.data.files = [];
    }

    // Get today's date formatted nicely for the table (e.g., "20 Jul 2026")
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const sortDate = today.toISOString().split('T')[0]; // "2026-07-20" for sorting

    // Create a file object for each one and push to the global array
    fileNames.forEach(name => {
        
        // Mocking a file size and type based on the name
        const extension = name.includes('.') ? name.split('.').pop().toUpperCase() : 'UNKNOWN';
        const mockSize = (Math.random() * (5 - 0.5) + 0.5).toFixed(1); // Random size between 0.5MB and 5MB

        req.session.data.files.push({
            id: generateId(),
            caseReference: caseRef,
            folderId: folderId,
            name: name,
            extension: extension,
            sizeMB: mockSize,
            uploadDate: dateFormatted,
            uploadDateSort: sortDate
        });
    });

    // Clear the input field from session
    delete req.session.data['folderUploadedFiles'];

    // --- NEW: Dynamic pluralization and standard text ---
    const fileCount = fileNames.length;
    const fileWord = fileCount === 1 ? 'file' : 'files';

    // Set standard text flash message
    req.session.data['flashMessage'] = {
        isStandardText: true,
        text: `${fileCount} ${fileWord} uploaded successfully`
    };

    // Redirect back to the folder view
    res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
});


// =========================
// bulk actions for folder.html routes
// =========================

// POST: Intercept bulk actions
router.post('/current-service/back-office/manage-documents/folder/:folderId/bulk-action', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    let selectedFiles = req.body.selectedFiles || [];
    
    if (!Array.isArray(selectedFiles)) selectedFiles = [selectedFiles];

    if (req.body.bulkAction === 'move') {
        req.session.data.moveFilesList = selectedFiles;
        res.redirect(`/current-service/back-office/manage-documents/move-files/${folderId}?ref=${caseRef}`);
    }
    else if (req.body.bulkAction === 'delete') {
        req.session.data.deleteFilesList = selectedFiles;
        res.redirect(`/current-service/back-office/manage-documents/delete-files/${folderId}?ref=${caseRef}`);
    }
    else if (req.body.bulkAction === 'publish') {
        req.session.data.publishFilesList = selectedFiles;
        res.redirect(`/current-service/back-office/manage-documents/publish-files/${folderId}?ref=${caseRef}`);
    }
    else if (req.body.bulkAction === 'unpublish') {
        req.session.data.unpublishFilesList = selectedFiles;
        req.session.data.unpublishReturnTo = 'folder';
        res.redirect(`/current-service/back-office/manage-documents/unpublish-files/${folderId}?ref=${caseRef}`);
    }
});



// =========================
// move routes
// =========================

// GET: Step 1 - Review selected files
router.get('/current-service/back-office/manage-documents/move-files/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const folderId = req.params.folderId;
    
    // --- NEW: Grab the current folder so we can use its name in the UI ---
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);
    
    const fileIds = req.session.data.moveFilesList || [];

    // Redirect back if empty
    if (fileIds.length === 0) return res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);

    const filesToMove = req.session.data.files.filter(f => fileIds.includes(f.id));
    
    res.render('current-service/back-office/manage-documents/files/move/move-files', { 
        currentCase, 
        folderId, 
        filesToMove,
        currentFolder // <-- Don't forget to pass it here!
    });
});

// GET: Step 1a - Remove a file from the move selection
router.get('/current-service/back-office/manage-documents/move-files/:folderId/remove/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileIdToRemove = req.params.fileId;
    
    req.session.data.moveFilesList = req.session.data.moveFilesList.filter(id => id !== fileIdToRemove);
    res.redirect(`/current-service/back-office/manage-documents/move-files/${folderId}?ref=${caseRef}`);
});

// GET: Step 2 - Select destination folder
router.get('/current-service/back-office/manage-documents/move-location/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const folderId = req.params.folderId;
    
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);

    const breadcrumbs = [];
    let currentBreadcrumbFolder = currentFolder;
    while (currentBreadcrumbFolder) {
        breadcrumbs.unshift(currentBreadcrumbFolder.name);
        currentBreadcrumbFolder = req.session.data.folders.find(f => f.id === currentBreadcrumbFolder.parentId);
    }
    const folderPathString = breadcrumbs.join(' / ');
    
    // 1. Get all folders for this case
    let allFolders = req.session.data.folders.filter(f => f.caseReference === caseRef);
    
    // 2. Filter out 'Pre-application advice' using your specific case flags
    allFolders = allFolders.filter(f => {
        if (f.name === 'Pre-application advice') {
            const requested = currentCase.preApplicationRequested;
            // If it's NOT requested from PINS or Council, AND the folder isn't explicitly visible
            if (!["Yes - PINS", "Yes - Council"].includes(requested) && !currentCase.preAppAdviceFolderVisible) {
                return false; // Hide the folder
            }
        }
        return true;
    });

    // 3. Build the radio hierarchy using the cleanly filtered list
    const rootFolders = allFolders.filter(f => !f.parentId).map(root => {
        const subfolders = allFolders.filter(f => f.parentId === root.id);
        return { ...root, subfolders, hasSubfolders: subfolders.length > 0 };
    });

    res.render('current-service/back-office/manage-documents/files/move/move-location', { 
        currentCase, 
        folderId, 
        currentFolder,
        folderPathString,
        rootFolders 
    });
});

// POST: Step 2 - Save destination folder
router.post('/current-service/back-office/manage-documents/move-location/:folderId', function (req, res) {
    // FIX: Changed from req.query.ref to req.body.ref
    const caseRef = req.body.ref; 
    const folderId = req.params.folderId;
    
    req.session.data.moveDestinationId = req.body.destinationFolderId;
    
    // Now caseRef will correctly populate the URL
    res.redirect(`/current-service/back-office/manage-documents/check-location/${folderId}?ref=${caseRef}`);
});

// GET: Step 3 - Check location
router.get('/current-service/back-office/manage-documents/check-location/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const folderId = req.params.folderId;
    const filesCount = (req.session.data.moveFilesList || []).length;
    const destFolderId = req.session.data.moveDestinationId;
    const destFolder = req.session.data.folders.find(f => f.id === destFolderId);

    // Calculate the full destination folder path
    const breadcrumbs = [];
    let currentBreadcrumbFolder = destFolder;
    while (currentBreadcrumbFolder) {
        breadcrumbs.unshift(currentBreadcrumbFolder.name);
        currentBreadcrumbFolder = req.session.data.folders.find(f => f.id === currentBreadcrumbFolder.parentId);
    }
    const destFolderPathString = breadcrumbs.join(' / ');

    res.render('current-service/back-office/manage-documents/files/move/check-location', { 
        currentCase, 
        folderId, 
        filesCount, 
        destFolder,
        destFolderPathString // Pass the constructed string to the template
    });
});

// POST: Final Submit - Move files
router.post('/current-service/back-office/manage-documents/move-submit/:folderId', function (req, res) {
    const caseRef = req.body.ref; // Grabbing from the hidden input
    const fileIds = req.session.data.moveFilesList || [];
    const destFolderId = req.session.data.moveDestinationId;
    const destFolder = req.session.data.folders.find(f => f.id === destFolderId);

    // Update the folderId for all selected files
    req.session.data.files.forEach(f => {
        if (fileIds.includes(f.id)) {
            f.folderId = destFolderId;
        }
    });

    // --- NEW: Dynamic pluralization and updated phrasing ---
    const fileCount = fileIds.length;
    const fileWord = fileCount === 1 ? 'file' : 'files';

    // Set standard text flash message
    req.session.data['flashMessage'] = {
        isStandardText: true,
        text: `${fileCount} selected ${fileWord} moved to ${destFolder.name}`
    };

    // Clean up session
    delete req.session.data.moveFilesList;
    delete req.session.data.moveDestinationId;

    res.redirect(`/current-service/back-office/manage-documents/folder/${destFolderId}?ref=${caseRef}`);
});



// =========================
// delete routes
// =========================

// GET: Intercept single file delete action
router.get('/current-service/back-office/manage-documents/folder/:folderId/delete-single/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileId = req.params.fileId;
    
    // Set the delete list to contain only this specific file
    req.session.data.deleteFilesList = [fileId];
    
    res.redirect(`/current-service/back-office/manage-documents/delete-files/${folderId}?ref=${caseRef}`);
});


// GET: Review selected files for deletion
router.get('/current-service/back-office/manage-documents/delete-files/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const folderId = req.params.folderId;
    
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);
    const fileIds = req.session.data.deleteFilesList || [];

    // Redirect back if empty
    if (fileIds.length === 0) return res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);

    const filesToDelete = req.session.data.files.filter(f => fileIds.includes(f.id));
    
    // Renders from your new directory structure
    res.render('current-service/back-office/manage-documents/files/delete/delete-files', { 
        currentCase, 
        folderId, 
        filesToDelete,
        currentFolder 
    });
});


// GET: Remove a file from the delete selection
router.get('/current-service/back-office/manage-documents/delete-files/:folderId/remove/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileIdToRemove = req.params.fileId;
    
    req.session.data.deleteFilesList = req.session.data.deleteFilesList.filter(id => id !== fileIdToRemove);
    res.redirect(`/current-service/back-office/manage-documents/delete-files/${folderId}?ref=${caseRef}`);
});

// POST: Final Submit - Delete files
router.post('/current-service/back-office/manage-documents/delete-submit/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    const fileIds = req.session.data.deleteFilesList || [];

    // Remove the files from the global array
    req.session.data.files = req.session.data.files.filter(f => !fileIds.includes(f.id));

    const fileCount = fileIds.length;
    const fileWord = fileCount === 1 ? 'file' : 'files';

    // Set standard text flash message
    req.session.data['flashMessage'] = {
        isStandardText: true,
        text: `${fileCount} selected ${fileWord} deleted`
    };

    // Clean up session
    delete req.session.data.deleteFilesList;

    res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
});



// =========================
// publish routes
// =========================

// GET: Intercept single file publish action
router.get('/current-service/back-office/manage-documents/folder/:folderId/publish-single/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    req.session.data.publishFilesList = [req.params.fileId];
    res.redirect(`/current-service/back-office/manage-documents/publish-files/${folderId}?ref=${caseRef}`);
});

// GET: Categorise files before publishing
router.get('/current-service/back-office/manage-documents/publish-files/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const folderId = req.params.folderId;
    const currentFolder = req.session.data.folders.find(f => f.id === folderId);
    
    const fileIds = req.session.data.publishFilesList || [];
    if (fileIds.length === 0) return res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);

    const filesToPublish = req.session.data.files.filter(f => fileIds.includes(f.id));
    
    res.render('current-service/back-office/manage-documents/files/publish/categorise', { 
        currentCase, 
        folderId, 
        currentFolder,
        filesToPublish 
    });
});

// GET: Remove a file from the publish selection
router.get('/current-service/back-office/manage-documents/publish-files/:folderId/remove/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileIdToRemove = req.params.fileId;
    
    req.session.data.publishFilesList = req.session.data.publishFilesList.filter(id => id !== fileIdToRemove);
    res.redirect(`/current-service/back-office/manage-documents/publish-files/${folderId}?ref=${caseRef}`);
});

// POST: Final Submit - Publish files
router.post('/current-service/back-office/manage-documents/publish-submit/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    const fileIds = req.session.data.publishFilesList || [];
    const category = req.body.documentCategory;

    // Validation: Check if a category was selected
    if (!category) {
        const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
        const currentFolder = req.session.data.folders.find(f => f.id === folderId);
        const filesToPublish = req.session.data.files.filter(f => fileIds.includes(f.id));

        return res.render('current-service/back-office/manage-documents/files/publish/categorise', {
            currentCase,
            folderId,
            currentFolder,
            filesToPublish,
            errorCategory: "Select a category"
        });
    }

    // Update the status and category for all selected files
    req.session.data.files.forEach(f => {
        if (fileIds.includes(f.id)) {
            f.status = 'published';
            f.category = category;
        }
    });

    const fileCount = fileIds.length;
    const fileWord = fileCount === 1 ? 'file' : 'files';

    // Set custom text flash message with link flag
    req.session.data['flashMessage'] = {
        isPublishText: true,
        text: `${fileCount} ${fileWord} published`
    };

    delete req.session.data.publishFilesList;

    res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
});



// =========================
// unpublish routes
// =========================

// GET: Intercept single file unpublish action
router.get('/current-service/back-office/manage-documents/folder/:folderId/unpublish-single/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    req.session.data.unpublishFilesList = [req.params.fileId];

    req.session.data.unpublishReturnTo = req.query.origin === 'published' ? 'published-documents' : 'folder';

    res.redirect(`/current-service/back-office/manage-documents/unpublish-files/${folderId}?ref=${caseRef}`);
});

// GET: Review files for unpublishing
router.get('/current-service/back-office/manage-documents/unpublish-files/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const folderId = req.params.folderId;
    
    const fileIds = req.session.data.unpublishFilesList || [];
    if (fileIds.length === 0) return res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);

    const filesToUnpublish = req.session.data.files.filter(f => fileIds.includes(f.id));

    const returnTo = req.session.data.unpublishReturnTo || 'folder';
    
    res.render('current-service/back-office/manage-documents/files/unpublish/unpublish', { 
        currentCase, 
        folderId, 
        filesToUnpublish,
        returnTo
    });
});

// GET: Remove a file from the unpublish selection
router.get('/current-service/back-office/manage-documents/unpublish-files/:folderId/remove/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileIdToRemove = req.params.fileId;
    
    req.session.data.unpublishFilesList = req.session.data.unpublishFilesList.filter(id => id !== fileIdToRemove);
    res.redirect(`/current-service/back-office/manage-documents/unpublish-files/${folderId}?ref=${caseRef}`);
});

// POST: Final Submit - Unpublish files
router.post('/current-service/back-office/manage-documents/unpublish-submit/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    const fileIds = req.session.data.unpublishFilesList || [];
    const returnTo = req.session.data.unpublishReturnTo || 'folder'; 

    // 1. Revert status to unpublished
    req.session.data.files.forEach(f => {
        if (fileIds.includes(f.id)) {
            f.status = 'unpublished';
        }
    });

    const fileCount = fileIds.length;
    
    // Set standard text flash message
    req.session.data['flashMessage'] = {
        isStandardText: true,
        text: `${fileCount} file${fileCount === 1 ? '' : 's'} unpublished`
    };

    delete req.session.data.unpublishFilesList;
    delete req.session.data.unpublishReturnTo; 

    // --- NEW: Check if there are any published files left for this case ---
    const remainingPublished = req.session.data.files.some(f => 
        f.caseReference === caseRef && f.status === 'published'
    );

    // --- UPDATED CONDITIONAL REDIRECT ---
    if (returnTo === 'published-documents') {
        if (!remainingPublished) {
            // Kick back to index if that was the last published file
            res.redirect(`/current-service/back-office/manage-documents/index?ref=${caseRef}`);
        } else {
            res.redirect(`/current-service/back-office/manage-documents/published-documents?ref=${caseRef}`);
        }
    } else {
        res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
    }
});




// =========================
// published documents routes
// =========================

// GET: View all published documents
router.get('/current-service/back-office/manage-documents/published-documents', function (req, res) {
    const caseRef = req.query.ref;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    
    // Grab all files for this case that have status === 'published'
    const publishedFiles = (req.session.data.files || []).filter(f => 
        f.caseReference === caseRef && f.status === 'published'
    );

    const flashMessage = req.session.data.flashMessage;
    delete req.session.data.flashMessage;

    res.render('current-service/back-office/manage-documents/files/publish/published-documents', {
        currentCase,
        publishedFiles,
        flashMessage
    });
});

// POST: Intercept bulk actions from the Published Documents view
router.post('/current-service/back-office/manage-documents/published-documents/bulk-action', function (req, res) {
    const caseRef = req.query.ref;
    let selectedFiles = req.body.selectedFiles || [];
    if (!Array.isArray(selectedFiles)) selectedFiles = [selectedFiles];

    // Grab the folderId of the first selected file to borrow its routing path
    // (since our existing routes like categorise/unpublish require a folderId parameter)
    const firstSelectedFile = req.session.data.files.find(f => f.id === selectedFiles[0]);
    const folderPathId = firstSelectedFile ? firstSelectedFile.folderId : 'root';

    if (req.body.bulkAction === 'categorise') {
        req.session.data.recategoriseFilesList = selectedFiles;
        res.redirect(`/current-service/back-office/manage-documents/re-categorise/${folderPathId}?ref=${caseRef}`);
    } 
    else if (req.body.bulkAction === 'unpublish') {
        req.session.data.unpublishFilesList = selectedFiles;
        req.session.data.unpublishReturnTo = 'published-documents';
        res.redirect(`/current-service/back-office/manage-documents/unpublish-files/${folderPathId}?ref=${caseRef}`);
    }
});




// =========================
// recategorise routes
// =========================

// GET: Intercept single file re-categorise action
router.get('/current-service/back-office/manage-documents/folder/:folderId/re-categorise-single/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    
    // Set the recategorise list to contain only this specific file
    req.session.data.recategoriseFilesList = [req.params.fileId];
    
    res.redirect(`/current-service/back-office/manage-documents/re-categorise/${folderId}?ref=${caseRef}`);
});

// GET: Review files for re-categorisation
router.get('/current-service/back-office/manage-documents/re-categorise/:folderId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    
    const fileIds = req.session.data.recategoriseFilesList || [];
    if (fileIds.length === 0) return res.redirect(`/current-service/back-office/manage-documents/published-documents?ref=${caseRef}`);

    const filesToRecategorise = req.session.data.files.filter(f => fileIds.includes(f.id));

    res.render('current-service/back-office/manage-documents/files/publish/re-categorise', { 
        currentCase, 
        folderId,
        filesToRecategorise
    });
});

// GET: Remove a file from the re-categorise selection
router.get('/current-service/back-office/manage-documents/re-categorise/:folderId/remove/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileIdToRemove = req.params.fileId;
    
    req.session.data.recategoriseFilesList = req.session.data.recategoriseFilesList.filter(id => id !== fileIdToRemove);
    res.redirect(`/current-service/back-office/manage-documents/re-categorise/${folderId}?ref=${caseRef}`);
});

// POST: Final Submit - Save new categories
router.post('/current-service/back-office/manage-documents/re-categorise-submit/:folderId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    const fileIds = req.session.data.recategoriseFilesList || [];
    const category = req.body.documentCategory;

    if (!category) {
        const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
        const filesToRecategorise = req.session.data.files.filter(f => fileIds.includes(f.id));
        
        return res.render('current-service/back-office/manage-documents/files/publish/re-categorise', {
            currentCase,
            folderId,
            filesToRecategorise,
            errorCategory: "Select a category"
        });
    }

    // Update category for all selected files
    req.session.data.files.forEach(f => {
        if (fileIds.includes(f.id)) {
            f.category = category;
        }
    });

    const fileCount = fileIds.length;
    const fileWord = fileCount === 1 ? 'file' : 'files';

    // Dynamic success banner using standard text
    req.session.data['flashMessage'] = {
        isStandardText: true,
        text: `${fileCount} selected ${fileWord} recategorised to ${category}`
    };

    delete req.session.data.recategoriseFilesList;

    res.redirect(`/current-service/back-office/manage-documents/published-documents?ref=${caseRef}`);
});




// =========================
// rename routes
// =========================

// GET: Rename file page
router.get('/current-service/back-office/manage-documents/folder/:folderId/rename-file/:fileId', function (req, res) {
    const caseRef = req.query.ref;
    const folderId = req.params.folderId;
    const fileId = req.params.fileId;
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const fileToRename = req.session.data.files.find(f => f.id === fileId);

    if (!fileToRename) return res.redirect(`/current-service/back-office/manage-documents/folders/folder/${folderId}?ref=${caseRef}`);

    // Extract base name and extension for the input field and suffix
    const lastDotIndex = fileToRename.name.lastIndexOf('.');
    let baseName = fileToRename.name;
    let fileExtension = fileToRename.extension || '';
    
    if (lastDotIndex !== -1) {
        baseName = fileToRename.name.substring(0, lastDotIndex);
        fileExtension = fileToRename.name.substring(lastDotIndex); // keeps the dot, e.g., ".pdf"
    } else if (fileExtension && !fileExtension.startsWith('.')) {
        fileExtension = '.' + fileExtension.toLowerCase();
    }

    res.render('current-service/back-office/manage-documents/files/rename/rename-file', {
        currentCase,
        folderId,
        file: fileToRename,
        baseName,
        fileExtension
    });
});

// POST: Submit renamed file
router.post('/current-service/back-office/manage-documents/folder/:folderId/rename-submit/:fileId', function (req, res) {
    const caseRef = req.body.ref;
    const folderId = req.params.folderId;
    const fileId = req.params.fileId;
    const newBaseName = (req.body.fileName || '').trim();
    const fileExtension = req.body.fileExtension || ''; // Passed via hidden input
    
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);
    const fileToRename = req.session.data.files.find(f => f.id === fileId);

    let errorFileName = null;
    const proposedFullName = newBaseName + fileExtension;

    // Validation 1: Empty check
    if (!newBaseName) {
        errorFileName = "File name is required";
    }
    // Validation 2: Special characters
    else if (!/^[a-zA-Z0-9 .\-_()&']+$/.test(newBaseName)) {
        errorFileName = "File name can only include letters, numbers, spaces, dots, hyphens, underscores, brackets, ampersands and single apostrophes.";
    }
    // Validation 3: Duplicate check (excluding the file itself)
    else {
        const isDuplicate = req.session.data.files.some(f => 
            f.folderId === folderId && 
            f.id !== fileId && 
            f.name.toLowerCase() === proposedFullName.toLowerCase()
        );

        if (isDuplicate) {
            errorFileName = "A file with this name already exists in this folder";
        }
    }

    if (errorFileName) {
        return res.render('current-service/back-office/manage-documents/files/rename/rename-file', {
            currentCase,
            folderId,
            file: fileToRename,
            baseName: newBaseName,
            fileExtension,
            errorFileName
        });
    }

    // Success: Update the file name
    if (fileToRename) {
        fileToRename.name = proposedFullName;
    }

    // Set flash message
    req.session.data['flashMessage'] = {
        isStandardText: true,
        text: `File renamed to ${proposedFullName}`
    };

    res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
});




// =========================
// search routes
// =========================

// GET: Search files
router.get('/current-service/back-office/manage-documents/files/search', function (req, res) {
    const caseRef = req.query.ref;
    const searchTerm = req.query.searchTerm || '';
    const currentCase = req.session.data.cases.find(c => c.reference === caseRef);

    // Initialize an empty array for results
    let searchResults = [];

    // If a search term exists, filter the files for this case
    if (searchTerm.trim() !== '') {
        const lowerSearchTerm = searchTerm.toLowerCase();
        searchResults = req.session.data.files.filter(f => 
            f.caseReference === caseRef && 
            f.name.toLowerCase().includes(lowerSearchTerm)
        );
    }

    res.render('current-service/back-office/manage-documents/files/search/search-results', {
        currentCase,
        searchTerm,
        searchResults
    });
});




export default router;