const express = require('express');
const server = express();
const exphbs = require('express-handlebars');
const request = require('request');
const async = require('async');
const LeagueJs = require('leaguejs');
const fetch = require('node-fetch');

const API_KEY = 'RGAPI-dbacd99f-6cce-44e3-887f-e2a674cc35ce';

const api = new LeagueJs(API_KEY);

server.engine('handlebars', exphbs({defaultLayout: 'main'}));

server.set('view engine', 'handlebars');


server.get('/:summonerId', (req, res) => {
  const { summonerId } = req.params;
  const data = {};
  const ACC_DATA_URL = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summonerId + '?api_key=' + API_KEY;

  async.waterfall([
    function(callback) {
      request(ACC_DATA_URL, function(err, response, body) {
        if(!err && response.statusCode == 200) {
          let json = JSON.parse(body);
          console.log("FIRST JSON", json)
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
    function (data, callback) {
      const RANKS_URL = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/' + data.id + '?api_key=' + API_KEY;
      request(RANKS_URL, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          let json = JSON.parse(body);
          console.log("SECOND JSON", json);
          let i = 0
          if (json[i].queueType !== 'RANKED_SOLO_5x5') {
            i++
          }
          data.leagueName = json[i].leagueName;
          data.tier = json[i].tier;
          data.rank = json[i].rank;
          data.wins = json[i].wins;
          data.losses = json[i].losses;
          data.veteran = json[i].veteran;
          data.inactive = json[i].inactive;
          data.freshBlood = json[i].freshBlood;
          data.hotStreak = json[i].hotStreak;
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

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log('server up');
});
