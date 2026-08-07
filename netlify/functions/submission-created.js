/* ============================================================
   Danubra — vlastný e-mail pri odoslaní formulára

   Netlify túto funkciu spustí automaticky pri každom prijatom
   formulári (názov súboru "submission-created" je povinný).

   NASTAVENIE v Netlify → Site configuration → Environment variables:
     RESEND_API_KEY   kľúč z resend.com
     NOTIFY_TO        info@danubra.eu   (viac adries oddeľte čiarkou)
     NOTIFY_FROM      Danubra <dopyt@danubra.eu>

   Kým RESEND_API_KEY chýba, funkcia sa ticho ukončí
   a beží len pôvodné upozornenie od Netlify.
   ============================================================ */

const ZNACKA = {
  navy: '#0A1B3D',
  orange: '#F07E22',
  blue: '#1E4FD8',
  ink: '#3d4757',
  line: '#e6e8ef',
  soft: '#f5f6f9'
};

/* ---------- pekné názvy polí ---------- */
const NAZVY = {
  typ_zakaznika: 'Typ zákazníka',
  meno: 'Meno a priezvisko',
  firma: 'Firma',
  email: 'E-mail',
  telefon: 'Telefón',
  jazyk: 'Jazyk komunikácie',
  krajina: 'Krajina',
  mesto: 'Mesto alebo región',
  pracovisko: 'Adresa pracoviska',
  pocet_osob: 'Počet osôb',
  termin_od: 'Nástup od',
  dlzka: 'Predpokladaná dĺžka',
  rozpocet: 'Rozpočet na osobu a noc',
  turnus: 'Turnusový režim',
  typ_ubytovania: 'Typ ubytovania',
  vybavenie: 'Požiadavky na vybavenie',
  dojazd: 'Maximálny dojazd do práce',
  doprava: 'Spôsob dopravy',
  poznamka: 'Poznámka',
  kontakt: 'Kontakt',
  sprava: 'S čím potrebuje pomôcť',
  osoby: 'Počet osôb'
};

/* ---------- kódy na zrozumiteľné hodnoty ---------- */
const HODNOTY = {
  typ_zakaznika: { agentura: 'Pracovná agentúra', firma: 'Firma', partia: 'Partia', jednotlivec: 'Jednotlivec' },
  jazyk: { sk: 'Slovenčina', cz: 'Čeština', hu: 'Maďarčina', de: 'Nemčina' },
  krajina: { de: 'Nemecko', at: 'Rakúsko', ch: 'Švajčiarsko', lu: 'Luxembursko',
             li: 'Lichtenštajnsko', cz: 'Česko', hu: 'Maďarsko', neviem: 'Zatiaľ neurčené' },
  turnus: { ano: 'Áno — ľudia sa striedajú', nie: 'Nie — rovnaká zostava', neviem: 'Ešte sa rozhoduje' },
  typ_ubytovania: { apartman: 'Apartmán alebo byt', izby: 'Izby v dome',
                    ubytovna: 'Ubytovňa', jedno: 'Nerozhoduje' },
  vybavenie: { kuchyna: 'Vlastná kuchyňa', pracka: 'Práčka', wifi: 'Wi-Fi',
               parkovanie: 'Parkovanie', mhd: 'Blízko MHD', samostatne: 'Samostatné lôžka' }
};

const PODOBA = {
  'dopyt': ['Podrobný dopyt', 'slovenská verzia'],
  'dopyt-cs': ['Podrobný dopyt', 'česká verzia'],
  'dopyt-hu': ['Podrobný dopyt', 'maďarská verzia'],
  'rychly-kontakt': ['Rýchly kontakt', 'slovenská verzia'],
  'rychly-kontakt-cs': ['Rýchly kontakt', 'česká verzia'],
  'rychly-kontakt-hu': ['Rýchly kontakt', 'maďarská verzia'],
  'agentury': ['Dopyt agentúry', 'slovenská verzia'],
  'agentury-cs': ['Dopyt agentúry', 'česká verzia'],
  'agentury-hu': ['Dopyt agentúry', 'maďarská verzia']
};

