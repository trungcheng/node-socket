'use strict';

var socket = io("http://localhost:3000");

socket.on("SERVER_RESPONSE_EXISTED_USER", function (data) {
    alert("This username already exists!");
});

socket.on("USERS_ONLINE_LIST", function (data) {
    $('#boxUser').html('');
    data.forEach(function (i) {
        $('#boxUser').append('<p class="user-item" data-socket-id="'+ i.socketId +'" style="cursor:pointer">'+ i.userName +'</p>');
    });
});

socket.on("SERVER_RESPONSE_REGISTER_SUCCESS", function (data) {
    $('#currentUser').html(data);
    $('#loginForm').hide(2000);
    $('#chatForm').show(1000);
});

socket.on("SERVER_RESPONSE_MESSAGE", function (data) {
    $('#listMessages').append("<p class='text-left'><span style='font-weight:bold'>" + data.username + "</span>: " + data.content + " (" + new Date().toLocaleString("en-US", { hour: "numeric",minute:"numeric", hour12: true }) + ")</p>");
});

socket.on("SERVER_RESPONSE_TYPING", function (data) {
    $('#typing').html("<i>" + data + "</i>");
});

socket.on("SERVER_RESPONSE_STOP_TYPING", function () {
    $('#typing').html("");
});

socket.on("CURRENT_ROOM_LIST", function (data) {
    $('#boxRoom').html("");
    data.map(function (room) {
        $('#boxRoom').append("<p style='cursor:pointer' class='roomItem'>" + room +"</p>");
        $('#new_room_modal').modal('hide');
    });
});

socket.on("SERVER_RESPONSE_ROOM_SOCKET", function (data) {
    $('#currentRoom').html("You are in <span style='color:red'>" + data + "</span> room");
});

socket.on("UPDATE_LOG", function (data) {
    $('#listMessages').append('<i class="log" style="display:block;opacity:0.6">- '+ data + ' (' + new Date().toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true }) + ')' +'</i>');
});

socket.on("SERVER_RESPONSE_USER_PRIVATE", function (data) {
    $('#currentRoom').html('You are chatting with <span style="color:red">' + data + '</span>');
});

$(function () {
    $('.log').delay(10000).fadeOut();
    $('#loginForm').show();
    $('#chatForm').hide();

    $('#btnRegister').click(function () {
        var username = $('#txtUsername').val();
        socket.emit("CLIENT_SEND_USERNAME", username);
    });

    $('#btnLogout').click(function () {
        socket.emit("USER_LOGOUT");
        $('#chatForm').hide(2000);
        $('#loginForm').show(1000);
    });

    $('#btnSendMessage').click(function () {
        var message = $('#txtMessage').val();
        socket.emit("SEND_MESSAGE", message);
        $('#txtMessage').val('');
    });

    $('#txtMessage').focusin(function () {
        socket.emit("IS_TYPING");
    });

    $('#txtMessage').focusout(function () {
        socket.emit("STOP_TYPING");
    });

    $('#btnAddNewRoom').click(function () {
        var room = $('#new_room_name').val();
        socket.emit("ADD_NEW_ROOM", room);
    });

    $(document).on('click', '.roomItem', function () {
        socket.emit('SWITCH_ROOM', $(this).text());
    });

    $(document).on('click', '.user-item', function () {
        socket.emit('SEND_PRIVATE', $(this).data('socket-id'), $(this).text());
    });
});