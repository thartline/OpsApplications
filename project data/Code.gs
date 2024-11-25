function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Availability Timesheet')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function saveScheduleData(jsonData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Schedules');
    if (!sheet) {
      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Schedules');
    }
    
    sheet.getRange('A1').setValue(jsonData);
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
    
    const data = sheet.getRange('A1').getValue();
    return data || JSON.stringify({
      emails: [],
      schedules: {}
    });
  } catch (error) {
    Logger.log(error);
    return JSON.stringify({
      emails: [],
      schedules: {}
    });
  }
}
