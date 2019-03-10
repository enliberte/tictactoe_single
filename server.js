query = require('querystring')
express = require('express');
const {Client} = require('pg');
app = express();
port = process.env.PORT || 8000;

app.listen(port, function () {
    console.log('App is running on port ' + port);
});

//отдача статики
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});