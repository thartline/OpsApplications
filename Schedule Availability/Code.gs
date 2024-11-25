function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Availability Timesheet')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function saveScheduleData(jsonData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedules');
    if (!sheet) {
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Schedules');
      // Set up headers
      newSheet.getRange('A1').setValue('Email');
      newSheet.getRange('B1').setValue('Schedule');
      newSheet.getRange('C1').setValue('Last Updated');
    }

    const data = JSON.parse(jsonData);
    const emails = data.emails || [];
    const schedules = data.schedules || {};

    // Clear existing data except headers
    const lastRow = Math.max(sheet.getLastRow(), 1);
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    }

    // Write each schedule in its own row
    emails.forEach((email, index) => {
      const schedule = schedules[email] || {};
      sheet.getRange(index + 2, 1).setValue(email);
      sheet.getRange(index + 2, 2).setValue(JSON.stringify(schedule));
      sheet.getRange(index + 2, 3).setValue(new Date().toISOString());
    });

    return true;
  } catch (error) {
    Logger.log(error);
    return false;
  }
}

function loadScheduleData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedules');
    if (!sheet) {
      return JSON.stringify({
        emails: [],
        schedules: {}
      });
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return JSON.stringify({
        emails: [],
        schedules: {}
      });
    }

    // Read all data
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    
    // Construct the response
    const emails = [];
    const schedules = {};
    
    data.forEach(row => {
      if (row[0]) { // If email exists
        const email = row[0];
        emails.push(email);
        try {
          schedules[email] = JSON.parse(row[1] || '{}');
        } catch (e) {
          schedules[email] = {};
        }
      }
    });

    return JSON.stringify({
      emails: emails,
      schedules: schedules
    });
  } catch (error) {
    Logger.log(error);
    return JSON.stringify({
      emails: [],
      schedules: {}
    });
  }
}

function deleteSchedules(emailsToDelete) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedules');
    if (!sheet) return false;

    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    
    // Filter out deleted emails and reconstruct data
    const remainingData = data.filter(row => !emailsToDelete.includes(row[0]));
    
    // Clear existing data
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    }

    // Write remaining data
    if (remainingData.length > 0) {
      remainingData.forEach((row, index) => {
        sheet.getRange(index + 2, 1).setValue(row[0]);
        sheet.getRange(index + 2, 2).setValue(row[1]);
        sheet.getRange(index + 2, 3).setValue(new Date().toISOString());
      });
    }

    return true;
  } catch (error) {
    Logger.log(error);
    return false;
  }
}
