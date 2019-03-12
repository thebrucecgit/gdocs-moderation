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
  addNewEmail(undefined, "testing123123@teuasd.com", "testing");
}
function debugtwo(something){
  var obj = {
    attempt: something || 1
  }
  Logger.log(JSON.stringify(obj));
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