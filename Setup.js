// For automatic creation of files and setting everything up

function setSheetHeader(sheet, data, widths){
  var datalength;
  data ? datalength = data.length : datalength = 6;
  var range = sheet.getRange(1, 1, 1, datalength)
    .setHorizontalAlignment("center")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
  if(data){
    range.setValues([data]);
  }
  if (widths){
    widths.forEach(function(width, i){
      sheet.setColumnWidth(i + 1, width);
    });
  }
}

function setupSystem(){
  var ui = document.ui();
  if(document.doc().getOwner().getEmail() !== Session.getActiveUser().getEmail()){
    ui.alert("Access Denied", "Only the Owner of the document can run the SETUP command", ui.ButtonSet.OK);
  }
  var res = ui.alert("Are you sure you want to setup?", "Only do this once", ui.ButtonSet.YES_NO);
  if (res !== ui.Button.YES) return;
  console.log("Setting up system...")
  var currentDoc = DocumentApp.getActiveDocument(),
  mainSS = SpreadsheetApp.create(currentDoc.getName() + " Moderation Spreadsheet", 200, 5);
  PropertiesService.getDocumentProperties().setProperty("SSID", mainSS.getId());

  // Firstly, create sheets not linked to forms and format them
  mainSS.getSheetByName("Sheet1").setName("Logs");
  setSheetHeader(mainSS.getSheetByName("Logs"), 
    ["Date/Time", "Message", "Type", "Reason", "User"], 
    [273, 344, 210, 155, 240]);
  var addedEmailsSheet = mainSS.insertSheet("Added Emails");
  setSheetHeader(addedEmailsSheet, ["Added Emails", "Permission"], [240, 100]);
  var mutedEmailsSheet = mainSS.insertSheet("Muted Emails");
  setSheetHeader(mutedEmailsSheet, 
    ["Time", "Muted", "Length (mins)", "Reason", "Mod"],
    [240, 196, 102, 183, 164]);
  var bannedEmailsSheet = mainSS.insertSheet("Banned Emails");
  setSheetHeader(bannedEmailsSheet, 
    ["Date", "Banned", "Emails", "Reason", "User"],
    [250, 250, 152, 183]);
  console.log("Successfully setup standalone sheets");

  // Form validations
  var emailValidation = FormApp.createTextValidation()
    .setHelpText("Your input must be an email")
    .requireTextIsEmail()
    .build();
  var discordUsernameValidation = FormApp.createTextValidation()
    .setHelpText("Make sure you have a '#' followed by the discriminator")
    .requireTextMatchesPattern(".+#\\d{4}")
    .build();
  var numberValidation = FormApp.createTextValidation()
    .setHelpText("Input needs to be a number")
    .requireNumber()
    .build();

  // Create Perm Request Form
  var newPermRequestForm = FormApp.create(currentDoc.getName() + " Permission Request Form")
    .setDescription("PLEASE USE A GOOGLE ACCOUNT FOR EMAIL SO WE CAN ACTUALLY GIVE YOU ACCESS")
    .setConfirmationMessage("You should be given suggesting permission within 1 minute automatically. Please provide some useful suggestions! System created by thebrucecemail@gmail.com. ")
    .setShowLinkToRespondAgain(false);
  PropertiesService.getDocumentProperties().setProperty("RFID", newPermRequestForm.getId());
  var googleMailItem = newPermRequestForm.addTextItem();
  googleMailItem.setTitle("Your Google Account Email")
    .setRequired(true);
  googleMailItem.setValidation(emailValidation);
  newPermRequestForm.addTextItem()
    .setTitle("Your Discord Username (Optional)")
    .setValidation(discordUsernameValidation);
  var agreementItem = newPermRequestForm.addCheckboxItem();
  agreementItem.setTitle("I agree to be sensible in my suggestions")
    .setChoices([
      agreementItem.createChoice("Yes")
    ])
    .setRequired(true);
  newPermRequestForm.setDestination(FormApp.DestinationType.SPREADSHEET, mainSS.getId());
  console.log("Successfully setup Permission Request Form");

  // Create Moderation Form
  var newModerationForm = FormApp.create(currentDoc.getName() + " Moderation Form")
    .setDescription("")
    .setConfirmationMessage("Your response is being processed");
  PropertiesService.getDocumentProperties().setProperty("MFID", newModerationForm.getId());
  newModerationForm.addTextItem()
    .setTitle("Your Email Address")
    .setRequired(true)
    .setValidation(emailValidation);
  newModerationForm.addTextItem()
    .setTitle("Email of the offender")
    .setRequired(true)
    .setValidation(emailValidation);
  var actionItem = newModerationForm.addMultipleChoiceItem()
    .setRequired(true);
  actionItem.setTitle("Action")
    .setChoices([
      actionItem.createChoice("Remove/Kick"),
      actionItem.createChoice("Ban"),
      actionItem.createChoice("Mute"),
      actionItem.createChoice("Warn")
    ])
  newModerationForm.addTextItem()
    .setTitle("Length of Mute in Minutes (if muting only)")
    .setValidation(numberValidation);
  var reasonItem = newModerationForm.addMultipleChoiceItem()
    .setTitle("Reason")
    .setRequired(true);
  reasonItem.setChoices([
    reasonItem.createChoice("Spamming Suggestions"),
    reasonItem.createChoice("NSFW Suggestions")
  ])
    .showOtherOption(true);
  newModerationForm.setDestination(FormApp.DestinationType.SPREADSHEET, mainSS.getId());
  console.log("Successfully setup Moderation Request Form");

  ScriptApp.newTrigger("formatFormSheets")
    .timeBased()
    .after(200)
    .create();
  console.log("Trigger (200ms) Created");
}

function formatFormSheets(){ 
  // Formatting the form sheets responses
  var SSID = PropertiesService.getDocumentProperties().getProperty("SSID"),
  renewedSS = SpreadsheetApp.openById(SSID),
  responsesSheet = renewedSS.getSheetByName("Form Responses 1").setName("Responses"),
  modSheet = renewedSS.getSheetByName("Form Responses 2").setName("Mod");
  setSheetHeader(responsesSheet, undefined, 
    [150, 235, 301, 58, 240]);
  setSheetHeader(modSheet, undefined,
    [150, 150, 194, 150, 150, 95]);
  buildTriggers(false);
  console.log("Successfully installed G Moderation system");
  document.log("Successfully installed G Moderation system", "Install", "");
}