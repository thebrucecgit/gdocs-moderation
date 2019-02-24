var document = {
  doc: function(){
    var file = DriveApp.getFilesByName(getProperty("DocName")).next();
    if (file.getMimeType() === "application/vnd.google-apps.document") return file;
  },
  sheet: function(name){
    return SpreadsheetApp.openById(getProperty("SSID")).getSheetByName(name);
  },
  addCommenters: function(emails){
    try {
      console.log("addCommenters: " + JSON.stringify(emails));
      document.doc().addCommenters(emails);
    } catch(err) {
      console.error(err);
    }
  },
  removeCommenter: function(email){
    try {
      document.doc().removeCommenter(email);
    } catch(err) {
      console.error(err);
    }
  },
  log: function(log, type, reason, user){
    var val = [new Date().toLocaleString('en-GB',{timeZone: 'UTC'}), log, type, reason, user || Session.getEffectiveUser().getEmail()];
    document.sheet(logSheet).insertRowBefore(2).getRange(2,1,1,5).setValues([val]);
  },
  ui: function(){
    return DocumentApp.getUi();
  }
}