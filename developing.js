var information = {
  array: function (arr){
    var newArr = [];
    arr.forEach(function(user){
      newArr.push(user.getEmail());
    })
    return newArr.join("\n");
  },
  editors: function (){
    var arr = document.doc().getEditors();
    Logger.log(information.array(arr));
  },
  viewers: function (){
    var arr = document.doc().getViewers();
    Logger.log(information.array(arr));
  }
}

function debug(){
}

function buildTriggers(){
  var MFID = getProperty("MFID"),
  RFID = getProperty("RFID");
  var ui = document.ui();
  if (MFID === "ID not found" || RFID === "ID not found") {
    ui.alert("There are missing IDs", ui.ButtonSet.OK);
    return;
  }
  var currentTriggers = ScriptApp.getProjectTriggers();
  currentTriggers.forEach(function(trigger){
    ScriptApp.deleteTrigger(trigger);
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
  return "ID not found";
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