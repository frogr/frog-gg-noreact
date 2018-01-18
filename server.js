const express = require('express');
const server = express();
require('dotenv').config();
const exphbs = require('express-handlebars');
const request = require('request');
const async = require('async');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;

server.engine('handlebars', exphbs({ defaultLayout: 'main' }));

server.set('view engine', 'handlebars');

server.get('/:summonerId', (req, res) => {
  const { summonerId } = req.params;
  const data = {};
  const ACC_DATA_URL =
    'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' +
    summonerId +
    '?api_key=' +
    API_KEY;

  async.waterfall(
    [
      function(callback) {
        request(ACC_DATA_URL, function(err, response, body) {
          let json = JSON.parse(body);
          console.log(json);
          if (json.status == undefined) {
            data.id = json.id;
            data.name = json.name;
            data.accountId = json.accountId;
            data.profileIconId = json.profileIconId;
            data.summonerLevel = json.summonerLevel;
            callback(null, data);
          } else {
            res.json({ error: '404 wrong summoner name try again bud' });
          }
        });
      },
      function(data, callback) {
        const RANKS_URL =
          'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/' +
          data.id +
          '?api_key=' +
          API_KEY;
        request(RANKS_URL, (err, response, body) => {
          if (!err) {
            let json = JSON.parse(body);
            console.log('SECOND JSON', json);
            if (json.length === 0) {
              res.json({ error: 'hasnt placed in 2018 yet brother' });
            } else {
              let i = 0;
              while (json[i].queueType !== 'RANKED_SOLO_5x5') {
                i++;
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
            }
          } else {
            console.log(err);
          }
        });
      }
      // function(data, callback) {
      //   const RCNT_MATCH_URL =
      //     'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/' +
      //     data.accountId +
      //     '/recent?api_key=' +
      //     API_KEY;
      //   request(RCNT_MATCH_URL, (err, res, body) => {
      //     console.log('line 68', RCNT_MATCH_URL);
      //     if (!err && res.statusCode === 200) {
      //       let json = JSON.parse(body);
      //       console.log('THIRD JSON', json.matches[0]);
      //       for (let m = 0; m < json.matches.length; m++) {
      //         fetchChampNameWITHFROGGG(json.matches[m].champion);
      //       }
      //     }
      //   });
      // }
    ],
    function(err, data) {
      if (err) {
        console.log(err);
        return;
      }

      res.render('index', {
        info: data
      });
    }
  );
});

const fetchChampNameWithRIOT = cID => {
  const url =
    'https://na1.api.riotgames.com/lol/static-data/v3/champions/' +
    cID +
    '?locale=en_US&api_key=' +
    API_KEY;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      setTimeout(() => {
        console.log(data.name);
      }, 2500);
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

// TODO: ability to compare profiles next to each other
// TODO: app bork when no results found
