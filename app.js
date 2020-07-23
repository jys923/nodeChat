/* socket\room_chat\app.js */
const mongoose = require('mongoose');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('chat');
});

//let socketIds = [];
//let socketArr = new Array();
let socketArr = [];
let socketMap = new Map();
//let roomArr = new Array();
let roomArr = [];
//let roomArr = [{"test":"test"},{"test2":"test2"}];
var cnt = 0;
let roomNameG = '';

function mongooseInit(mongoose) {
  // 2. testDB 세팅
  //mongoose.connect('mongodb://localhost:27017/testDB');
  mongoose.connect('mongodb://root:changeme@127.0.0.1:27017/testDB?authSource=admin', {useNewUrlParser: true});
  // 3. 연결된 testDB 사용
  var db = mongoose.connection;
  // 4. 연결 실패
  db.on('error', function(){
      console.log('Connection Failed!');
      return false;
  });
  // 5. 연결 성공
  db.once('open', function() {
      console.log('Connected!');
      return true;
  });
}
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

/*
mongooseInit(mongoose);

// 6. Schema 생성. (혹시 스키마에 대한 개념이 없다면, 입력될 데이터의 타입이 정의된 DB 설계도 라고 생각하면 됩니다.)
var chatMsg = mongoose.Schema({
  roomID : 'string',
  ID : 'string',
  msg : 'string',
  time : { type: Date, default: Date.now }
});

// 7. 정의된 스키마를 객체처럼 사용할 수 있도록 model() 함수로 컴파일
var chatMsgM = mongoose.model('Schema', chatMsg);

// 8. Student 객체를 new 로 생성해서 값을 입력
var newChatMsgM = new chatMsgM({roomID:'test', ID:'node', msg:'from server'});

// 9. 데이터 저장
newChatMsgM.save(function(error, data){
  if(error){
      console.log(error);
  }else{
      console.log('Saved!')
  }
});
*/

//var io = require('socket.io').listen(3100);
io.sockets.on('connection', (socket) => {
  //socketIds['GUEST-'+count]=socket.id;
  //count++;
  
  socket.on('disconnect', () => {
    console.log('user disconnected' +' socket.name:' +socket.name+" socket.id:"+socket.id);
    io.emit('userDisconnected', socket.name);
    //io.to(roomNameG).emit('userDisconnected', socket.name);
    
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
      console.log("del roomArr:" + JSON.stringify([...roomArr[index].members]));
    }
    console.log('--------------');
  });

  socket.on('setNameS', (name) => {
    if (isEmpty(name)){
      socket.name = 'Guest' + cnt;
      cnt++;
      //io.to(socket.id).emit('setNameC', socket.name);
    } else {
      socket.name = name;
    }
    io.to(socket.id).emit('setNameC', socket.name);
    if (socketArr.length > 0) {
      let socketJson;
      let pushFlag = true;
      for (let index = 0; index < socketArr.length; index++) {
        if (socketArr[index].name == name) {
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

  /*socket.on('setNameS', (name) => {
    //if (typeof name == "undefined" || name == null || name == ""){
    if (isEmpty(name)){
      socket.name = 'Guest' + cnt;
      cnt++;
      //io.to(socket.id).emit('setNameC', socket.name);
    } else {
      socket.name = name;
    }
    io.to(socket.id).emit('setNameC', socket.name);
    if (socketArr.length > 0) {
      let socketJson;
      for (let index = 0; index < socketArr.length; index++) {
        let socketInfo = JSON.parse(socketArr[index]);
        if (socketInfo.name == name) {
          //let socketJson = {"id":socket.id,"name":'Guest' + (cnt-1)};
          socketJson = {"id":socket.id,"name":socket.name};
          socketArr.splice(index, 1);
          //socketArr.push(JSON.stringify(socketJson));
        } else {
          socketJson = {"id":socket.id,"name":socket.name};
          //socketArr.push(JSON.stringify(socketJson));
        }
      }
      socketArr.push(JSON.stringify(socketJson));
    } else {
      //무조건 넣는다
      socketJson = {"id":socket.id,"name":socket.name};
      socketArr.push(JSON.stringify(socketJson));
    }
    console.log('socketArr:' + socketArr);
  });*/

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
      if (roomArr.length > 0) {
        //roomArr id 검색 member 찾아서 맴버를  set으로 가져오고 이름 삽입
        let pushFlag = true;
        for (let index = 0; index < roomArr.length; index++) {
          if (roomArr[index].id == roomName) {
            let memberSet = new Set(roomArr[index].members);
            memberSet.add(name);
            roomArr[index] = {"id":roomName,"members":memberSet};
            //roomArr.push(JSON.stringify(roomJson));
            pushFlag = false;
          } 
        }
        if (pushFlag) {
          let memberSet = new Set([name]);
          roomArr.push({"id":roomName,"members":new Set([name])});
        }
      } else {
        let memberSet = new Set([name]);
        roomArr.push({"id":roomName,"members":new Set([name])});
      }
      //console.log('roomArr:' + roomArr);
      
      for (let index = 0; index < roomArr.length; index++) {
        console.log("Add roomArr:" + JSON.stringify([...roomArr[index].members]));
      }
      console.log('--------------');
      
      console.log(io.sockets.clients());
      var sockets = io.sockets.sockets;
      for(var socketId in sockets)
      {
        var socket = sockets[socketId]; //loop through and do whatever with each connected socket
        //...
        console.log('socketId:'+socket);
      }
    });
  });

  /*
  socket.on('joinRoom2', (roomName, name) => {
    socket.join(roomName, () => {
      console.log(name + ' join a ' + roomName);
      roomNameG = roomName;
      io.to(roomName).emit('joinRoom2', roomName, name);
      if (roomArr.length > 0) {
        //roomArr id 검색 member 찾아서 맴버를  set으로 가져오고 이름 삽입
        let roomJson;
        for (let index = 0; index < roomArr.length; index++) {
          let roomInfo = JSON.parse(roomArr[index]);
          console.log('roomInfo:' + roomInfo);
          if (roomInfo.id == roomName) {
            let memberSet = new Set(roomInfo.members);
            memberSet.add(name);
            let strArray = [];
            for(str of memberSet){
              strArray.push(str);
            }
            roomJson = {"id":roomName,"members":strArray};
            roomArr.splice(index, 1);
            //roomArr.push(JSON.stringify(roomJson));
          } else {
            roomJson = {"id":roomName,"members":[name]};
            //roomArr.push(JSON.stringify(roomJson));
          }
        }
        roomArr.push(JSON.stringify(roomJson));
      } else {
        roomJson = {"id":roomName,"members":[name]};
        roomArr.push(JSON.stringify(roomJson));
      }
      console.log('roomArr:' + roomArr);
    });
  });
  */

  socket.on('chatMessage2', (roomName, name, msg) => {
    io.to(roomName).emit('chatMessage2', name, msg);
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

http.listen(3000, () => {
  console.log('Connect at 3000');
});