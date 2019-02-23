var inlineCss = require('inline-css');
var fs = require("fs");
var message = "";
var options = {
    preserveMediaQueries: true,
    url: " "
}
fs.readFile(__dirname + '/src/mail.html', 'utf8', function(err, html){
    if (err) {
        throw err; 
    };
    inlineCss(html, options)
        .then(output => {
            fs.writeFile('partials/mail.html', output, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        });
});