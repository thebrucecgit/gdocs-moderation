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
  information.viewers();
}

function buildTrigger(){
  var form = FormApp.openById('1gVDfUcLlldFGU7O5EDlq6NlIJUspm8CR0aGnrbVRtxI');
  ScriptApp.newTrigger('addNewEmail')
  .forForm(form)
  .onFormSubmit()
  .create();
}

function getSpreadSheetID(){
  var ID = PropertiesService.getScriptProperties().getProperty("SSID");
  if(ID) return ID;
  return "No spreadsheet is bounded";
}

function setSpreadSheetID(ID){
//  var ui = document.ui();
//  PropertiesService.getScriptProperties().setProperty("SSID", ID);
//  return "1ZIugQ5L8KSHIPHNEDYSUR-aI7XwPw2wNEezsrQeL1S4";
}
