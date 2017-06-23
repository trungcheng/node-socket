var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log('Có người kết nối: ', socket.id);

    socket.on("CLIENT_SEND_COLOR", function (data) {
        console.log(data);
        io.sockets.emit("SERVER_RESPONSE_COLOR", data);
    });

    socket.on('disconnect', function () {
        console.log(socket.id + ' vừa ngắt kết nối');
    });
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', function(req, res) {
    res.render('home');
});

server.listen(3000, function () {
    console.log('Server started');
});