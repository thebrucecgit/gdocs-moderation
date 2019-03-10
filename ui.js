// Not used
// function showSidebar() {
// var html = HtmlService.createHtmlOutputFromFile("Page")
//     .setTitle('Document Moderation')
//     .setWidth(300);
// document.ui().showSidebar(html);
// }

function showSettings(){
    var html = HtmlService.createTemplateFromFile("Setting")
        .evaluate()
        .setTitle("Settings")
    document.ui().showSidebar(html);
}

function showUserDetails(){
    if(!ui("isSetup") || !ui("isMod")) return false; // Check if it is setup correctly and if user has authorization
    var html = HtmlService.createTemplateFromFile("userDetails")
        .evaluate()
        .setTitle("User Details")
    document.ui().showSidebar(html);
}

function adminConsole(){
    if(!ui("isSetup")) return false;
    var html = HtmlService.createTemplateFromFile("adminConsole")
        .evaluate()
        .setTitle("Admin Console");
    document.ui().showSidebar(html);
}

function doGet(){
    return HtmlService.createHtmlOutputFromFile("Setting");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}