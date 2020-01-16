// const path = require('path');
// const $ = require('jquery');
// const storage = require('electron-json-storage');
// const RES_ROOT = path.join(__dirname, '../../')
// var electron = require("electron");
// var shell = require('electron').shell;
// const ipc = electron.ipcRenderer;
// const { dialog } = electron.remote;
// const app = require('electron').remote.app;
// const basepath = app.getAppPath();


const SERVER_ROOT = 'http://localhost:3000';



packetApp = angular.module('PacketApp', ["ngRoute"]);

packetApp.config(function ($routeProvider) {

    $routeProvider
        .when("/", {
            templateUrl: "template/register.html",
            controller: "registerController"
        })
        .when("/dashbord", {
            templateUrl: "template/dashbord.html",
            controller: "dashbordController"
        })

});


packetApp.run(function ($rootScope, $location, $window) {

    $rootScope.user=false;

    document.addEventListener("keydown", (event) => {

        if (event.ctrlKey && (event.key == "r" || event.key == "R") ) {
            $location.path("/")
            $rootScope.$apply()
        }
    });

});


//controller
packetApp.controller("registerController", ["$scope", "$rootScope", '$location', function ($scope, $rootScope, $location) {

    $scope.user = {
        fristname:'',
        lastname:'',
        username:'',
        serverurl:'http://localhost:3000'

    }

    // storage.has('user', function (error, hasKey) {

    //     if (error) throw error;

    //     if (hasKey) {

    //         console.log('There is data stored as user ' + hasKey);
            
    //         storage.get('user', function(error, data) {
    //             if (error) throw error;
    //             logger("user is get from json",data);
    //             $rootScope.user = data;
    //             $scope.goToDashbord();
    //           });

          
    //     }

    // });

    $scope.goToDashbord = ()=>{
        $location.path('/dashbord').replace();
        $scope.$apply();
    }

    $scope.clickRegister = () => {

        axios.post(SERVER_ROOT+'/register',$scope.user)
            .then(function (response) {
                console.log(response.data);
                // storage.set('user', response.data,  (error) =>{
                    // if (error) throw error;
                    console.log("user saved")
                    $rootScope.user = response.data;
                    $scope.goToDashbord();
                // });
            })
            .catch(function (error) {
                console.log(error);
            });
    }


}]);

packetApp.controller("dashbordController", ["$scope", "$rootScope", '$location', function ($scope, $rootScope, $location) {

    var socket = io(SERVER_ROOT);

    if($rootScope.user)
    socket.emit('auth',$rootScope.user);

    $scope.activeUserId = null;

    $scope.userList = false;

    socket.on('userList',(userList)=>{
        $scope.userList = userList;
        $scope.$apply();
        logger("get usr list from sever",userList);
    });

    $scope.setActiveUserRoom=(id)=>{
        $scope.activeUserId = id
        $scope.userList[id].unwhatch = false
        logger("active user is ",$scope.userList[id])
    }

    socket.on('recive',(msg)=>{

        logger("befor recive msg",msg)

        $scope.userList.find((o, i) => {


                if (o.username === msg.sender) {

                    let message = [];
    
                    if($scope.userList[i].message){

                        message=$scope.userList[i].message

                    }

                    message.push({msg:msg.msg,isuser:false})

                

                    $scope.userList[i] = {
                        ...$scope.userList[i],
                        message:message,
                        unwhatch:(i==$scope.activeUserId)?false:true,
                    }
                  
                    $scope.$apply()

                    logger("after recive message" , $scope.userList[i])
                    return true; // stop searching
                }


        })
       
    })

    $scope.msgInput = '';

    $scope.submitMsg = ()=>{

        logger("before send message" , $scope.userList[$scope.activeUserId])


        let message = [];
    
        if($scope.userList[$scope.activeUserId].message){

            message=$scope.userList[$scope.activeUserId].message;
            

        }

            message.push({msg:$scope.msgInput,isuser:true})

        

        $scope.userList[$scope.activeUserId] = {
            ...$scope.userList[$scope.activeUserId],
            message:message 
        }


        socket.emit('message',{username:$scope.userList[$scope.activeUserId].username,msg:$scope.msgInput})
        $scope.msgInput = '';

    };

}]);


function logger(message, data) {
    console.log("===================================================================================")
    console.log(message)
    console.log("===================================================================================")
    console.log(data)
    console.log("-----------------------------------------------------------------------------------")
}

// temp