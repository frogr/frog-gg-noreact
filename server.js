const express = require('express');
const server = express();
const exphbs = require('express-handlebars');
const request = require('request');
const async = require('async');
const LeagueJs = require('leaguejs');
const fetch = require('node-fetch');

const API_KEY = 'RGAPI-34c9cb99-bc70-4a13-b328-068d7a63236b';

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
          res.status(200).json({'!E': 'probably entered an invalid summoner.'})
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
          while (json[i].queueType !== 'RANKED_SOLO_5x5') {
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
    // function (data, callback) {
    //   const RCNT_MATCH_URL = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' + data.accountId + '/recent?api_key=' + API_KEY;
    //   request(RCNT_MATCH_URL, (err, res, body) => {
    //     console.log("line 68", RCNT_MATCH_URL)
    //     if (!err && res.statusCode === 200) {
    //       let json = JSON.parse(body);
    //       console.log("THIRD JSON", json.matches[0]);
    //       console.log('72', json.matches[0].champion)
    //         console.log(json.matches[0].champion);
    //         fetchChampNameWITHFROGGG(json.matches[0].champion);
    //     }
    //   })
    // }
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

const fetchChampNameWithRIOT = cID => {
const url = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/' + cID + '?locale=en_US&api_key=' + API_KEY;
fetch(url)
  .then(res => res.json())
  .then(data => {
    setTimeout(() => {
      console.log(data.name)
    }, 2500)
    return data.name;
  })
  .catch(e => {
    console.log('!E', e);
  });
};

const fetchChampNameWITHFROGGG = cID => {
  const url = 'https://frog-gg-api.herokuapp.com/' + cID;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data.name);
      return data;
    })
    .catch(e => {
      console.log('!E', e);
    });
};

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log('server up');
});
