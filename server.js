const express = require('express');
const server = express();
const exphbs = require('express-handlebars');
const request = require('request');
const async = require('async');
const LeagueJs = require('leaguejs');
const fetch = require('node-fetch');

const API_KEY = 'RGAPI-e504135e-08e0-4a0d-b3e6-964615874018'

const api = new LeagueJs(API_KEY);

server.engine('handlebars', exphbs({defaultLayout: 'main'}));

server.set('view engine', 'handlebars');


server.get('/:summonerId', (req, res) => {
  const { summonerId } = req.params;
  const data = {};
  const ACC_DATA_ACC_DATA_URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summonerId + '?api_key=' + API_KEY;
  const RANKS_URL = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/' + accountId + '?api_key=' + API_KEY;

  async.waterfall([
    function(callback) {
      request(ACC_DATA_URL, function(err, response, body) {
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
    },
    function (callback) {
      request()
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
