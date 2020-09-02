/* socket\room_chat\app.js */
const app = require('express')();
const fs = require('fs');
const options = {
  key: fs.readFileSync('./openssl/file.pem'),
  cert: fs.readFileSync('./openssl/file.crt'),
  // key: fs.readFileSync('/etc/letsencrypt/live/ws.danchu.co.kr/privkey.pem'),
  // cert: fs.readFileSync('/etc/letsencrypt/live/ws.danchu.co.kr/cert.pem'),
  // ca: fs.readFileSync('/etc/letsencrypt/live/ws.danchu.co.kr/chain.pem'),
  secure:true,
  reconnect: true,
  rejectUnauthorized : false
};
const https = require('https').createServer(options, app)
//const http = require('http').createServer(options, app)
const io = require('socket.io')(https);

/* socket\room_chat\app.js */
// const mongoose = require('mongoose');
// const app = require('express')();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('chat');
});

let socketArr = [];
let roomArr = [];
var cnt = 0;

/**
 * 문자열이 빈 문자열인지 체크하여 결과값을 리턴한다.
 * @param str       : 체크할 문자열
 */
function isEmpty(str){
      
  if(typeof str == "undefined" || str == null || str == "")
      return true;
  else
      return false;
}

io.sockets.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('user disconnected' +' socket.name:' +socket.name+" socket.id:"+socket.id);
    io.emit('userDisconnected', socket.name);
    //소켓 삭제
    for (let index = 0; index < socketArr.length; index++) {
      if (socketArr[index].id==socket.id) {
        socketArr.splice (index,1);
      }
    }
    for (let index = 0; index < socketArr.length; index++) {
      console.log("socketArr:" + JSON.stringify(socketArr[index]));
    }
    console.log('--------------');
    //방에서 삭제
    for (let index = 0; index < roomArr.length; index++) {
      //방안에서 맴버 삭제
      roomArr[index].members.delete(socket.name)
      if (roomArr[index].members.size === 0) {
        roomArr.splice(index,1);
      }
    }

    for (let index = 0; index < roomArr.length; index++) {
      //console.log("del roomArr:" + JSON.stringify([...roomArr[index].members]));
      console.log("Del roomArr id:"+roomArr[index].id +" members:" + JSON.stringify([...roomArr[index].members]));
    }
    console.log('--------------');
  });

  socket.on('setNameS', (msgJson) => {
    if (isEmpty(msgJson.name)){
      socket.name = 'Guest' + cnt;
      cnt++;
      //io.to(socket.id).emit('setNameC', socket.name);
    } else {
      socket.name = msgJson.name;
      socket.uuid = msgJson.id;
    }
    io.to(socket.id).emit('setNameC', {"name":socket.name,"id":socket.uuid});
    if (socketArr.length > 0) {
      let socketJson;
      let pushFlag = true;
      for (let index = 0; index < socketArr.length; index++) {
        if (socketArr[index].name == msgJson.name) {
          socketJson = {"id":socket.id,"name":socket.name};
          socketArr[index].id = socket.id;
          pushFlag = false;
        }
      }
      if (pushFlag) {
        socketArr.push({"id":socket.id,"name":socket.name});
      }
    } else {
      //무조건 넣는다
      socketArr.push({"id":socket.id,"name":socket.name});
    }
    
    for (let index = 0; index < socketArr.length; index++) {
      console.log("socketArr:" + JSON.stringify(socketArr[index]));
    }
    console.log('--------------');
  });

  socket.on('leaveRoom2', (roomName, name) => {
    socket.leave(roomName, () => {
      console.log(name + ' leave a ' + roomName);
      io.to(roomName).emit('leaveRoom2', roomName, name);
    });
  });

  socket.on('joinRoom2', (msgJson/*roomName, name*/) => {
    socket.join(msgJson.roomName, () => {
      console.log(msgJson.name + ' join a ' + msgJson.roomName);
      io.to(msgJson.roomName).emit('joinRoom2',{"roomName":msgJson.roomName,"name":msgJson.name});
      if (roomArr.length > 0) {
        //roomArr id 검색 member 찾아서 맴버를  set으로 가져오고 이름 삽입
        let pushFlag = true;
        for (let index = 0; index < roomArr.length; index++) {
          if (roomArr[index].id == msgJson.roomName) {
            let memberSet = new Set(roomArr[index].members);
            memberSet.add(msgJson.name);
            roomArr[index] = {"id":msgJson.roomName,"members":memberSet};
            //roomArr.push(JSON.stringify(roomJson));
            pushFlag = false;
          } 
        }
        if (pushFlag) {
          roomArr.push({"id":msgJson.roomName,"members":new Set([msgJson.name])});
        }
      } else {
        roomArr.push({"id":msgJson.roomName,"members":new Set([msgJson.name])});
      }
      //console.log('roomArr:' + roomArr);
      
      for (let index = 0; index < roomArr.length; index++) {
        console.log("Add roomArr id:"+roomArr[index].id +" members:" + JSON.stringify([...roomArr[index].members]));
      }
      console.log('--------------');
    });
  });

  socket.on('chatMessage2', (msgJson/*roomName, name, msg*/) => {
    io.to(msgJson.roomName).emit('chatMessage2',{"id":msgJson.id, "name":msgJson.name, "msg":msgJson.msg} )
    //console.log('socketIds:' + socketIds);
  });

  socket.on('chatMessageWhisper', (roomName, name, msg) => {
    io.to(roomName).emit('chatMessage2', name, msg);
    io.sockets.sockets.map(function(e) {
      let out = '';
      if (name === e.username) {
        //e.socket.id;
        out = e.id;
      }
      return out;
    });
  });
});

https.listen(3000, () => {
  console.log('Connect at 3000');
});