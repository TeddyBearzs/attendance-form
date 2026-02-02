/**
 * Redirect GET requests to the API handler (for searching)
 */
function doGet(e) {
  if (e.parameter.action === 'search') {
    return handleSearch(e.parameter.date, e.parameter.name);
  }
  // Default response if accessed directly
  return ContentService.createTextOutput("API is running.").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handles POST requests (for Add and Update) from GitHub Pages
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    if (action === 'add') {
      return handleAdd(params);
    } else if (action === 'update') {
      return handleUpdate(params);
    }
  } catch (error) {
    return createResponse({ success: false, message: error.toString() });
  }
}

function handleAdd(formData) {
  const sheet = getAttendanceSheet();
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  sheet.appendRow([formData.date, fullName, formData.status, formData.reason || 'N/A', new Date()]);
  return createResponse({ success: true, message: 'New attendance recorded!' });
}

function handleSearch(searchDate, searchName) {
  const sheet = getAttendanceSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    let rowDate = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "yyyy-MM-dd");
    if (rowDate === searchDate && data[i][1].toString().toLowerCase() === searchName.toLowerCase()) {
      const nameParts = data[i][1].toString().split(' ');
      return createResponse({
        success: true,
        row: i + 1,
        data: { date: rowDate, firstName: nameParts[0], lastName: nameParts.slice(1).join(' '), status: data[i][2], reason: data[i][3] }
      });
    }
  }
  return createResponse({ success: false, message: 'No record found.' });
}

function handleUpdate(formData) {
  const sheet = getAttendanceSheet();
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  sheet.getRange(parseInt(formData.rowId), 1, 1, 4).setValues([[formData.date, fullName, formData.status, formData.reason || 'N/A']]);
  return createResponse({ success: true, message: 'Record updated!' });
}

function getAttendanceSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Attendance');
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
