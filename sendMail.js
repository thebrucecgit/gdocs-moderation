function sendMail(messageType, reason, toBeMailedEmail, lengthOfMute){
  var types = {
    removal: "<p>You have been <strong>kicked/removed</strong> for <strong>" + reason + "</strong> from suggesting in <a href='https://docs.google.com/document/d/1Z2n6Y8NJW6hk7Ql81qD0BUk1P41b-vz4A-U8U1cC2FI/'>&quotThe Wilbur ARG&quot</a> google document. Please discontinue this action or you may be muted or banned.</p>",
    ban: "<p>You have been <strong>banned</strong> from suggesting in <a href='https://docs.google.com/document/d/1Z2n6Y8NJW6hk7Ql81qD0BUk1P41b-vz4A-U8U1cC2FI/'>&quotThe Wilbur ARG&quot</a> google document for <strong>" + reason + "</strong></p>",
    mute: "<p>You have been <strong>muted</strong> for <strong>" + reason + "</strong> for " + lengthOfMute + " minutes from suggesting in <a href='https://docs.google.com/document/d/1Z2n6Y8NJW6hk7Ql81qD0BUk1P41b-vz4A-U8U1cC2FI/'>&quotThe Wilbur ARG&quot</a> google document. Please discontinue this action or you may be muted again or banned.</p>",
    warning: "<p>You have been <strong>warned</strong> for <strong>" + reason + "</strong> in <a href='https://docs.google.com/document/d/1Z2n6Y8NJW6hk7Ql81qD0BUk1P41b-vz4A-U8U1cC2FI/'>&quotThe Wilbur ARG&quot</a> google document. Please discontinue this action or you may be muted or banned.</p>"  
  }
  
  var text = "<h1 style='font-family:sans-serif;font-size:90px;background-color:#c00;text-align:center;padding:40px 0;margin:0 0 20px'>" + messageType.toUpperCase() + "</h1>"
  + "<div style='font-family:sans-serif;font-size:1.4em;width:60%;margin:0 auto;'>"
  + types[messageType]
  + "<p>The Wilbur ARG is meant to be exciting, bringing together people from all over the world to form an awesome community and for everyone to have fun.</p>"
  + "<br>"
  + "<p>Kind Regards,</p>"
  + "<p>Wilbur ARG Document Moderators</p>"
  + "<br>"
  + "<p style='color:#727272'>To appeal this decision, you can reply to this email or message any users with the role 'Document Editor' in the <a href='https://discord.gg/vhdk6yy'>Wilbur ARG</a> discord server</p>"
  + "</div>"
  
  MailApp.sendEmail({
    to: toBeMailedEmail,
    subject: messageType.toUpperCase() + " regarding the Wilbur ARG Google Document",
    htmlBody: text
  });
}