var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.set('view engine','ejs');
app.set('views','views');
app.use(express.static('public'));
server.listen(3000, () => console.log('Server started'));

var mang = [];
var mangSocket = [];
app.get('/', (req,res) => res.render('home'));
io.on('connection', socket => {
  console.log('Co nguoi ket noi');
  socket.emit('DANH_SACH_ONLINE', mang)
  socket.on('DANG_KY', username => {
    if (mang.indexOf(username) == -1) {
      mang.push(username);
      mangSocket.push(socket);
      socket.username = username;
      socket.emit('KET_QUA',1);
      io.emit('NGUOI_DUNG_MOI', username);
    } else {
      socket.emit('KET_QUA',-1);
    }
  });
  socket.on('disconnect', () => {
    console.log(socket.username + ' ngat ket noi');
    mang.splice(mang.indexOf(socket.username),1);
    mangSocket.splice(mangSocket.indexOf(socket),1);
    socket.broadcast.emit('NGUOI_DUNG_NGAT_KET_NOI', socket.username);
  });
  socket.on('CLIENT_SEND_MESSAGE', data => {
    var {receiver,msg} = data;
    var receiverSocket = mangSocket[mangSocket.findIndex(e =>e.username==receiver)];
    receiverSocket.emit('RECEIVE_MESSAGE', `${socket.username}: ${msg}`);
  });
});
