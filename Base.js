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

function getArrayFromValue(retrievedData){
  var output = [];
  retrievedData.forEach(function(data){
    if (!data[0]) return;
    output.push(data[0]);
  });
  return output;
}

function isMod(mod){
  var alreadyAddedSheet = document.sheet(addedSheet);
  var values = alreadyAddedSheet.getRange(2, 1, alreadyAddedSheet.getLastRow()-1, 2).getValues();
  var mods = [];
  values.forEach(function(value){
    if(value[1] === "Mod") mods.push(value[0]);
  });
  if(mods.indexOf(mod || Session.getActiveUser().getEmail()) !== -1) return true;
  return false;
}

function isSetup() {
  var ids = ["SSID", "MFID", "RFID", "DocName"];
  ids.forEach(function(id){
    if(!PropertiesService.getDocumentProperties().getProperty(id)) return false;
  })
  return true;
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

function ui(func){
  var ui = document.ui();
  switch(func) {
    case "isMod":
      if(!isMod()) {
        ui.alert("You do not have permissions to see this", ui.ButtonSet.OK);
        return false;
      }
      return true;
    case "isSetup":
      if(!isSetup()) {
        ui.alert("Setup is incomplete, please go to Settings", ui.ButtonSet.OK);
        return false;
      }
      return true;
  }
}

function buildTriggers(){
  var ui = document.ui();
  if (!getProperty(MFID) || !getProperty(RFID)) {
    ui.alert("There are missing IDs", ui.ButtonSet.OK);
    return;
  }
  var currentTriggers = ScriptApp.getProjectTriggers();
  currentTriggers.forEach(function(trigger){
    if(trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  var requestForm = FormApp.openById(RFID);
  ScriptApp.newTrigger('addNewEmail')
  .forForm(requestForm)
  .onFormSubmit()
  .create();
  var modForm = FormApp.openById(MFID);
  ScriptApp.newTrigger('modHandler')
  .forForm(modForm)
  .onFormSubmit()
  .create();
  ui.alert("Triggers have been installed/reinstalled", ui.ButtonSet.OK);
}
// SSID, RFID, MFID, DocName
function getProperty(propertyType){
  var ID = PropertiesService.getDocumentProperties().getProperty(propertyType);
  if(ID) return ID;
  return false;
}

function setProperty(propertyType, ID){
  var ui = document.ui();
  PropertiesService.getDocumentProperties().setProperty(propertyType, ID);
  ui.alert(propertyType+" was bounded to the document", ui.ButtonSet.OK);
}

function getAllIds(){
  var IDTYPES = ["SSID", "RFID", "MFID"];
  var ids = [];
  IDTYPES.forEach(function(id){
    ids.push(getProperty(id));
  })
  return ids;
}