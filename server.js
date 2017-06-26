var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var arrayUsers = [];
var arrayUserOnline = [];
var arrayRooms = ['GENERAL', 'REACT_REDUX', 'NODEJS'];

io.on('connection', function (socket) {
    console.log('Có người kết nối: ', socket.id);

    socket.emit("SOCKET_ID", socket.id);

    socket.on("CLIENT_SEND_USERNAME", function (userName) {
        if (arrayUserOnline.indexOf(userName) >= 0) {
            socket.emit("SERVER_RESPONSE_EXISTED_USER");
        } else {
            arrayUsers.push({
                socketId : socket.id,
                userName : userName
            });
            arrayUserOnline.push(userName);
            socket.username = userName;
            socket.room = 'GENERAL';
            socket.join('GENERAL');
            // send to yourself message
            socket.emit("SERVER_RESPONSE_REGISTER_SUCCESS", userName);
            // send to all others notify without yourself
            socket.broadcast.emit('UPDATE_LOG', data.userName + ' has connected to this room');
            // emit to all users online list without yourself
            io.sockets.emit("USERS_ONLINE_LIST", arrayUsers);
            // emit all rooms available to all users
            io.sockets.emit("CURRENT_ROOM_LIST", arrayRooms);
        }
    });

    socket.on("USER_LOGOUT", function () {
        arrayUsers.splice(arrayUsers.indexOf(socket.username), 1);
        // emit to all users without yourself
        socket.broadcast.emit("USERS_ONLINE_LIST", arrayUsers);
    });

    socket.on("SEND_MESSAGE", function (data) {
        // emit to specify users
        if (socket.clientId) {
            io.sockets.in(socket.clientId).emit("SERVER_RESPONSE_MESSAGE", {
                username: socket.username,
                content: data
            });
        } else {
            io.sockets.in(socket.room).emit("SERVER_RESPONSE_MESSAGE", {
                username: socket.username,
                content: data
            });
        }
    });

    socket.on("IS_TYPING", function () {
        var typing = socket.username + " is typing...";
        if (socket.clientId) {
            socket.broadcast.to(socket.clientId).emit("SERVER_RESPONSE_TYPING", typing);
        } else {
            socket.broadcast.to(socket.room).emit("SERVER_RESPONSE_TYPING", typing);
        }
    });

    socket.on("STOP_TYPING", function () {
        io.sockets.emit("SERVER_RESPONSE_STOP_TYPING");
    });

    socket.on("ADD_NEW_ROOM", function (newRoom) {
        // View rooms list
        socket.join(newRoom);
        // console.log(socket.adapter.rooms);
        socket.room = newRoom;
        for (r in socket.adapter.rooms) {
            arrayRooms.push(r);
        }
        io.sockets.emit("CURRENT_ROOM_LIST", arrayRooms);
        socket.emit("SERVER_RESPONSE_ROOM_SOCKET", newRoom);
    });

    socket.on('SWITCH_ROOM', function(switchRoom) {
        // leave the clientId
        socket.leave(socket.clientId);
        // leave the current room (stored in session)
        socket.leave(socket.room);
        // join new room, received as function parameter
        socket.join(switchRoom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('UPDATE_LOG', socket.username+' has left this room');
        // update socket session room title
        socket.room = switchRoom;
        socket.broadcast.to(switchRoom).emit('UPDATE_LOG', socket.username+' has joined this room');
        socket.emit("SERVER_RESPONSE_ROOM_SOCKET", switchRoom);
    });

    socket.on('SEND_PRIVATE', function (socketId, userName) {
        // leave the clientId
        socket.leave(socket.clientId);
        // leave the current room (stored in session)
        socket.leave(socket.room);
        socket.clientId = socketId;
        socket.emit("SERVER_RESPONSE_USER_PRIVATE", userName);
    });

    socket.on('disconnect', function () {
        console.log(socket.id + ' vừa ngắt kết nối');
        // remove the username from global usernames list
        arrayUsers.splice(arrayUsers.indexOf(socket.username), 1);
        // emit to all users without yourself
        socket.broadcast.emit("USERS_ONLINE_LIST", arrayUsers);
        socket.leave(socket.room);
    });
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', function(req, res) {
    res.render('home');
});

var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log('Express server is running at http://localhost:' + port);
});