/* 
This file and folloiwng code is only used for development and testing – not production!
*/
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
  var sheet = document.sheet("Added Emails"),
  range = sheet.getRange(1, 1, 1, 2).getValues()[0];
  range.forEach(function(cell, i){
    Logger.log(sheet.getColumnWidth(i + 1));
  })
}
function debugtwo(something){
  var mainSS = SpreadsheetApp.openById("13pHPaIMhuOE02dBbNvOEGuT-DsI6pGWqLjzwndxsnA8");
  var responsesSheet = mainSS.getSheetByName("Form Responses 1").setName("Responses"),
  modSheet = mainSS.getSheetByName("Form Responses 2").setName("Mod");
  setSheetHeader(responsesSheet, undefined, 
    [150, 235, 301, 58, 240]);
  setSheetHeader(modSheet, undefined,
    [150, 150, 194, 150, 150, 95]);
}
function debugthree(){
  // debugtwo();
  var properties = PropertiesService.getDocumentProperties().getProperties();
  for (var property in properties) {
    try {
      var prop = JSON.parse(properties[property]);
      if(typeof prop !== "string"){
        Logger.log(properties[property] + " is not string and was deleted");
        PropertiesService.getDocumentProperties().deleteProperty(properties[property].getUniqueId()); 
      }
    } catch(e) {
      Logger.log(properties[property] + " is a string");
    }
  }
}