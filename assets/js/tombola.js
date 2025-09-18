(function(){
  "use strict";

  var canvas = null;
  var ctx = null;
  var pointerEl = null;
  var spinBtn = null;
  var resetBtn = null;
  var statusEl = null;
  var probListEl = null; // removed from UI
  var csvInput = null; // removed from UI
  var loadDefaultBtn = null; // removed from UI
  var simBtn = null; // removed from UI
  var simResultEl = null; // removed from UI

  var participants = []; // [{name, tickets}]
  var totalTickets = 0;
  var arcs = []; // [{name, tickets, startAngle, endAngle, color}]
  var spinning = false;
  var rotation = 0; // current rotation in radians
  var angularVelocity = 0; // rad/s
  var spinStartTime = 0;
  var winner = null;
  var confettiTimer = null;

  var COLORS = [
    "#D4A15A","#F0D7A1","#B8945A","#9A8663","#6c5ce7","#00b894","#fdcb6e","#0984e3","#ff6b6b","#a29bfe"
  ];

  function byId(id){ return document.getElementById(id); }

  function init(){
    canvas = byId('tombolaWheel');
    pointerEl = document.querySelector('.tombola-pointer');
    spinBtn = byId('tombolaSpinBtn');
    resetBtn = byId('tombolaResetBtn');
    statusEl = byId('tombolaStatus');
    probListEl = null;
    csvInput = null;
    loadDefaultBtn = null;
    simBtn = null;
    simResultEl = null;

    if (!canvas) return;
    ctx = canvas.getContext('2d');

    attachEvents();
    setStatus('Lade Tombola-Daten …');
    drawWheelPlaceholder();
    // Auto-load default CSV on init
    loadDefaultCsv();
  }

  function attachEvents(){
    if (spinBtn) spinBtn.addEventListener('click', onSpin);
    if (resetBtn) resetBtn.addEventListener('click', onReset);
    window.addEventListener('resize', redraw);
  }

  function setStatus(msg){ if (statusEl) { statusEl.textContent = msg; } }

  function drawWheelPlaceholder(){
    clearCanvas();
    var r = canvas.width/2;
    ctx.save();
    ctx.translate(r, r);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.arc(0,0,r*0.95,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#d4a15a';
    ctx.font = 'bold 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tombola', 0, -10);
    ctx.fillStyle = '#f5efe6';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('CSV laden, dann drehen', 0, 18);
    ctx.restore();
  }

  function clearCanvas(){ ctx.clearRect(0,0,canvas.width, canvas.height); }

  function parseCsv(text){
    // Handle BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    var lines = text.split(/\r?\n/).filter(function(l){ return l.trim().length>0; });
    if (!lines.length) return [];

    var header = lines[0].split(',').map(function(h){ return normalize(h); });
    var idxName = header.findIndex(function(h){ return h === 'name'; });
    var idxTombola = header.findIndex(function(h){ return h === 'tombola'; });
    // Fallback: try common capitalizations
    if (idxName === -1) idxName = header.findIndex(function(h){ return h.indexOf('name')>-1; });
    if (idxTombola === -1) idxTombola = header.findIndex(function(h){ return h.indexOf('tombola')>-1; });

    var map = Object.create(null);
    for (var i=1;i<lines.length;i++){
      var raw = lines[i];
      // skip comments
      if (/^#/.test(raw)) continue;
      var cols = safeSplitCsv(raw);
      if (!cols.length) continue;
      var n = cols[idxName] != null ? cols[idxName] : cols[0];
      var t = cols[idxTombola] != null ? cols[idxTombola] : cols[2];
      n = normalize(n);
      if (!n) continue;
      var tickets = toIntOrZero(t);
      if (!tickets) continue; // ignore 0/empty
      map[n] = (map[n] || 0) + tickets;
    }

    var out = Object.keys(map).map(function(name){ return { name: name, tickets: map[name] }; });
    // sort descending tickets, then name
    out.sort(function(a,b){ return b.tickets - a.tickets || a.name.localeCompare(b.name); });
    return out;
  }

  function safeSplitCsv(line){
    var arr = [];
    var cur = '';
    var inQ = false;
    for (var i=0;i<line.length;i++){
      var ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { arr.push(cur); cur=''; continue; }
      cur += ch;
    }
    arr.push(cur);
    return arr.map(function(s){ return trimQuotes(s); });
  }

  function trimQuotes(s){ s = String(s==null?'':s); s = s.trim(); if (s[0]==='"' && s[s.length-1]==='"') s = s.slice(1,-1); return s.trim(); }
  function normalize(s){ return trimQuotes(s).toLowerCase().replace(/\s+/g,' ').trim().replace(/^"|"$/g,''); }
  function toIntOrZero(v){ var n = parseInt(String(v).replace(/[^0-9-]/g,''),10); return isFinite(n) ? n : 0; }

  function buildArcs(){
    arcs = [];
    totalTickets = participants.reduce(function(acc,p){ return acc + p.tickets; }, 0);
    if (!totalTickets){ setStatus('Keine gültigen Tombola-Daten gefunden.'); drawWheelPlaceholder(); return; }
    var angle = 0; // radians
    for (var i=0;i<participants.length;i++){
      var p = participants[i];
      var slice = (p.tickets/totalTickets) * Math.PI*2;
      var color = COLORS[i % COLORS.length];
      arcs.push({ name: p.name, tickets: p.tickets, startAngle: angle, endAngle: angle + slice, color: color });
      angle += slice;
    }
    redraw();
    setStatus(participants.length + ' Teilnehmer · ' + totalTickets + ' Lose');
    if (spinBtn) spinBtn.disabled = false;
  }

  function redraw(){ if (!arcs.length) { drawWheelPlaceholder(); return; } drawWheel(rotation); }

  function drawWheel(rot){
    clearCanvas();
    var r = canvas.width/2;
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(rot);

    // wheel base
    ctx.beginPath();
    ctx.arc(0,0,r*0.98,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();

    for (var i=0;i<arcs.length;i++){
      var a = arcs[i];
      // slice
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0,r*0.95,a.startAngle,a.endAngle);
      ctx.closePath();
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      // label
      var mid = (a.startAngle + a.endAngle)/2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(r*0.6, 0);
      ctx.rotate(Math.PI/2);
      ctx.fillStyle = '#0a0805';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var label = a.name.toUpperCase();
      clipText(ctx, label, r*0.8, 14);
      ctx.restore();
    }

    // center cap
    ctx.beginPath();
    ctx.arc(0,0,r*0.1,0,Math.PI*2);
    ctx.fillStyle = '#d4a15a';
    ctx.fill();

    ctx.restore();
  }

  function clipText(ctx, text, maxWidth, fontPx){
    if (ctx.measureText(text).width <= maxWidth) { ctx.fillText(text,0,0); return; }
    var ell = '…';
    var lo = 0, hi = text.length;
    while (lo < hi){
      var mid = Math.ceil((lo+hi)/2);
      var s = text.slice(0, mid) + ell;
      if (ctx.measureText(s).width <= maxWidth) lo = mid; else hi = mid-1;
    }
    ctx.fillText(text.slice(0, lo) + ell, 0, 0);
  }

  function onCsvSelected(e){
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function(){
      try {
        participants = mergeDuplicates(parseCsv(String(reader.result)));
        if (!participants.length) { setStatus('Keine gültigen Einträge in Datei. Erwartet Spalten: Name, Tombola.'); drawWheelPlaceholder(); return; }
        rotation = 0; winner = null; stopConfetti();
        buildArcs();
      } catch(err){
        console.error(err);
        setStatus('Fehler beim Lesen der CSV: ' + err.message);
        drawWheelPlaceholder();
      }
    };
    reader.onerror = function(){ setStatus('Datei konnte nicht gelesen werden.'); };
    reader.readAsText(f);
  }

  function loadDefaultCsv(){
    var candidates = [
      './tickets/tombola.csv',
      './tickets/Käufe 25bd42a1faf580449071dfb28aa621fe_all.csv'
    ];

    fetchTextWithFallback(candidates)
      .then(function(text){
        participants = mergeDuplicates(parseCsv(text));
        if (!participants.length) { setStatus('Keine gültigen Einträge gefunden.'); drawWheelPlaceholder(); return; }
        rotation = 0; winner = null; stopConfetti();
        buildArcs();
        if (spinBtn) spinBtn.disabled = false;
      })
      .catch(function(err){ setStatus('CSV konnte nicht geladen werden: ' + err.message); });
  }

  function fetchTextWithFallback(urls){
    return new Promise(function(resolve, reject){
      var i = 0;
      function tryNext(){
        if (i >= urls.length) { reject(new Error('Keine CSV gefunden (' + urls.join(', ') + ')')); return; }
        var url = urls[i++];
        fetch(encodeURI(url), { cache: 'no-store' })
          .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
          .then(resolve)
          .catch(function(){ tryNext(); });
      }
      tryNext();
    });
  }

  function mergeDuplicates(list){
    var map = Object.create(null);
    list.forEach(function(p){ map[p.name] = (map[p.name] || 0) + p.tickets; });
    var out = Object.keys(map).map(function(n){ return { name: n, tickets: map[n] }; });
    out.sort(function(a,b){ return b.tickets - a.tickets || a.name.localeCompare(b.name); });
    return out;
  }

  function onSpin(){
    if (!arcs.length){ setStatus('Keine Daten geladen.'); return; }
    if (spinning) return;
    winner = null; stopConfetti();

    // Select weighted winner upfront and compute exact target angle so pointer stops on the winner.
    var selected = weightedDraw(participants);
    var targetArc = arcs.find(function(a){ return a.name === selected.name; }) || arcs[arcs.length-1];
    // Choose a landing angle within the arc (avoid edges for visual clarity)
    var mid = (targetArc.startAngle + targetArc.endAngle)/2;
    var margin = Math.min( (targetArc.endAngle - targetArc.startAngle) * 0.3, 0.25 );
    var landingAngle = clamp(mid + randRange(-margin, margin), targetArc.startAngle+0.02, targetArc.endAngle-0.02);

    // Pointer is fixed at -PI/2 (top). We need final rotation such that pointerAngle - rotation == landingAngle (mod 2PI)
    var pointerAngle = -Math.PI/2;
    var finalRotation = pointerAngle - landingAngle;
    // Add several full spins for drama
    var spins = 6 + Math.floor(Math.random()*3); // 6-8 spins
    finalRotation -= spins * Math.PI * 2;

    // Animate rotation from current rotation to finalRotation with ease-out
    var startRot = rotation;
    var delta = shortestAngularDelta(startRot, finalRotation);
    var duration = 10000; // 10s
    var start = performance.now();
    spinning = true;
    setStatus('Drehe…');

    function animate(){
      var now = performance.now();
      var t = Math.min(1, (now - start)/duration);
      var eased = 1 - Math.pow(1 - t, 3);
      rotation = startRot + delta * eased;
      redraw();
      if (t < 1) requestAnimationFrame(animate); else { spinning = false; winner = targetArc; finalizeWinner(); }
    }
    requestAnimationFrame(animate);
  }

  function stepSpin(duration, now){
    if (!spinning) return;
    var t = now || performance.now();
    var elapsed = t - spinStartTime;
    var progress = Math.min(1, elapsed / duration);
    // ease-out cubic for angular velocity decay
    var ease = 1 - Math.pow(1 - progress, 3);
    var currentVel = angularVelocity * (1 - ease);
    rotation += Math.max(0.002, currentVel/60); // integrate roughly per frame
    redraw();

    if (progress < 1) {
      requestAnimationFrame(stepSpin.bind(null, duration));
    } else {
      spinning = false;
      finalizeWinner();
    }
  }

  function finalizeWinner(){
    if (!winner){
      // fallback compute from current rotation if needed
      var pointerAngle = -Math.PI/2;
      var angle = (pointerAngle - rotation) % (Math.PI*2);
      if (angle < 0) angle += Math.PI*2;
      for (var i=0;i<arcs.length;i++){
        var a = arcs[i]; if (angle >= a.startAngle && angle < a.endAngle){ winner = a; break; }
      }
      if (!winner && arcs.length) winner = arcs[arcs.length-1];
    }
    setStatus('Gewinner: ' + formatName(winner.name) + ' (' + winner.tickets + ' Lose)');
    showWinnerOverlay(formatName(winner.name));
    startConfetti();
  }

  function formatName(n){ return n.replace(/\b\w/g, function(c){ return c.toUpperCase(); }); }

  function onReset(){
    spinning = false; angularVelocity = 0; rotation = 0; winner = null; stopConfetti();
    redraw();
    setStatus(participants.length ? (participants.length + ' Teilnehmer · ' + totalTickets + ' Lose') : 'Zurückgesetzt');
  }

  // Probabilities UI removed per requirements

  // Simulation removed per requirements

  function weightedDraw(list){
    var sum = 0; for (var i=0;i<list.length;i++) sum += list[i].tickets;
    var r = Math.random() * sum;
    var acc = 0;
    for (var j=0;j<list.length;j++){
      acc += list[j].tickets;
      if (r < acc) return list[j];
    }
    return list[list.length-1];
  }

  function shortestAngularDelta(from, to){
    var diff = (to - from) % (Math.PI*2);
    if (diff > Math.PI) diff -= Math.PI*2;
    if (diff < -Math.PI) diff += Math.PI*2;
    return diff;
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function showWinnerOverlay(name){
    var existing = document.querySelector('.tombola-winner');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.className = 'tombola-winner';
    el.textContent = name;
    document.body.appendChild(el);
    setTimeout(function(){ el.classList.add('visible'); }, 20);
    setTimeout(function(){ el.classList.remove('visible'); el.remove(); }, 6000);
  }

  function startConfetti(){
    stopConfetti();
    var count = 150;
    for (var i=0;i<count;i++) spawnConfetto();
    confettiTimer = setInterval(function(){ for (var i=0;i<20;i++) spawnConfetto(); }, 400);
    setTimeout(stopConfetti, 5000);
  }

  function stopConfetti(){ if (confettiTimer) { clearInterval(confettiTimer); confettiTimer=null; } var nodes = document.querySelectorAll('.confetto'); nodes.forEach(function(n){ n.remove(); }); }

  function spawnConfetto(){
    var c = document.createElement('div');
    c.className = 'confetto';
    c.style.left = Math.random()*100 + 'vw';
    c.style.backgroundColor = COLORS[Math.floor(Math.random()*COLORS.length)];
    c.style.transform = 'scale(' + (0.6 + Math.random()*0.8) + ')';
    document.body.appendChild(c);
    var dur = 3000 + Math.random()*2000;
    c.style.animationDuration = dur + 'ms';
    setTimeout(function(){ c.remove(); }, dur+100);
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); }); }
  function randRange(a,b){ return a + Math.random()*(b-a); }

  document.addEventListener('DOMContentLoaded', init);
})();
