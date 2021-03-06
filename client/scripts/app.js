var select;
var friends = {};
var chatRooms = {};

var app = {};

// TODO  Change this to point to our node server
app.server = 'http://127.0.0.1:3000/classes/messages';

app.init = function() {
  app.fetch();
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    // TODO  Change this to point to our node server
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      console.log(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    // TODO  Change this to point to our node server
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'GET',
    success: function (data) {
      
      app.clearMessages();
      // app.clearOptions();
      var data = JSON.parse(data);

      for (var i = 0; i < data.results.length; i++) {
        var $newMessage = $('<div class="message"></div>');
        var $username = $('<div class="username"></div>');
        var $text = $('<div class="text"></div>');
        var $roomname = $('<div class="roomname"></div>');
        
        if (_.contains(friends, data.results[i].username)) {
          var newFriend = $username.text(data.results[i].username + ' :)');
          newFriend[0].className += ' friend';
          newFriend.appendTo($newMessage);
        } else {
          $username.text(data.results[i].username).appendTo($newMessage);
        }
        $text.text(data.results[i].text).appendTo($newMessage);
        $roomname.text(data.results[i].roomname + ' @ ' + data.results[i].date).appendTo($newMessage);

        $('#chats').append($newMessage);
      }
      
      var rooms = _.uniq(_.pluck(data.results, 'roomname'));

      for (var i = 0; i < rooms.length; i++) {
        if (!chatRooms.hasOwnProperty(rooms[i])) {
          app.addRoom(rooms[i]);
          chatRooms[rooms[i]] = rooms[i];
        }
      }
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to retrieve message', data);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.clearOptions = function() {
  $('#roomSelect').empty();
};

var processRoomName = function(name) {
  return name;
};
//HELPER FUNCTION TO CREATE A NEW ROOM
app.addRoom = function(name) {
  // debugger;
  var roomName = processRoomName(name);
  $('#roomSelect').append('<option value="' + roomName + '">' + name + '</option>');
  
};

// CREATE A NEW ROOM
$(document).on('click', '#addRoom', function() {
  var room = $('#newRoom').val();

  if (!chatRooms.hasOwnProperty(room)) {
    $('#roomSelect').append('<option value="' + room + '">' + room + '</option>');
    chatRooms[room] = room;
  }
});

app.addFriend = function(value) {
  friends[value] = value;
};

$(document).on('click', '.username', function() {
  var newFriend = $(this).text();
  app.addFriend(newFriend);
});

//setup refresh button
$(document).on('click', '.mainRefresh', function() {
  if (select === undefined) {
    app.init();
  } else {
    roomFunc(select);
  }
});


// USER WRITE NEW MESSAGE
$(document).submit('write-message', function(event) {
  var text = $(this).find('#comment').val();
  console.log(message);
  var message = {
    username: window.location.search.slice(10).split('%20').join(' '),
    text: text,
    roomname: select || 'lobby',
    date: new Date( new Date().getTime() + (-7) * 3600 * 1000).toUTCString().replace( / GMT$/, '' )
  };
  // app.addMessage(message);
  app.send(message);
  $('.mainRefresh').trigger('click');
  event.preventDefault();
});

app.showRoom = function(room) {
  $('#chats').find('.' + room).toggle();
};

var roomFunc = function(value) {
  select = value;

  if (select === undefined) {
    app.fetch();
  } else {

    $.ajax({
      // TODO  Change this to point to our node server
      url: 'http://127.0.0.1:3000/classes/messages',
      type: 'GET',
      success: function (data) {

        app.clearMessages();
        var data = JSON.parse(data);

        for (var i = 0; i < data.results.length; i++) {
          if (data.results[i].roomname) {
            if (data.results[i].roomname === value) {
              
              var $newMessage = $('<div class="message"></div>');

              var $username = $('<div class="username"></div>');
              var $text = $('<div class="text"></div>');
              var $roomname = $('<div class="roomname"></div>');

              if (_.contains(friends, data.results[i].username)) {
                var newFriend = $username.text(data.results[i].username + ' :)');
                newFriend[0].className += ' friend';
                // console.log(newFriend[0].className);
                newFriend.appendTo($newMessage);
              } else {
                $username.text(data.results[i].username).appendTo($newMessage);
              }

              // $username.text(data.results[i].username);
              $text.text(data.results[i].text);
              $roomname.text(data.results[i].roomname);
              $username.appendTo($newMessage);
              $text.appendTo($newMessage);
              $roomname.appendTo($newMessage);
              $('#chats').append($newMessage);
            }          
          }
        }
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to retrieve message', data);
      }
    });
  }
};

setInterval(function() {
  roomFunc(select);
}, 500);

