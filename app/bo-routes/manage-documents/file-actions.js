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

    res.render('current-service/back-office/manage-documents/upload', {
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

        return res.render('current-service/back-office/manage-documents/upload', {
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

    // Set success flash message
    req.session.data['flashMessage'] = {
        name: `${fileNames.length} file(s)`,
        id: folderId,
        action: "uploaded successfully"
    };

    // Redirect back to the folder view
    res.redirect(`/current-service/back-office/manage-documents/folder/${folderId}?ref=${caseRef}`);
});



export default router;