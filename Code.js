var formResponse = "Responses", modSheet = "Mod", addedSheet = "Added Emails", bannedSheet = "Banned Emails", mutedSheet = "Muted Emails", logSheet = "Logs";

function getArrayFromValue(retrievedData){
  var output = [];
  retrievedData.forEach(function(data){
    if (!data[0]) return;
    output.push(data[0]);
  });
  return output;
}

function modHandler(){
  var modRequest = document.sheet(modSheet),
  request = modRequest.getRange(modRequest.getLastRow(), 2, 1, 5).getValues()[0],
  user = request[0], offender = request[1], action = request[2], reason = request[3], time = request[4];
  switch(action) {
    case "Remove/Kick": 
    removeEmail(offender, reason, user, false);
      break;
    case "Ban":
    banEmail(offender, reason, user);
      break;
    case "Mute":
    muteEmail(offender, time, reason, user);
      break;
    case "Warn":
    warnEmail(offender, reason, user);
      break;
  }
}

function addNewEmail(triggerObj, toBeAddedEmail, reason){
  var bannedEmailsSheet = document.sheet(bannedSheet),
  bannedEmailsArray = getArrayFromValue(bannedEmailsSheet.getRange(2, 2, bannedEmailsSheet.getLastRow()).getValues()),
  mutedEmailsSheet = document.sheet(mutedSheet),
  mutedEmailsArray = getArrayFromValue(mutedEmailsSheet.getRange(2,2, mutedEmailsSheet.getLastRow()).getValues()),
  alreadyAddedEmailsSheet = document.sheet(addedSheet),
  alreadyAddedEmails = alreadyAddedEmailsSheet.getRange(2, 1, alreadyAddedEmailsSheet.getLastRow()).getValues(),
  alreadyAddedEmailsArray = getArrayFromValue(alreadyAddedEmails);
    
  var lastRow = document.sheet(formResponse).getLastRow();
  var emailArr = document.sheet(formResponse).getRange(lastRow, 2).getValues();
  var email = toBeAddedEmail || emailArr[0][0];
  
  if (bannedEmailsArray.indexOf(email) >= 0){ // If user is banned
    document.log("Banned User tried to access: " + email, "BANNED_ATTEMPT", "auto", "GAS");
    return;
  }
  if (mutedEmailsArray.indexOf(email) >= 0) { // If user is muted
    document.log("Muted User tried to access: " + email, "MUTED_ATTEMPT", "auto", "GAS");
    return; 
  }
  if (alreadyAddedEmailsArray.indexOf(email) >= 0) return; // If user already has access
  document.addCommenters([email]);
  alreadyAddedEmailsSheet.appendRow([email]);
  if(reason === "unmute") return;
  document.log("New Commenter Added: " + email, "ADD_COMMENTER", reason || "auto", "GAS");  
}

function removeEmail(toBeRemovedEmail, reason, user, ban){
  var emailSheet = document.sheet(formResponse),
  alreadyAddedEmailsSheet = document.sheet(addedSheet);
  
  // Remove email from Doc
  document.removeCommenter(toBeRemovedEmail); 
  
  //Remove email from Added Emails
  var addedEmails = alreadyAddedEmailsSheet.getRange(2, 1, alreadyAddedEmailsSheet.getLastRow()).getValues();
  var addedEmailsArray = getArrayFromValue(addedEmails);
  
  if(addedEmailsArray.indexOf(toBeRemovedEmail) !== -1){
    alreadyAddedEmailsSheet.deleteRow(addedEmailsArray.indexOf(toBeRemovedEmail) + 2)
  } else {
    console.error("Email not found in alreadyAddedEmailsSheet");
  }
  
  if(!ban && reason !== "mute") {
    sendMail("removal", reason, toBeRemovedEmail);
  }
  if(reason !== "mute") {
    document.log("Email removed: " + toBeRemovedEmail, "REMOVE_COMMENTER", reason, user);
  }
}

function banEmail(toBeBannedEmail, reason, user){
  var emailSheet = document.sheet(formResponse),
  bannedEmailsSheet = document.sheet(bannedSheet);
  
  removeEmail(toBeBannedEmail, reason, undefined, true);
  bannedEmailsSheet.appendRow([new Date().toLocaleString('en-GB',{timeZone: 'UTC'}), toBeBannedEmail, reason, user]);
  
  sendMail("ban", reason, toBeBannedEmail);
  document.log("Email banned: " + toBeBannedEmail, "BANNED_COMMENTER", reason, user);
}

function muteEmail(toBeMutedEmail, minutes, reason, user){
  ScriptApp.newTrigger("unmuteEmail")
  .timeBased()
  .after(parseInt(minutes) * 60 * 1000)
  .create();
  removeEmail(toBeMutedEmail, "mute", user);
  
  document.sheet(mutedSheet).appendRow([new Date().toLocaleString('en-GB',{timeZone: 'UTC'}), toBeMutedEmail, minutes, reason, user]);
  sendMail("mute", reason, toBeMutedEmail, minutes);
  document.log("Email muted: " + toBeMutedEmail, "MUTED_COMMENTER", reason, user);
}

function unmuteEmail(){
  var mutedEmails = document.sheet(mutedSheet).getRange(2,2,document.sheet(mutedSheet).getLastRow()).getValues();
  var mutedEmailsArray = getArrayFromValue(mutedEmails);

  var sortedMutedEmailsArray = mutedEmailsArray.sort(function(a, b) {return a - b});
  var toBeUnmutedEmail = sortedMutedEmailsArray[0];
  document.sheet(mutedSheet).deleteRow(mutedEmailsArray.indexOf(toBeUnmutedEmail) + 2);
  
  addNewEmail(undefined, toBeUnmutedEmail, "unmute");
  document.log("Email unmuted: " + toBeUnmutedEmail, "UNMUTED_COMMENTER", "timesup", "GAS");
}

function warnEmail(toBeWarnedEmail, reason, user){
  sendMail("warning", reason, toBeWarnedEmail);
  document.log("Email warned: " + toBeWarnedEmail, "WARNED_COMMENTER", reason, user);
}