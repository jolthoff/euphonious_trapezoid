var bcrypt = require('bcrypt-nodejs');
var db = require('../db/db.js');

module.exports.signup = function(req, res) {
  var username = req.body.username;
  var password = req.body.password; // will encrypt
  var params = [username, password, req.body.email, 1200, 0];

  var sqlQueryAsk = "SELECT Players.Player_Username FROM \
    Players WHERE Player_Username = '" + username + "' \
    LIMIT 1";
  var sqlQueryIns = "INSERT INTO Players (Player_Username, Hash, Email, Ranking, Games_Played) \
    Value (?, ?, ?, ?, ?)";

  db.query(sqlQueryAsk, function(err, results) {
    if (err) {
      console.log("ask" + err);
    } else {
      console.log(results);
      if (results.length !== 0) { // if entry exists then kick back and ask for new input
        res.status(403).send('username already taken');
      } else { // if entry does not exist then submit into to database kick to login on the client
        bcrypt.hash(password, null, null, function(err, hash) {
          if(err){
            console.log(err);
          } else {
            console.log(hash)
            params[1] = hash;
            db.query(sqlQueryIns, params, function(err) {
              if (err) {
                console.log(err);
              } else {
                res.status(200).send('credentials accepted, redirect to login');
              }
            });
          }
        });
      }
    }
  });
};

//allow user to friend other players at end of game
module.exports.friend = function(req, res) {
  var friendName = req.body.friendName;
  var myID = req.body.id;
  var params = [myID, null, friendName];

  var sqlQueryAsk = "SELECT Players.Player_ID FROM \
    Players WHERE Player_Username = '" + friendName + "'";

  var sqlQueryIns = "INSERT INTO Friends (Player_ID, Friend_ID, Friend_Name) \
    Value (?, ?, ?)";

  db.query(sqlQueryAsk, function(err, results) {
    if (err) {
      console.log(err)
    } else {
      console.log(results);
      if (results.length === 0) {
        res.status(403).send('cannot find user');
      } else {
        params[1] = results[0].Player_ID;
        db.query(sqlQueryIns, params, function(err, results) {
          if (err) {
            console.log(err);
          } else {

            res.status(200).send(friendName);
          }
        });
      }
    }

  });

};

module.exports.updateProfile = function(req, res) {
  var ranking = req.body.profile.ranking;
  var gamesPlayed = req.body.profile.gamesPlayed;
  var userName = req.body.profile.userName;
  var params = [ranking, gamesPlayed];

  var sqlQueryIns = "UPDATE Players SET Ranking = " + ranking + ", Games_Played = " + gamesPlayed + " \
    WHERE Player_Username = '" + userName + "'";

  db.query(sqlQueryIns, function(err, results) {
    if (err) {
      console.log(err)
    } else {
      res.status(200).send("Your new stats are ", results);
    }
  });
};
