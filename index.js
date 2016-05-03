var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.get('/', function(req, res) {
  res.send('Hello World!');
});

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'pluk74',
  password : '',
  database: 'reddit'
});

function getHomepage(page, callback) {
    connection.query(`SELECT posts.*, users.username AS userCreator FROM posts INNER JOIN users ON posts.userId=users.id`, function(err, res) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, res);
        }
    });
}

function sayHelloWorld() {
  return "Hello World!";
}

function sayHelloTo(name) {
  return "hello " + name + " :)";
}


function calculate(op, num1, num2) {
  var solution;
  switch (op) {
    case 'add':
      solution = num1 + num2;
      break;
    case 'sub':
      solution = num1 - num2;
      break;
    case 'mult':
      solution = num1 * num2;
      break;
    case 'div':
      solution = num1 / num2;
      break;
    default:
      return;
  }

  return {
          operator:op,
          firstOperand:num1,
          secondOperand:num2,
          solution: solution
          };

}

function createPost (post, callback) {
      connection.query(
        'INSERT INTO `posts` (`userId`, `title`, `url`, subredditId, `createdAt`) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, post.subredditId, null],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            connection.query(
              'SELECT `id`,`title`,`url`,`userId`, subredditId, `createdAt`, `updatedAt` FROM `posts` WHERE `id` = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    }
    


app.get('/createContent/:name', function (req, res, next) {

  var options = {
    root: '/home/ubuntu/workspace/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });

});

app.get('/homepage', function(request, response) {
    
    var page = request.query.page || 1;
  
    getHomepage(page, function(err, posts) {
        var output = '<div id="contents"><h1>List of contents</h1><ul class="contents-list">';
        if(err) {
            console.log(err);
            response.status(500).send('oops try again later!');
        }
        else {
            posts.forEach(function(element) {
              output = output + `<li class="content-item"><h2 class="content-item__title"><a href="`+element.url+`">`+element.title+
              `</a></h2><p>Created by `+element.userCreator+`</p></li>`;
              return;
            });
            output = output + "</ul></div>";
            //console.log(output);
            response.send(output);
        }
    })
});





app.get('/calculator/:operation', function(request, response) {
  var op = request.params.operation;
  var num1 = request.query.num1;
  var num2 = request.query.num2;
  response.send(calculate(op,parseInt(num1),parseInt(num2)));
});

app.get('/hello', function(request, response) {
  var name = request.query.name;
  var result = sayHelloTo(name);
  response.send('<h1>' + result + '</h1>');
});
/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
