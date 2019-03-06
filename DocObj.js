var document = {
  doc: function(){
    var file = DriveApp.getFilesByName(getProperty("DocName")).next();
    if (file.getMimeType() === "application/vnd.google-apps.document") return file;
  },
  sheet: function(name){
    return SpreadsheetApp.openById(getProperty("SSID")).getSheetByName(name);
  },
  addCommenter: function(email, addCommenterRetry){
    try {
      console.log("Add Commenter: " + email);
      // throw "error for testing";
      document.doc().addCommenter(email);
      if(addCommenterRetry){
        deleteTrigger(addCommenterRetry)
      }
      return true;
    } catch(err) {
      console.error("Failed to add commenter: ", err);
      onFailure(email, addCommenterRetry);
      return false;
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

function isMod(mod){
  var alreadyAddedSheet = document.sheet(addedSheet);
  var values = alreadyAddedSheet.getRange(2, 1, alreadyAddedSheet.getLastRow()-1, 2).getValues();
  var mods = [];
  values.forEach(function(value){
    if(value[1] === "Mod") mods.push(value[0]);
  });
  if(mods.indexOf(mod) !== -1) return true;
  return false;
}

function onFailure(newRetry, addCommenterRetry){
  if(addCommenterRetry && addCommenterRetry.attempt >= 3) {
    console.error("Attempted to add " + addCommenterRetry.email + " more than 3 times without success");
    deleteTrigger(addCommenterRetry);
    return;
  }
  var newEmail = {
    email: newRetry,
    attempt:  1,
    triggerid: undefined
  }
  if(addCommenterRetry) {
    newEmail.attempt = addCommenterRetry.attempt + 1;
    newEmail.triggerid = addCommenterRetry.triggerid;
  }
  if(!addCommenterRetry){ // If new
    var trigger = ScriptApp.newTrigger("addCommenterRetry")
      .timeBased()
      .everyMinutes(5) // Will run every five minutes until deleted
      .create();
    newEmail.triggerid = trigger.getUniqueId();
  }
  PropertiesService.getDocumentProperties().setProperty(newEmail.triggerid, JSON.stringify(newEmail));
  console.log("Attempt No " + newEmail.attempt + " for " + newEmail.email);
}

function addCommenterRetry(e) {
  var triggerid = e.triggerUid,
  emailObj = JSON.parse(PropertiesService.getDocumentProperties().getProperty(triggerid)),
  email = emailObj.email,
  attempt = emailObj.attempt;
  addNewEmail(undefined, email, "Retrying adding email for (" + attempt + ") times", emailObj);
}

function deleteTrigger(addCommenterRetry){
  // Loops through, finds the repeating trigger and deletes it
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) { 
    if (triggers[i].getUniqueId() === addCommenterRetry.triggerid){
      ScriptApp.deleteTrigger(triggers[i]);
      break;
    }
  }
  // Delete property from PropertiesService
  PropertiesService.getDocumentProperties().deleteProperty(addCommenterRetry.triggerid); 
  console.log("Deleted recurring trigger for " + addCommenterRetry.email + " and its properties successfully");
}