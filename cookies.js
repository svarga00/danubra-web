/* ============================================================
   Danubra — súhlas s cookies + Google Analytics

   NASTAVENIE: do premennej GA_ID vložte svoje meracie ID
   z Google Analytics (má tvar G-XXXXXXXXXX).
   Kým je prázdne, analytika sa nespúšťa vôbec.
   ============================================================ */

var GA_ID = '';

(function () {
  'use strict';

  var KLUC = 'danubra-suhlas';
  var jazyk = (document.documentElement.lang || 'sk').slice(0, 2);

  var T = {
    sk: {
      nadpis: 'Používame cookies',
      text: 'Nevyhnutné cookies potrebujeme na fungovanie stránky. So súhlasom pridáme aj analytické, aby sme videli, ktoré časti webu ľuďom pomáhajú a ktoré nie.',
      viac: 'Ochrana osobných údajov',
      viacHref: 'ochrana-osobnych-udajov.html',
      prijat: 'Prijať všetko',
      nutne: 'Len nevyhnutné',
      nastavenia: 'Nastavenia cookies'
    },
    cs: {
      nadpis: 'Používáme cookies',
      text: 'Nezbytné cookies potřebujeme k fungování stránky. Se souhlasem přidáme i analytické, abychom viděli, které části webu lidem pomáhají a které ne.',
      viac: 'Ochrana osobních údajů',
      viacHref: 'ochrana-osobnych-udajov.html',
      prijat: 'Přijmout vše',
      nutne: 'Jen nezbytné',
      nastavenia: 'Nastavení cookies'
    },
    hu: {
      nadpis: 'Sütiket használunk',
      text: 'A működéshez szükséges sütikre az oldal működtetéséhez van szükségünk. Hozzájárulással analitikai sütiket is használunk, hogy lássuk, a weboldal mely részei segítenek a látogatóknak.',
      viac: 'Adatvédelem',
      viacHref: 'ochrana-osobnych-udajov.html',
      prijat: 'Mindet elfogadom',
      nutne: 'Csak a szükségeseket',
      nastavenia: 'Süti beállítások'
    }
  };
  var t = T[jazyk] || T.sk;

  /* ---------- Consent Mode: kým nie je súhlas, meranie je vypnuté ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  function citaj() {
    try { return localStorage.getItem(KLUC); } catch (e) { return null; }
  }
  function zapis(hodnota) {
    try { localStorage.setItem(KLUC, hodnota); } catch (e) {}
  }

  var nacitane = false;
  function spustiAnalytiku() {
    if (nacitane || !GA_ID) return;
    nacitane = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function prijmi() {
    zapis('vsetko');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    spustiAnalytiku();
    skry();
  }
  function odmietni() {
    zapis('nutne');
    gtag('consent', 'update', { analytics_storage: 'denied' });
    skry();
  }
  function skry() {
    var b = document.getElementById('cookieBar');
    if (b) { b.classList.remove('on'); setTimeout(function () { b.remove(); }, 300); }
  }

  function postav() {
    if (document.getElementById('cookieBar')) return;
    var pod = location.pathname.split('/').filter(Boolean).length > 1 ? '' : '';
    var href = t.viacHref;
    var b = document.createElement('div');
    b.className = 'cookiebar';
    b.id = 'cookieBar';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', t.nadpis);
    b.innerHTML =
      '<div class="cookiebar-in">' +
        '<div class="cookiebar-txt">' +
          '<strong>' + t.nadpis + '</strong>' +
          '<p>' + t.text + ' <a href="' + href + '">' + t.viac + '</a></p>' +
        '</div>' +
        '<div class="cookiebar-btn">' +
          '<button type="button" class="ck-nutne">' + t.nutne + '</button>' +
          '<button type="button" class="ck-prijat">' + t.prijat + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('.ck-prijat').onclick = prijmi;
    b.querySelector('.ck-nutne').onclick = odmietni;
    requestAnimationFrame(function () { b.classList.add('on'); });
  }

  /* ---------- štart ---------- */
  function start() {
    var volba = citaj();
    if (volba === 'vsetko') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      spustiAnalytiku();
    } else if (volba !== 'nutne') {
      postav();
    }
    /* odkaz v pätičke na zmenu voľby */
    var odkazy = document.querySelectorAll('[data-cookies]');
    for (var i = 0; i < odkazy.length; i++) {
      odkazy[i].textContent = t.nastavenia;
      odkazy[i].onclick = function (e) { e.preventDefault(); postav(); };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
