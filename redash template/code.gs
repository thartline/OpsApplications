//@NotOnlyCurrentDoc
// This is the function that will be called from the Connect with Redash menu
function getdatafromredash() {
  const time_limit = 600000; // Update this value to control how long the code waits on the query to refresh
  const poll_interval = 5000;
  const api_key = get_creds();
  const query_id = getSettingValue('query_id');
  const options = {
      'method': 'post'
  }

  // Formmat of the list containing all the query information:
  // const list = [
    // {
    //   redashQueryId: query_id,
    //   //sheetId: 756448798,
    //   sheetName: DATA,
    //   refreshJobId: null,
    //   timeElapsed: 0,
    //   timeLimit: null,
    //   statusCode: -1
    // },
    // ]
  
  // Step 0: Grab the information of all the queries to be run and include them in 'list'.
  //         Form a list of dictionary objects that include the query_ID, the params and the sheet in which the results will be added.
  const queries = getQueries();
  const list = [];
  for (query of queries) {
    obj = {
      redashQueryId: query.QUERY_ID,
      params: query.PARAMS,
      sheetName: query.SHEET_NAME,
      refreshJobId: null,
      timeElapsed: 0,
      timeLimit: null,
      statusCode: -1
    };
    list.push(obj);
  }

  // Step 1: Refresh all queries in 'list'
  for (l of list) {
    // Step 1a: Get all params
    var paramString = '';
    if (l.params != null && l.params != '') {
      const paramRows = l.params.split('\n');
      for (paramRow of paramRows) {
        const paramDetails = paramRow.split(':');
        paramString += '&p_' + paramDetails[0].trim() + '=' + paramDetails[1].trim();
      }
    }

    // I think this colde is old, so it can be deleted
    // const params = getParams();
    // if (params != null) {
    //   for (param of params) {
    //     paramString += '&p_' + param.NAME + '=' + param.VALUE;
    //   }
    // }

    // Step 1b: Form the URL of the query to be run using the API key, query ID and parameters
    var url = 'https://redash.scale.com/api/queries/' + l.redashQueryId + '/refresh?api_key=' + api_key + paramString;
    Logger.log(url);
    var response = UrlFetchApp.fetch(url, options);
    l.refreshJobId = JSON.parse(response).job.id;
    Logger.log(response.getContentText());
    if (l.timeLimit == null) {
      l.timeLimit = time_limit;
    }
  }

  // Step 2: Poll every 5 seconds to see if refresh has finished; GET
  var queries_succeeded = 0;
  var queries_errored = 0;
  var queries_timed_out = 0;
  var queries_finished = 0;
  while (queries_finished < list.length) {
    for (l of list) {
      if (l.statusCode != 3 && l.statusCode != 4 && l.timeElapsed < l.timeLimit) {
        var url = 'https://redash.scale.com/api/jobs/' + l.refreshJobId + '?api_key=' + api_key;
        var response = UrlFetchApp.fetch(url);
        Logger.log(response.getContentText());
        l.statusCode = JSON.parse(response).job.status;
        if (l.statusCode == 3) {
          url = 'https://redash.scale.com/api/query_results/' + JSON.parse(response).job.query_result_id + '.csv?api_key=' + api_key;
          response = UrlFetchApp.fetch(url);
          Logger.log(response.getContentText());
          getapidata(response, l.sheetName); //spreadsheet_id, 
          queries_succeeded++;
        }
        if (l.statusCode == 4) {
          Logger.log(response.getContentText());
          queries_errored++;
        }
      }
      l.timeElapsed += poll_interval;
      if (l.timeElapsed >= l.timeLimit) {
        queries_timed_out++;
      }
    }
    queries_finished = queries_succeeded + queries_errored + queries_timed_out;
    Utilities.sleep(poll_interval);
  }
  var spreadsheet = SpreadsheetApp.getActive();
  var message = 'Refresh finished with ' + queries_succeeded + ' queries succeeded, '
    + queries_errored + ' queries errored, and '
    + queries_timed_out + ' queries timed out';
  spreadsheet.toast(message);
  Logger.log(message);
}
