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
  var requestForm = FormApp.openById(getProperty("RFID"));
  ScriptApp.newTrigger('addNewEmail')
  .forForm(requestForm)
  .onFormSubmit()
  .create();
  var modForm = FormApp.openById(getProperty("MFID"));
  ScriptApp.newTrigger('modHandler')
  .forForm(modForm)
  .onFormSubmit()
  .create();
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