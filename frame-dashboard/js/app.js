(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var verseIndex = Math.floor(Date.now() / 86400000) % VERSES.length; // start on "verse of the day"
  var themeOffset = 0; // hours added to the sky colour when you flip themes with the remote

  // ---------- Clock ----------
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONTHS = ['January','February','March','April','May','June','July','August',
                'September','October','November','December'];

  function tickClock() {
    var d = new Date(), h = d.getHours();
    var shown = CONFIG.clock24h ? pad(h) : ((h % 12) || 12);
    $('clock').textContent = shown + ':' + pad(d.getMinutes());
    $('date').textContent = DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
  }

  // ---------- Sky that follows the time of day ----------
  var SKIES = [ // [hour, top colour, bottom colour]
    [0,  '#0b1020', '#1b2240'], [5,  '#2a2350', '#d77a61'], [7,  '#f2b880', '#7fb2d8'],
    [11, '#4f8fc0', '#a9d1ea'], [16, '#e0a96d', '#6c5b7b'], [19, '#3a2b58', '#c0605a'],
    [21, '#141a35', '#2b2f5a']
  ];
  function paintSky() {
    var h = (new Date().getHours() + themeOffset) % 24, pick = SKIES[0];
    for (var i = 0; i < SKIES.length; i++) if (h >= SKIES[i][0]) pick = SKIES[i];
    $('sky').style.background = 'linear-gradient(170deg, ' + pick[1] + ' 0%, ' + pick[2] + ' 100%)';
  }

  // ---------- Weather (Open-Meteo, no API key) ----------
  var ICONS = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',
    61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️' };
  var WORDS = { 0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',
    51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',
    71:'Light snow',73:'Snow',75:'Heavy snow',80:'Showers',81:'Showers',82:'Storms',95:'Thunderstorms',96:'Thunderstorms',99:'Thunderstorms' };
  var place = null;

  function getJSON(url, cb) {
    var x = new XMLHttpRequest();
    x.open('GET', url);
    x.onload = function () { try { cb(null, JSON.parse(x.responseText)); } catch (e) { cb(e); } };
    x.onerror = function () { cb(new Error('network')); };
    x.send();
  }

  function loadWeather() {
    if (!place) {
      return getJSON('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' +
        encodeURIComponent(CONFIG.city), function (err, r) {
          if (err || !r.results) { $('w-desc').textContent = 'Weather unavailable'; return; }
          place = r.results[0]; loadWeather();
        });
    }
    getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + place.latitude +
      '&longitude=' + place.longitude + '&current_weather=true&timezone=auto&forecast_days=4' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=' + CONFIG.units,
      function (err, w) {
        if (err || !w.current_weather) { $('w-desc').textContent = 'Weather unavailable'; return; }
        var c = w.current_weather;
        $('w-icon').textContent = ICONS[c.weathercode] || '🌡️';
        $('w-temp').textContent = Math.round(c.temperature) + '°';
        $('w-desc').textContent = (WORDS[c.weathercode] || '') + ' · ' + place.name;
        var html = '';
        for (var i = 1; i < 4; i++) {
          var day = DAYS[new Date(w.daily.time[i] + 'T12:00').getDay()].slice(0, 3);
          html += '<div class="day"><div class="d">' + day + '</div><div class="i">' +
            (ICONS[w.daily.weathercode[i]] || '') + '</div><div class="t">' +
            Math.round(w.daily.temperature_2m_max[i]) + '° <span>' +
            Math.round(w.daily.temperature_2m_min[i]) + '°</span></div></div>';
        }
        $('w-days').innerHTML = html;
      });
  }

  // ---------- Verses ----------
  function showVerse(step) {
    verseIndex = (verseIndex + (step || 0) + VERSES.length) % VERSES.length;
    var q = $('quote');
    q.className = 'quote fade';
    setTimeout(function () {
      $('q-text').textContent = '“' + VERSES[verseIndex][0] + '”';
      $('q-ref').textContent = VERSES[verseIndex][1];
      q.className = 'quote';
    }, 1200);
  }

  // ---------- Gentle drift (keeps static elements from sitting in one spot) ----------
  function drift() {
    var x = Math.round(Math.random() * 60 - 30), y = Math.round(Math.random() * 40 - 20);
    $('stage').style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  // ---------- Remote control ----------
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.className = 'show';
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.className = ''; }, 1800);
  }

  try { // Only exists on the TV; in a desktop browser the arrow keys still work.
    tizen.tvinputdevice.registerKey('ColorF0Red');
    tizen.tvinputdevice.registerKey('MediaPlayPause');
  } catch (e) {}

  document.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
      case 39: showVerse(1); toast('Next verse'); break;          // Right
      case 37: showVerse(-1); toast('Previous verse'); break;     // Left
      case 38: themeOffset = (themeOffset + 4) % 24; paintSky(); toast('Sky changed'); break; // Up
      case 40: themeOffset = 0; paintSky(); toast('Sky follows the time'); break;           // Down
      case 13: case 10252: case 403:                                // OK / Play-Pause / Red
        document.body.classList.toggle('minimal');
        toast(document.body.classList.contains('minimal') ? 'Clock only' : 'Full dashboard');
        break;
      case 10009:                                                   // Back / Return
        try { tizen.application.getCurrentApplication().exit(); } catch (err) {}
        break;
    }
  });

  // ---------- Go ----------
  tickClock(); paintSky(); loadWeather(); showVerse(0);
  setInterval(tickClock, 1000);
  setInterval(paintSky, 5 * 60 * 1000);
  setInterval(loadWeather, CONFIG.weatherMinutes * 60 * 1000);
  setInterval(function () { showVerse(1); }, CONFIG.verseSeconds * 1000);
  setInterval(drift, CONFIG.driftMinutes * 60 * 1000);
})();
