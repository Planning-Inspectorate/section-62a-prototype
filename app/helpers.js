// ==============================================================================
// SHARED GLOBALS
// ==============================================================================

// List of allowed LPA's for accessible autocomplete
export const validAuthorities = [
  "Bristol City Council", "Camden London Borough Council", "Cornwall Council",
  "Manchester City Council", "Nottingham City Council", "Sheffield City Council",
  "Southwark Council", "Wandsworth Borough Council", "Westminster City Council", "York City Council"
];


// ================================================================================
// 1. GET CASE HELPER --- helper to find the correct case data
// ================================================================================ 
export function getCase(req) {
  // 1. Look for 'reference' in the URL query, the body, or the session
  const ref = req.query.reference || req.body.reference || req.session.data['reference'];
  
  // 2. Lock it into the session so future sub-pages remember what case we are editing
  if (ref) {
    req.session.data['reference'] = ref;
  }

  // 3. Find and return the case
  const cases = req.session.data['cases'] || [];
  return cases.find(c => c.reference === ref);
}


// ================================================================================
// 2. AUDIT LOG HELPER --- helper to create audit logs when user data is changed
// ================================================================================ 
export function addAuditLog(req, caseRef, details) {
  let cases = req.session.data['cases'] || [];
  let targetCase = cases.find(c => c.reference === caseRef);

  if (targetCase) {
    if (!targetCase.auditLog) targetCase.auditLog = [];

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

    targetCase.auditLog.unshift({
      date: `${dateStr}<br>${timeStr}`,
      details: details,
      user: req.session.data['currentUser'] || "User Account"
    });

    targetCase.lastModified = `${dateStr} at ${timeStr}`;
    targetCase.lastModifiedBy = req.session.data['currentUser'] || "User Account";
  }
}

// ================================================================================
// 3. ADDRESS VALIDATION -- checking address fields contain a real postcode
// ================================================================================
export function validatePostcode(postcode) {
  // 1. If it's completely empty, return no errors (since your design says it's optional)
  if (!postcode || postcode.trim() === "") {
    return null; 
  }

  // 2. Clean it up
  const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;

  // 3. Run the checks and return the specific error string if it fails
  if (cleanPostcode.length < 5 || cleanPostcode.length > 7) {
    return "Postcode must be between 5 and 7 characters";
  } 
  
  if (!postcodeRegex.test(cleanPostcode)) {
    return "Enter a real postcode";
  }

  // 4. If it passes everything, return null (no errors!)
  return null;
}


// ================================================================================
// 4. DATE VALIDATION -- checking fields only contain the correct date
// ================================================================================
export function validateDate(day, month, year, displayName, fieldName) {
  // 1. Check if completely empty
  if (!day && !month && !year) {
    return { 
      text: `Enter the ${displayName.toLowerCase()}`, 
      href: `#${fieldName}-day`, 
      errorFields: ['day', 'month', 'year'] 
    };
  }

  // 2. Check for missing individual fields
  const missing = [];
  if (!day) missing.push('day');
  if (!month) missing.push('month');
  if (!year) missing.push('year');

  if (missing.length > 0) {
    const missingText = missing.length === 2 
      ? `${displayName} must include a ${missing[0]} and ${missing[1]}` 
      : `${displayName} must include a ${missing[0]}`;
    return { text: missingText, href: `#${fieldName}-${missing[0]}`, errorFields: missing };
  }

  // 3. Check for invalid numbers (e.g., month 13, day 32)
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);
  const errorFields = [];

  if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) errorFields.push('day');
  if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) errorFields.push('month');
  if (year.length !== 4 || isNaN(yearNum)) errorFields.push('year');

  if (errorFields.length > 0) {
    let text = `${displayName} must be a real date`;
    if (errorFields.includes('day')) text = `${displayName} day must be a real day`;
    else if (errorFields.includes('month')) text = `${displayName} month must be a real month`;
    else if (errorFields.includes('year')) text = `${displayName} year must include 4 numbers`;
    
    return { text, href: `#${fieldName}-${errorFields[0]}`, errorFields };
  }

  // 4. Check for impossible dates (e.g., February 30th)
  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  if ((dateObj.getMonth() + 1 !== monthNum) || (dateObj.getDate() !== dayNum)) {
    return { text: "Enter a real date", href: `#${fieldName}-day`, errorFields: ['day', 'month', 'year'] };
  }

  // 5. Success! No errors.
  return null;
}


