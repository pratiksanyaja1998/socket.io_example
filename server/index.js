var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser=require("body-parser");

const configuration = require('./knexfile');
const knex = require('knex')(configuration);   


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/register',function(request,response){


  let user = {
    fristname: request.body.fristname,
    lastname: request.body.lastname,
    username:request.body.username,
    token:Math.random().toString(36).substring(7)+Math.random().toString(36).substring(7)+Math.random().toString(36).substring(7)
};

  // knex('user').insert(user)
  // .then((result)=>{

    response.status(200).send(user);

  // }).catch((error)=>{
  //   response.status(500).send(error)
  // })

})


// socket

var listActive = [];


io.on('connection', function(socket){
  
  console.log('a user connected ' + socket.id);

  socket.auth = false;

  socket.on('auth',function(user){
    // console.log(user)
    socket.auth =true;
    socket.user = user;
    listActive.push({...user,
    socketId:socket.id});
    io.emit('userList',listActive);
  })

  

  socket.on('message',function(msg){

    console.log(msg)

    socketIdReciver =  listActive.find((o, i) => {

        if (o) {
            if (o.username === msg.username) {

              io.to(o.socketId).emit('recive', {sender:socket.user.username,
                msg:msg.msg});
              
                return true; // stop searching
            }
        }
    })

    
  });

  socket.on('disconnect', function(){

    socketIdReciver =  listActive.find((o, i) => {

      if (o) {
          if (o.username === socket.user.username) {

              listActive.splice(i,1);
              io.emit('userList',listActive);

              return true; // stop searching
          }
      }
  })

    console.log('user disconnected ' + socket.id);

  });

});

http.listen(3000, function(){

  console.log('listening on *:3000');

});