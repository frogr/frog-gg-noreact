const express = require('express');
const server = express();
require('dotenv').config();
const exphbs = require('express-handlebars');
const request = require('request');
const async = require('async');
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
// server.engine('handlebars', exphbs({ defaultLayout: 'main' }));

server.set('view engine', 'ejs');
server.use(express.static('public'));

server.get('/', (req, res) => {
  res.render('search');
});
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
              data.b = false;
              data.s = false;
              data.g = false;
              data.p = false;
              data.d = false;
              data.m = false;
              data.c = false;
              data.leagueName = json[i].leagueName;
              data.tier = json[i].tier;
              data.rank = json[i].rank;
              switch (data.tier) {
                case 'BRONZE':
                  data.b = true;
                  break;
                case 'SILVER':
                  data.s = true;
                  break;
                case 'GOLD':
                  data.g = true;
                  break;
                case 'PLATINUM':
                  data.p = true;
                  break;
                case 'DIAMOND':
                  data.d = true;
                  break;
                case 'MASTER':
                  data.m = true;
                  break;
                case 'CHALLENGER':
                  data.c = true;
                  break;
              }
              console.log('LINE 92 DATA', data);
              data.wins = json[i].wins;
              data.losses = json[i].losses;
              data.veteran = json[i].veteran;
              data.inactive = json[i].inactive;
              data.recruit = json[i].freshBlood;
              data.hotStreak = json[i].hotStreak;
              console.log(data);
              callback(null, data);
            }
          } else {
            console.log(err);
          }
        });
      }
    ],
    function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      res.render('home', { data });
    }
  );
});

// NOT USED, will be implemented with match history!
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
