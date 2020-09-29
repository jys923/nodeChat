// // 1. mongoose 모듈 가져오기
var mongoose = require('mongoose');
// // 2. testDB 세팅
// //mongoose.connect('mongodb://localhost:27017/testDB');
// mongoose.connect('mongodb://root:changeme@127.0.0.1:27017/testDB?authSource=admin', {useNewUrlParser: true});
// // 3. 연결된 testDB 사용
// var db = mongoose.connection;
// // 4. 연결 실패
// db.on('error', function(){
//     console.log('Connection Failed!');
// });
// // 5. 연결 성공
// db.once('open', function() {
//     console.log('Connected!');
// });

let database; 
function connectDB(){
    let uri = 'mongodb://localhost:27017/testDB?authSource=admin';
    let options = {
        user: 'root',
        pass: 'changeme',
        useNewUrlParser: true,
        useUnifiedTopology: true 
    }
    mongoose.connect(uri, options, function(err){
        if (err) throw err;
        // if no error == connected
        else
            console.log('Connect!');
    });
    mongoose.Promise = global.Promise; 
    database = mongoose.connection; 
}
// let database; 
// function connectDB() { 
//     let databaseUrl = 'mongodb://root:changeme@localhost:27017/testDB?authSource=admin'; 
//     mongoose.connect(databaseUrl); 
//     mongoose.Promise = global.Promise; 
//     database = mongoose.connection; 
// }

connectDB()

var msg = require("./msg"); // 스키마 불러오기
let MsgModel = new msg();
MsgModel.roomName = "straem";
MsgModel.uuId = "000-000-00000000";
MsgModel.name = "user2";
MsgModel.msg = "hello222aaaa";
MsgModel.save(function(error, data){
  if(error){
      console.log(error);
  }else{
      console.log('Saved!')
  }
});