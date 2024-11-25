//@NotOnlyCurrentDoc
function getapidata(response, sheetName) {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = getSheetByName(spreadsheet, sheetName);
  var values = Utilities.parseCsv(response.getContentText('UTF-8'));
  sheet.clearContents()
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values)
}

function getParams() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = getSheetByName(spreadsheet, PARAMS);
  return buildObjectArray(sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues());
}

function getParamValue(paramName) {
  var value = '';
  for (param of getParams()) {
    if (param.NAME == paramName) {
      value = param.VALUE;
      break;
    }
  }
  return value;
}

function getSettings() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = getSheetByName(spreadsheet, SETTINGS);
  return buildObjectArray(sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues());
}

function getSettingValue(paramName) {
  var value = '';
  for (param of getSettings()) {
    if (param.NAME == paramName) {
      value = param.VALUE;
      break;
    }
  }
  return value;
}

// Function that reads the 'Queries tab', name is stored in the Queries constant.  It grabs the Query_ID, Params to pass to redash, 
function getQueries() {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = getSheetByName(spreadsheet, QUERIES);
  return buildObjectArray(sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues());
}

// Function that resturns a sheet/tab when passed the id
function getSheetById(spreadsheet, gid){
  return spreadsheet.getSheets().filter(
    function(s) {return s.getSheetId() === gid;}
  )[0];
}

// Function that resturns a sheet/tab when passed the tab name
function getSheetByName(spreadsheet, sheetName){
  return spreadsheet.getSheets().filter(
    function(s) {return s.getSheetName() === sheetName;}
  )[0];
}

function buildObjectArray(data) {
  var obj = {};
  var headers = data[0];
  var cols = headers.length;
  var result = [];
  var row = [];

  for (var i = 1, l = data.length; i < l; i++) {
    row = data[i];
    obj = {}
    for (var col = 0; col < cols; col++) {
        obj[headers[col]] = row[col];
    }
    result.push(obj);
  }
  return result;
}

function buildDataArray(outputPrelim, headers = null) {
  const output = [];
  headers = headers ?? getHeadersFromObjectArray(outputPrelim);
  output.push(headers);
  outputPrelim.forEach(function(member) {
    output.push(headers.map(function(header) {
      return member[header] || '';
    }));
  });
  return output;
}

function buildDataArrayNoHeaders(outputPrelim, headers) {
  const output = [];
  // output.push(headers);
  outputPrelim.forEach(function(member) {
    output.push(headers.map(function(header) {
      return member[header] || '';
    }));
  });
  return output;
}

function test() {
  Logger.log(getParamValue('project_id'));
}

function writeToEndOfSheet(sheet, data) {
  Logger.log(data);
  if (data.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
    }
}

function getAdjacentCell(cell, direction, increment = 1) {
  var rowModifier;
  var colModifier;
  switch (direction) {
    case 'above':
      rowModifier = -1 * increment;
      colModifier = 0;
      break;
    case 'below':
      rowModifier = 1 * increment;
      colModifier = 0;
      break;
    case 'left':
      rowModifier = 0;
      colModifier = -1 * increment;
      break;
    case 'right':
      rowModifier = 0;
      colModifier = 1 * increment;
      break;
    default:
      rowModifier = 0;
      colModifier = 0;
      break;
  }
  return cell.getSheet().getRange(cell.getRow()+rowModifier,cell.getColumn()+colModifier,1,1);
}

function get_creds() {
  PROJECT_NUM = 'ops-tools-375704';
  SECRET = 'Redash'
  VERSION = 'latest'
  endpoint = `https://secretmanager.googleapis.com/v1/projects/${PROJECT_NUM}/secrets/${SECRET}/versions/${VERSION}:access`;
  token = ScriptApp.getOAuthToken();
  response = UrlFetchApp.fetch(endpoint, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
    }
    });
  var secret = JSON.parse(response.getContentText()).payload.data;
  api_key = Utilities.base64Decode(secret);
   result = Utilities.newBlob(api_key, 'text/plain').getDataAsString();
  return result
}
