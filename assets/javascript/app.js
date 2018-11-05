

var database = "";
var userID = "";
var userSelection = "";

var numWin = 0;
var numLoss = 0;
var numTie = 0;

var sessionTime ="";


function generateID () {
    userID  = Math.floor(Math.random()*1000000000) + 1
}

function init() {

    var config = {
        apiKey: "AIzaSyBuhfbT-8cljkmySW2fuAOIMyOYvjyCVwY",
        authDomain: "joseph-project-204e1.firebaseapp.com",
        databaseURL: "https://joseph-project-204e1.firebaseio.com",
        storageBucket: "joseph-project-204e1.appspot.com"
    };
    
    firebase.initializeApp(config);
    database = firebase.database();

    var connectionsRef = database.ref("/userSession");
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function(snap) {
         if (snap.val() === true) {
               var con = connectionsRef.push(true);
               con.onDisconnect().remove();
          }
    });

    connectionsRef.on("value", function(snap) {
        console.log(snap.numChildren());
    });

    sessionTime = moment();
      
    generateID();

    $('.selection').on('click', function(){

        removeSelectedClass();
        removeResultClass();

        $(this).addClass('selected');

        userSelection = $(this).attr('id');
        database.ref('game/' + userID).set({
            selection: userSelection,
        });

    });

    $('#submit-button').on ('click',function(e){
        e.preventDefault();
        var msg = $('#chat_text').val();
        
        if (msg && msg.length > 0){
            database.ref('message/').push({
                message: msg,
                user: userID,
                time: firebase.database.ServerValue.TIMESTAMP,
            });
        }
        $('#chat_text').val('');
    });
    database.ref('message/').on("child_added", function(snapshot) {
        var messageTime = moment (snapshot.val().time);
        var messageOwner = snapshot.val().user;
        var message = snapshot.val().message;

        var msgHtml = '<div class="row"><div class="col-lg-2">' +messageTime.format('YYYY-MM-DD HH:mm:ss')+
                      '</div><div class="col-lg-10">' 
                       + ((messageOwner === userID) ? '[me]: ' : '[other:] ')
                      + message + 
                      '</div></div>';
       
        // display the message
        if (sessionTime.diff(messageTime) < 0)
        $('#table').append(msgHtml);

    });


    database.ref('game/').on("value", function(snapshot) {
     
        var opponentSelection;
        var childKey;
        snapshot.forEach(function(childSnapshot) {
            childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            if (childKey != userID){
                opponentSelection = childData.selection;
            }
        });

        if (opponentSelection && userSelection){
            updateStats(opponentSelection);
        }
    });


}

function removeResultClass(){
    $('#result').attr('class','');
    $('#result').text('');
}

function removeSelectedClass(){
    $('#paper_selection').removeClass('selected');
    $('#rock_selection').removeClass('selected');
    $('#scissor_selection').removeClass('selected');
    
}

function updateStats(opponentSelection){    

    if (userSelection && opponentSelection){
        $('#result').attr('role', 'alert');
        if (userSelection === opponentSelection){
            numTie++;   
            $('#result').attr('class','alert alert-warning');
            $('#result').text('It was a tie...');
        } else if (
            (userSelection === 'paper_selection' &&  opponentSelection === 'rock_selection') ||
            (userSelection === 'rock_selection' &&  opponentSelection === 'scissor_selection') ||
            (userSelection === 'scissor_selection' &&  opponentSelection === 'paper_selection')){
            numWin++;
            $('#result').attr('class','alert alert-success');
            $('#result').text('You won...');
        } else {
            numLoss++;
            $('#result').attr('class','alert alert-danger');
            $('#result').text('You loss, please try again...');
        }
        $('#wins').text('Total # of Wins:  ' + numWin);
        $('#losses').text('Total # of Losses: ' + numLoss);
        $('#ties').text('Total # of Ties: ' + numTie);

        userSelection = "";
        opponentSelection ="";
        database.ref('game/' + userID).remove();
        removeSelectedClass();
       

       

    }
}
$( document ).ready(init);
