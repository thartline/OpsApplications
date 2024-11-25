//@NotOnlyCurrentDoc
//THIS FUNCTION IS TO MAKE A NEW MENU IN GOOGLE SHEETS
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Connect with Redash")
    .addItem("Get Data from Redash", "getdatafromredash")
    .addToUi();
}