// ================================================================================
// 4. OPTIONAL DATE VALIDATION -- date field validation allowing for all empty values
// ================================================================================
export function validateOptionalDate(day, month, year, displayName, fieldName) {

  // 0. If ALL fields are empty, pass validation immediately (because it's optional)
  if (!day && !month && !year) {
    return null;
  }

  // 1. Check for missing individual fields (this now only triggers if 1 or 2 fields are missing)
  const missing = [];
  if (!day) missing.push('day');
  if (!month) missing.push('month');
  if (!year) missing.push('year');

  if (missing.length > 0) {
    const missingText = missing.length === 2 
      ? `${displayName} must include a ${missing[0]} and ${missing[1]}` 
      : `${displayName} must include a ${missing[0]}`;
    return { text: missingText, href: `#${fieldName}-${missing[0]}`, errorFields: missing };
  }

  // 2. Check for invalid numbers (e.g., month 13, day 32)
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);
  const errorFields = [];

  if (dayNum < 1 || dayNum > 31 || isNaN(dayNum)) errorFields.push('day');
  if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) errorFields.push('month');
  if (year.length !== 4 || isNaN(yearNum)) errorFields.push('year');

  if (errorFields.length > 0) {
    let text = `${displayName} must be a real date`;
    if (errorFields.includes('day')) text = `${displayName} day must be a real day`;
    else if (errorFields.includes('month')) text = `${displayName} month must be a real month`;
    else if (errorFields.includes('year')) text = `${displayName} year must include 4 numbers`;
    
    return { text, href: `#${fieldName}-${errorFields[0]}`, errorFields };
  }

  // 3. Check for impossible dates (e.g., February 30th)
  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  if ((dateObj.getMonth() + 1 !== monthNum) || (dateObj.getDate() !== dayNum)) {
    return { text: "Enter a real date", href: `#${fieldName}-day`, errorFields: ['day', 'month', 'year'] };
  }

  // 4. Success! No errors.
  return null;
}


// =================================================================================
// 5. DATE + TIME VALIDATION -- checking fields contain the correct time and date
// =================================================================================
export function validateDateTime(day, month, year, hour, minute, ampm, displayName, fieldName) {
  // 1. First, run our existing date validation check
  const dateError = validateDate(day, month, year, displayName, fieldName);
  if (dateError) return dateError; // If the date is broken, return that error immediately

  // 2. Date is fine, now check the time
  const errorFields = [];
  
  if (!hour) {
    return { text: "Enter the hour", href: `#${fieldName}-hour`, errorFields: ['hour'] };
  } 
  
  const h = Number(hour);
  if (isNaN(h) || h < 1 || h > 12) {
    return { text: "Hour must be between 1 and 12", href: `#${fieldName}-hour`, errorFields: ['hour'] };
  }

  if (minute) {
    const m = Number(minute);
    if (isNaN(m) || m < 0 || m > 59) {
      return { text: "Minute must be between 0 and 59", href: `#${fieldName}-minute`, errorFields: ['minute'] };
    }
  }

  if (!ampm || (ampm !== "am" && ampm !== "pm")) {
    return { text: "Select am or pm", href: `#${fieldName}-ampm`, errorFields: ['ampm'] };
  }

  // 3. Success!
  return null;
}


// ================================================================================
// 6. MANDATORY NUMBER VALIDATION -- checking fields only contain number inputs
// ================================================================================
export function validateNumber(value, displayName, fieldName) {
  // 1. Check if empty
  if (!value || value.trim() === "") {
    return { text: `Enter the ${displayName.toLowerCase()}`, href: `#${fieldName}` };
  } 
  
  // 2. Check it contains only numbers (allowing for decimals if needed)
  if (isNaN(value) || !/^\d+(\.\d+)?$/.test(value)) {
    return { text: `${displayName} must only contain numbers`, href: `#${fieldName}` };
  }

  // 3. Success!
  return null;
}


// ================================================================================
// 7. EMAIL VALIDATION
// ================================================================================
export function validateEmail(value, displayName, fieldName) {
  if (!value || value.trim() === "") {
    return { text: `Enter the ${displayName}`, href: `#${fieldName}` };
  } 
  
  const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return { text: "Enter an email address in the correct format, like name@example.com", href: `#${fieldName}` };
  }

  return null;
}


// ================================================================================
// 8. OPTIONAL PHONE VALIDATION
// ================================================================================
export function validateOptionalPhone(value, fieldName) {
  if (!value || value.trim() === "") {
    return null; // Passes validation automatically if left blank
  } 
  
  if (value.length > 15) {
    return { text: "Phone number must be 15 characters or less", href: `#${fieldName}` };
  } 
  
  const cleanPhone = value.replace(/\s+/g, '');
  if (!/^\d+$/.test(cleanPhone)) {
    return { text: "Enter a valid phone number", href: `#${fieldName}` };
  }

  return null;
}


// ================================================================================
// 9. SITE COORDS GRID REFERENCE VALIDATION
// ================================================================================
export function validateOptionalSiteCoords(value, displayName, fieldName) {

  if (!value || value.trim() === "") {
    return null; // Passes validation automatically if left blank
  } 

  // Check if it contains letters or weird characters
  if (isNaN(value) || !/^\d+$/.test(value)) {
    return { text: `${displayName} must only contain numbers`, href: `#${fieldName}` };
  }

  if (value.length > 6) {
    return { text: `${displayName} must be 6 characters or less`, href: `#${fieldName}` };
  } 
    
  // 3. Success!
  return null;
}



