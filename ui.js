// Not used
// function showSidebar() {
// var html = HtmlService.createHtmlOutputFromFile("Page")
//     .setTitle('Document Moderation')
//     .setWidth(300);
// document.ui().showSidebar(html);
// }

function showSettings(){
    var html = HtmlService.createHtmlOutputFromFile("Setting")
        .setTitle("Settings")
        .setWidth(300);
    document.ui().showSidebar(html);
}

function showUserDetails(){
    var html = HtmlService.createHtmlOutputFromFile("userDetails")
        .setTitle("User Details")
        .setWidth(530);
    document.ui().showSidebar(html);
}
function doGet(){
    return HtmlService.createHtmlOutputFromFile("Setting");
}