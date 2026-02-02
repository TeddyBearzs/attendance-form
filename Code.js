/**
 * Serves the HTML file to the browser.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Choir Attendance Manager')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Handles new form submissions.
 */
function processForm(formData) {
  try {
    const sheet = getAttendanceSheet();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    sheet.appendRow([
      formData.date,
      formData.firstName,
      formData.lastName,
      formData.status,
      formData.reason || 'N/A',
      new Date() 
    ]);
    return { success: true, message: 'New attendance recorded!' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Searches for an existing record to update.
 */
function searchRecord(searchDate, searchName) {
  try {
    const sheet = getAttendanceSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      let rowDate = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "yyyy-MM-dd");
      if (rowDate === searchDate && data[i][1].toString().toLowerCase() === searchName.toLowerCase()) {
        
        // Split name back into first and last for the edit form
        const nameParts = data[i][1].toString().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
          success: true,
          row: i + 1,
          data: {
            date: rowDate,
            firstName: firstName,
            lastName: lastName,
            status: data[i][2],
            reason: data[i][3]
          }
        };
      }
    }
    return { success: false, message: 'No record found for that name and date.' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Updates an existing row in the sheet.
 */
function updateRecord(formData) {
  try {
    const sheet = getAttendanceSheet();
    const row = parseInt(formData.rowId);
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    sheet.getRange(row, 1, 1, 4).setValues([[
      formData.date,
      formData.firstName,
      formData.lastName,
      formData.status,
      formData.reason || 'N/A'
    ]]);
    
    return { success: true, message: 'Record updated successfully!' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function getAttendanceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Attendance');
  if (!sheet) throw new Error('Sheet "Attendance" not found.');
  return sheet;
}