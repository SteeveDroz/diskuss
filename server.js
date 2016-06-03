var port = 8081;

var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res) {
    res.send('Hello, World!');
});

http.listen(port, function() {
   console.log('Server started on port ' + port); 
});