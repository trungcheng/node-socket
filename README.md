*Basic Documentation

```
// Connection (init)
io.on('connection', function (socket) {
	// do something
});

// Disconnect
socket.on('disconnect', function () {
	// do something
});

// Send to the sender
socket.emit('hello', msg);

// Send to all clients
io.sockets.emit('hello', msg);

// Send to all clients except sender
socket.broadcast.emit('hello', msg);

// Listen event
socket.on('hello', function () {
	// do something
});

// Join to room
socket.join(room);

// Leave a room
socket.leave(room);

// Send to everyone including the sender(if the sender is in the room) in the room "my room"
io.to('my room').emit('hello', msg);
io.sockets.in('my room').emit('hello', msg);

// Send to everyone except the sender(if the sender is in the room) in the room "my room"
socket.broadcast.to('my room').emit('hello', msg);

// Send to everyone in every room, including the sender
io.emit('hello', msg); // short version
io.sockets.emit('hello', msg);

// Send to specific socket only (private chat)
socket.broadcast.to(otherSocket.id).emit('hello', msg);
io.sockets.in(otherSocket.id).emit('hello', msg);
```