const SKRY = ['bot-field', 'form-name', 'suhlas', 'ip', 'user_agent', 'referrer'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hodnota(kluc, val) {
  if (Array.isArray(val)) {
    return val.map(function (v) { return (HODNOTY[kluc] && HODNOTY[kluc][v]) || v; }).join(', ');
  }
  if (kluc === 'termin_od' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    var d = val.split('-');
    return d[2].replace(/^0/, '') + '. ' + d[1].replace(/^0/, '') + '. ' + d[0];
  }
  return (HODNOTY[kluc] && HODNOTY[kluc][val]) || val;
}

function riadok(nazov, val, zvyraznit) {
  return '' +
    '<tr>' +
      '<td style="padding:13px 0;border-bottom:1px solid ' + ZNACKA.line + ';font-size:13px;' +
      'color:#7a839a;width:42%;vertical-align:top;">' + esc(nazov) + '</td>' +
      '<td style="padding:13px 0;border-bottom:1px solid ' + ZNACKA.line + ';font-size:15px;' +
      'color:' + ZNACKA.navy + ';font-weight:' + (zvyraznit ? '600' : '500') + ';vertical-align:top;">' +
      val + '</td>' +
    '</tr>';
}

function sablona(nazovFormulara, data, kedy) {
  var p = PODOBA[nazovFormulara] || [nazovFormulara, ''];
  var poradie = Object.keys(NAZVY).filter(function (k) { return k in data; });
  Object.keys(data).forEach(function (k) {
    if (poradie.indexOf(k) === -1 && SKRY.indexOf(k) === -1) poradie.push(k);
  });

  var riadky = '';
  poradie.forEach(function (k) {
    if (SKRY.indexOf(k) !== -1) return;
    var v = data[k];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
    var text = esc(hodnota(k, v));
    if (k === 'email') text = '<a href="mailto:' + esc(v) + '" style="color:' + ZNACKA.blue + ';">' + text + '</a>';
    if (k === 'telefon' || k === 'kontakt') {
      var tel = String(v).replace(/[^\d+]/g, '');
      if (tel.length > 5) text = '<a href="tel:' + tel + '" style="color:' + ZNACKA.blue + ';">' + esc(v) + '</a>';
    }
    riadky += riadok(NAZVY[k] || k, text, k === 'meno' || k === 'mesto' || k === 'pocet_osob');
  });

  var odpovedat = data.email
    ? '<a href="mailto:' + esc(data.email) + '" style="display:inline-block;background:' + ZNACKA.orange +
      ';color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 26px;border-radius:10px;">' +
      'Odpovedať klientovi</a>'
    : '';

  return '' +
'<!DOCTYPE html><html lang="sk"><head><meta charset="utf-8">' +
'<meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
'<body style="margin:0;padding:0;background:' + ZNACKA.soft + ';">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + ZNACKA.soft + ';padding:28px 14px;">' +
'<tr><td align="center">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 14px rgba(10,27,61,.08);font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Arial,sans-serif;">' +

    /* hlavička */
    '<tr><td style="background:' + ZNACKA.navy + ';padding:26px 30px;">' +
      '<div style="font-size:19px;font-weight:700;color:#ffffff;letter-spacing:-.4px;">' +
        '<span style="color:' + ZNACKA.blue + ';">D</span>ANUBRA</div>' +
      '<div style="font-size:13px;color:#9aa3bf;margin-top:4px;">Nový dopyt z webu</div>' +
    '</td></tr>' +

    /* pás s typom formulára */
    '<tr><td style="background:linear-gradient(90deg,' + ZNACKA.orange + ',' + ZNACKA.blue + ');height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>' +

    /* nadpis */
    '<tr><td style="padding:28px 30px 4px;">' +
      '<div style="display:inline-block;background:#FFF1E4;color:' + ZNACKA.orange + ';font-size:11.5px;' +
      'font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:6px 12px;border-radius:999px;">' +
      esc(p[0]) + '</div>' +
      '<div style="font-size:13px;color:#7a839a;margin-top:12px;">' + esc(p[1]) + ' &nbsp;·&nbsp; ' + esc(kedy) + '</div>' +
    '</td></tr>' +

    /* údaje */
    '<tr><td style="padding:14px 30px 8px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + riadky + '</table>' +
    '</td></tr>' +

    /* tlačidlo */
    (odpovedat ? '<tr><td style="padding:22px 30px 30px;">' + odpovedat + '</td></tr>' : '<tr><td style="height:20px;"></td></tr>') +

    /* pätička */
    '<tr><td style="background:' + ZNACKA.soft + ';padding:20px 30px;border-top:1px solid ' + ZNACKA.line + ';">' +
      '<div style="font-size:12px;color:#8a93a8;line-height:1.6;">' +
        'Dopyt je uložený aj v Netlify → Forms → ' + esc(nazovFormulara) + '.<br>' +
        'Táto správa je automatická, neodpovedajte na ňu — použite tlačidlo vyššie.' +
      '</div>' +
    '</td></tr>' +

  '</table>' +
'</td></tr></table></body></html>';
}

export default async (req) => {
  const KLUC = process.env.RESEND_API_KEY;
  if (!KLUC) return new Response('preskočené — chýba RESEND_API_KEY', { status: 200 });

  let telo;
  try { telo = await req.json(); } catch (e) { return new Response('zlý formát', { status: 400 }); }

  const p = (telo && telo.payload) || {};
  const data = p.data || {};
  const nazov = p.form_name || 'formulár';

  const kedy = new Date(p.created_at || Date.now()).toLocaleString('sk-SK', {
    timeZone: 'Europe/Bratislava', day: 'numeric', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const p2 = PODOBA[nazov] || [nazov, ''];
  const predmet = p2[0] + ' — ' + (data.meno || data.mesto || 'nový dopyt') +
                  (data.mesto && data.meno ? ' (' + data.mesto + ')' : '');

  const odpoved = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + KLUC, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || 'Danubra <onboarding@resend.dev>',
      to: (process.env.NOTIFY_TO || 'info@danubra.eu').split(',').map(function (s) { return s.trim(); }),
      reply_to: data.email || undefined,
      subject: predmet,
      html: sablona(nazov, data, kedy)
    })
  });

  if (!odpoved.ok) {
    const chyba = await odpoved.text();
    console.error('Resend zlyhal:', odpoved.status, chyba);
    return new Response('chyba pri odosielaní', { status: 500 });
  }
  return new Response('odoslané', { status: 200 });
};
