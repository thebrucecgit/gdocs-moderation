var formResponse = "Responses", modSheet = "Mod", addedSheet = "Added Emails", bannedSheet = "Banned Emails", mutedSheet = "Muted Emails", logSheet = "Logs";

function getArrayFromValue(retrievedData){
  var output = [];
  retrievedData.forEach(function(data){
    if (!data[0]) return;
    output.push(data[0]);
  });
  return output;
}

// Menu & Sidebar
function onOpen() {
  document.ui().createMenu('Docs Mod')
    .addItem('Settings', 'showSettings')
    .addItem("User Details", "showUserDetails")
    .addToUi();
}

function modHandler(e){
  var responses = e.response.getItemResponses();
  var moderator = responses[0].getResponse(), offender = responses[1].getResponse(), reason = responses[4].getResponse(), time = responses[3].getResponse();
  switch(responses[2].getResponse()) { // responses[2] is the action to be taken
    case "Remove/Kick": 
    removeEmail(offender, reason, moderator, false);
      break;
    case "Ban":
    banEmail(offender, reason, moderator);
      break;
    case "Mute":
    muteEmail(offender, time, reason, moderator);
      break;
    case "Warn":
    warnEmail(offender, reason, moderator);
      break;
  }
}

function addNewEmail(e, toBeAddedEmail, reason){
  var email = toBeAddedEmail;
  if(e) email = e.response.getItemResponses()[0].getResponse();
  bannedEmailsSheet = document.sheet(bannedSheet),
  bannedEmailsArray = getArrayFromValue(bannedEmailsSheet.getRange(2, 2, bannedEmailsSheet.getLastRow()).getValues()),
  mutedEmailsSheet = document.sheet(mutedSheet),
  mutedEmailsArray = getArrayFromValue(mutedEmailsSheet.getRange(2,2, mutedEmailsSheet.getLastRow()).getValues()),
  alreadyAddedEmailsSheet = document.sheet(addedSheet),
  alreadyAddedEmails = alreadyAddedEmailsSheet.getRange(2, 1, alreadyAddedEmailsSheet.getLastRow()).getValues(),
  alreadyAddedEmailsArray = getArrayFromValue(alreadyAddedEmails);
 
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
  document.log(email, "ADD_COMMENTER", reason || "auto", "GAS");  
}

function removeEmail(toBeRemovedEmail, reason, user, ban){
  var alreadyAddedEmailsSheet = document.sheet(addedSheet);
  
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
    document.log(toBeRemovedEmail, "REMOVE_COMMENTER", reason, user);
  }
}

function banEmail(toBeBannedEmail, reason, user){
  var bannedEmailsSheet = document.sheet(bannedSheet);
  
  removeEmail(toBeBannedEmail, reason, undefined, true);
  bannedEmailsSheet.appendRow([new Date().toLocaleString('en-GB',{timeZone: 'UTC'}), toBeBannedEmail, reason, user]);
  
  sendMail("ban", reason, toBeBannedEmail);
  document.log(toBeBannedEmail, "BANNED_COMMENTER", reason, user);
}

function muteEmail(toBeMutedEmail, minutes, reason, user){
  ScriptApp.newTrigger("unmuteEmail")
  .timeBased()
  .after(parseInt(minutes) * 60 * 1000)
  .create();
  removeEmail(toBeMutedEmail, "mute", user);
  
  document.sheet(mutedSheet).appendRow([new Date().toLocaleString('en-GB',{timeZone: 'UTC'}), toBeMutedEmail, minutes, reason, user]);
  sendMail("mute", reason, toBeMutedEmail, minutes);
  document.log(toBeMutedEmail, "MUTED_COMMENTER", reason, user);
}

function unmuteEmail(){
  var mutedEmails = document.sheet(mutedSheet).getRange(2,2,document.sheet(mutedSheet).getLastRow()).getValues();
  var mutedEmailsArray = getArrayFromValue(mutedEmails);

  var sortedMutedEmailsArray = mutedEmailsArray.sort(function(a, b) {return a - b});
  var toBeUnmutedEmail = sortedMutedEmailsArray[0];
  document.sheet(mutedSheet).deleteRow(mutedEmailsArray.indexOf(toBeUnmutedEmail) + 2);
  
  addNewEmail(undefined, toBeUnmutedEmail, "unmute");
  document.log(toBeUnmutedEmail, "UNMUTED_COMMENTER", "timesup", "GAS");
}

function warnEmail(toBeWarnedEmail, reason, user){
  sendMail("warning", reason, toBeWarnedEmail);
  document.log(toBeWarnedEmail, "WARNED_COMMENTER", reason, user);
}

function userDetails(userEmail){
  var details = {
    currentAccess: true,
    firstJoin: "",
    discordUsername: "",
    notes: "",
    history: []
  }
  var alreadyAddedEmailsSheet = document.sheet(addedSheet);
  var addedEmails = alreadyAddedEmailsSheet.getRange(2, 1, alreadyAddedEmailsSheet.getLastRow()).getValues();
  if (getArrayFromValue(addedEmails).indexOf(userEmail) === -1) details.currentAccess = false;  
  var logsSheet = document.sheet(logSheet),
  allLogs = logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 5).getValues();
  allLogs.forEach(function(log){
    if(log[1] === userEmail) details.history.push(log);
  });
  if(details.history.length > 0 && details.history.slice(-1)[0][2] == "ADD_COMMENTER"){
    details.firstJoin = details.history.slice(-1)[0][0];
  } else {
    details.firstJoin = "UNKNOWN – sometime before February 8th";
  }
  var rs = document.sheet(formResponse)
  var rsValues = rs.getRange(2, 2, rs.getLastRow(), 5).getValues();
  rsValues.forEach(function(value){
    if(value[0] === userEmail){
      value[1] !== "" ? details.discordUsername = value[1] : details.discordUsername = "NONE";
      value[4] !== "" ? details.notes = value[4] : details.notes = "NONE";
    }
  });
  return details;
}