// ================================================================================
// 10. OPTIONAL ONLY NUMBER VALIDATION -- check for only numbers
// ================================================================================
export function validateOptionalNumber(value, displayName, fieldName) {

  if (!value || value.trim() === "") {
    return null; // Passes validation automatically if left blank
  } 

  // Check if it contains letters or weird characters
  if (isNaN(value) || !/^\d+$/.test(value)) {
    return { text: `${displayName} must only contain numbers`, href: `#${fieldName}` };
  }
    
  // 3. Success!
  return null;
}


// ================================================================================
// 11. UPDATE CASE HELPER --- Edit fields and synchronise data across linked cases
// ================================================================================ 
export function updateCaseData(req, reference, newFields) {
  const cases = req.session.data['cases'] || [];
  
  // 1. Find the case the user is currently editing
  const currentCase = cases.find(c => c.reference === reference);
  if (!currentCase) return null;

  // 2. Update this case with the new data
  Object.assign(currentCase, newFields);

  // 3. If this case has a twin, find it and update it too!
  if (currentCase.linkedCaseReference) {
    const linkedCase = cases.find(c => c.reference === currentCase.linkedCaseReference);
    if (linkedCase) {
      Object.assign(linkedCase, newFields);
      // Optional: You could even automatically add an audit log to the linked case here!
      // addAuditLog(req, linkedCase.reference, "Data updated via linked application");
    }
  }

  return currentCase;
}


// ================================================================================
// 12. NAME VALIDATION
// ================================================================================
export function validateName(value, displayName, fieldName) {
  if (!value || value.trim() === "") {
    return { text: `Enter the ${displayName}`, href: `#${fieldName}` };
  } 

  // \p{L} allows all standard letters including accented characters
  const nameRegex = /^[\p{L}0-9\s\-',\(\)&]+$/u;
  
  if (!nameRegex.test(value)) {
    return { 
      text: `${displayName} must only include letters, spaces, hyphens, apostrophes, commas, brackets, ampersands or numbers`, 
      href: `#${fieldName}` 
    };
  }

  return null;
}

// ================================================================================
// 13. OPTIONAL NAME VALIDATION
// ================================================================================
export function validateOptionalName(value, displayName, fieldName) {
  if (!value || value.trim() === "") {
    return null; // Passes validation automatically if left blank
  } 

  const nameRegex = /^[\p{L}0-9\s\-',\(\)&]+$/u;
  
  if (!nameRegex.test(value)) {
    return { 
      text: `${displayName} must only include letters, spaces, hyphens, apostrophes, commas, brackets, ampersands or numbers`, 
      href: `#${fieldName}` 
    };
  }

  return null;
}

// ================================================================================
// 14. OPTIONAL EMAIL VALIDATION
// ================================================================================
export function validateOptionalEmail(value, displayName, fieldName) {
  if (!value || value.trim() === "") {
    return null; // Passes validation automatically if left blank
  } 
  
  const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return { text: "Enter an email address in the correct format, like name@example.com", href: `#${fieldName}` };
  }

  return null;
}


// ================================================================================
// 15. PHONE VALIDATION
// ================================================================================
export function validatePhone(value, displayName, fieldName) {
  if (!value || value.trim() === "") {
    return { text: `Enter the ${displayName}`, href: `#${fieldName}` };
  } 
  
  if (value.length > 15) {
    return { text: "Telephone number must be 15 characters or less", href: `#${fieldName}` };
  } 
  
  const cleanPhone = value.replace(/\s+/g, '');
  if (!/^\d+$/.test(cleanPhone)) {
    return { text: "Enter a valid telephone number", href: `#${fieldName}` };
  }

  return null;
}

// ================================================================================
// 16. OPTIONAL ONLY NUMBER + DECIMAL VALIDATION -- check for only numbers with decimals
// ================================================================================
export function validateOptionalDecimalNumber(value, displayName, fieldName) {

  if (!value || value.trim() === "") {
    return null; // Passes validation automatically if left blank
  } 

  // Clean any accidental spaces from the beginning or end
  const cleanValue = value.trim();

  // Regex breakdown:
  // ^\d+       : Must start with at least one digit
  // (\.\d+)?$  : Optionally allows a single decimal point followed by at least one digit at the end
  if (isNaN(cleanValue) || !/^\d+(\.\d+)?$/.test(cleanValue)) {
    return { text: `${displayName} must only contain numbers`, href: `#${fieldName}` };
  }
    
  // 3. Success!
  return null;
}


// ================================================================================
// 17. GET REPRESENTATION HELPER --- helper to find a specific representation
// ================================================================================ 
export function getRepresentation(req) {
  // 1. Look for 'repRef' in the URL query, the body, or the session
  const repRef = req.query.repRef || req.body.repRef || req.session.data['currentRepRef'];
  
  if (!repRef) return null;

  // 2. Lock it into the session so future edit sub-pages remember what rep we are editing
  req.session.data['currentRepRef'] = repRef;

  // 3. Find and return the representation
  const cases = req.session.data['cases'] || [];
  
  for (const currentCase of cases) {
    if (currentCase.representations) {
      const rep = currentCase.representations.find(r => r.reference === repRef);
      if (rep) {
        return rep; // Found it!
      }
    }
  }
  
  return null; // Not found
}