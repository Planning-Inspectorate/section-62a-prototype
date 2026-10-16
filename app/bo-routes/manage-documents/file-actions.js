import { Router } from 'express';
import { getCase } from '../../helpers.js';

const router = Router();

// routes below this

// Unique ID generator
const generateId = () => 'f-' + Math.random().toString(36).substr(2, 9);

// UPLOAD FILES TO A FOLDER
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
});




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








export default router;