function sendMail(messageType, reason, toBeMailedEmail, lengthOfMute){
  var docLink = "https://docs.google.com/document/d/1Z2n6Y8NJW6hk7Ql81qD0BUk1P41b-vz4A-U8U1cC2FI/";
  var types = {
    removal: "You have been <strong>kicked/removed</strong> for <strong>" + reason + "</strong> from suggesting in <a href='"+ docLink +"'>&quot;The Wilbur ARG&quot;</a> google document. Please discontinue this action or you may be muted or banned.",
    ban: "You have been <strong>banned</strong> from suggesting in <a href='"+ docLink +"'>&quot;The Wilbur ARG&quot;</a> google document for <strong>" + reason + "</strong>",
    mute: "You have been <strong>muted</strong> for <strong>" + reason + "</strong> for " + lengthOfMute + " minutes from suggesting in <a href='"+ docLink +"'>&quot;The Wilbur ARG&quot;</a> google document. Please discontinue this action or you may be muted again or banned.",
    warning: "You have been <strong>warned</strong> for <strong>" + reason + "</strong> in <a href='"+ docLink +"'>&quot;The Wilbur ARG&quot;</a> google document. Please discontinue this action or you may be muted or banned."  
  }
  
  var emailTemplate = HtmlService.createTemplateFromFile("partials/mail")
  emailTemplate.messageType = messageType;
  emailTemplate.mainMessage = types[messageType];
  var email = emailTemplate.evaluate().getContent();
  
  MailApp.sendEmail({
    to: toBeMailedEmail,
    subject: messageType.toUpperCase() + " regarding the Wilbur ARG Google Document",
    htmlBody: email
  });
}