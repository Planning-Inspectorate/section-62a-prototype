import { Router } from 'express';
import govukPrototypeKit from "govuk-prototype-kit";

const router = govukPrototypeKit.requests.setupRouter();

// routes below this 


// Prototype-friendly unique ID generator
const generateId = () => 'f-' + Math.random().toString(36).substr(2, 9);

/**
 * STEP 1: Generate initial folders based on case type
 */
export function generateInitialFolders(caseRef, applicationType) {
    const initialFolders = [];

    if (applicationType === 'Pre-application') {
        const rootId = generateId();
        
        // 1. Create Root
        initialFolders.push({
            id: rootId,
            caseReference: caseRef,
            name: 'Pre-application',
            parentId: null
        });

        // 2. Create Subfolders
        const subfolderNames = ["Applicant's documents", "LPA documents", "Other", "PINS documents", "Policy"];
        subfolderNames.forEach(name => {
            initialFolders.push({
                id: generateId(),
                caseReference: caseRef,
                name: name,
                parentId: rootId
            });
        });

    } else if (applicationType === 'Application') {
        // --- Root 1: The planning application ---
        const planningAppRootId = generateId();
        initialFolders.push({
            id: planningAppRootId,
            caseReference: caseRef,
            name: 'The planning application',
            parentId: null
        });

        const planningAppSubfolders = [
            'Application documents (originals)',
            'Application documents (redacted)'
        ];
        planningAppSubfolders.forEach(name => {
            initialFolders.push({
                id: generateId(),
                caseReference: caseRef,
                name: name,
                parentId: planningAppRootId
            });
        });
        
        // --- Root 2: Working documents ---
        const workingDocsRootId = generateId();
        initialFolders.push({
            id: workingDocsRootId,
            caseReference: caseRef,
            name: 'Working documents',
            parentId: null
        });

        const workingDocsSubfolders = [
            'File notes and correspondence',
            'EIA',
            'Fees',
            'Hearings',
            'Decisions or recommendations',
            'Representations',
            'Internal correspondence'
        ];
        workingDocsSubfolders.forEach(name => {
            initialFolders.push({
                id: generateId(),
                caseReference: caseRef,
                name: name,
                parentId: workingDocsRootId
            });
        });

        // --- Root 3: Pre-application advice (Hidden by default in the UI) ---
        initialFolders.push({
            id: generateId(),
            caseReference: caseRef,
            name: 'Pre-application advice',
            parentId: null
        });
    }

    return initialFolders;
}

/**
 * STEP 2: CRUD Operations
 */

// CREATE
export function createFolder(foldersArray, caseRef, name, parentId = null) {
    const newFolder = {
        id: generateId(),
        caseReference: caseRef,
        name: name,
        parentId: parentId
    };
    foldersArray.push(newFolder);
    return newFolder;
}

// RENAME
export function renameFolder(foldersArray, folderId, newName) {
    const folder = foldersArray.find(f => f.id === folderId);
    if (folder) {
        folder.name = newName;
    }
}

// DELETE (Recursive: deletes folder and all infinitely nested subfolders)
export function deleteFolder(foldersArray, folderId) {
    // Find all direct children
    const children = foldersArray.filter(f => f.parentId === folderId);
    
    // Recursively delete children first
    children.forEach(child => deleteFolder(foldersArray, child.id));
    
    // Delete the parent itself
    const index = foldersArray.findIndex(f => f.id === folderId);
    if (index > -1) {
        foldersArray.splice(index, 1);
    }
}

/**
 * UI HELPER: Turns the flat array into a nested object for Nunjucks to render easily
 */
export function buildFolderTree(foldersArray, caseRef) {
    const caseFolders = foldersArray.filter(f => f.caseReference === caseRef);
    const folderMap = {};
    const tree = [];

    // Initialize map
    caseFolders.forEach(f => {
        folderMap[f.id] = { ...f, children: [] };
    });

    // Build tree
    caseFolders.forEach(f => {
        if (f.parentId && folderMap[f.parentId]) {
            folderMap[f.parentId].children.push(folderMap[f.id]);
        } else {
            tree.push(folderMap[f.id]);
        }
    });

    return tree;
}


export default router;
