/* socket\room_chat\app.js */
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('chat');
});

var socketIds = [];
var cnt = 0;

/**
 * 문자열이 빈 문자열인지 체크하여 결과값을 리턴한다.
 * @param str       : 체크할 문자열
 */
function isEmpty(str){
  if(typeof str == "undefined" || str == null || str == "")
      return true;
  else
      return false ;
}

//var io = require('socket.io').listen(3100);
io.sockets.on('connection', (socket) => {
  //socketIds['GUEST-'+count]=socket.id;
  //count++;

  socket.on('disconnect', () => {
    console.log('user disconnected' +' socket.name:' +socket.name+" socket.id:"+socket.id);
    io.to(roomNameG).emit('userDisconnected', socket.name);
  });

  socket.on('setNameS', (name) => {
    //if (typeof name == "undefined" || name == null || name == ""){
    if (isEmpty(name)){
      socket.name = 'Guest' + cnt;
      cnt++;
      //io.to(socket.id).emit('setNameC', socket.name);
    } else {
      socket.name = name;
    }
    io.to(socket.id).emit('setNameC', socket.name);
    console.log('user setName ' + socket.name);
  });

  socket.on('setName', (name) => {
    socket.name = name;
    console.log('user setName ' + socket.name);
  });

  socket.on('leaveRoom2', (roomName, name) => {
    socket.leave(roomName, () => {
      console.log(name + ' leave a ' + roomName);
      io.to(roomName).emit('leaveRoom2', roomName, name);
    });
  });

  socket.on('joinRoom2', (roomName, name) => {
    socket.join(roomName, () => {
      console.log(name + ' join a ' + roomName);
      io.to(roomName).emit('joinRoom2', roomName, name);
    });
  });

  socket.on('chatMessage2', (roomName, name, msg) => {
    io.to(roomName).emit('chatMessage2', name, msg);
  });
});

http.listen(3000, () => {
  console.log('Connect at 3000');
});