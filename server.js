var express = require('express');
var server = express();
var exphbs = require('express-handlebars');
var request = require('request');
var async = require('async');

server.engine('handlebars', exphbs({defaultLayout: 'main'}));

server.set('view engine', 'handlebars');


server.get('/:summonerId', (req, res) => {
  const { summonerId } = req.params;
  const data = {};
  const api_key = 'RGAPI-e504135e-08e0-4a0d-b3e6-964615874018';
  const URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summonerId + '?api_key=' + api_key;


  async.waterfall([
    function(callback) {
      request(URL, function(err, response, body) {
        if(!err && response.statusCode == 200) {
          var json = JSON.parse(body);
          console.log(json)
          console.log(summonerId);
          data.id = json.id;
          data.name = json.name;
          data.accountId = json.accountId;
          data.profileIconId = json.profileIconId;
          data.summonerLevel = json.summonerLevel;
          callback(null, data);
        } else {
          console.log(err);
        }
      });
    }
  ],
  function(err, data) {
    if(err) {
      console.log(err);
      return;
    }

    res.render('index', {
      info: data
    });
  });
});

var port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log('server up');
});
