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
  var winner = null;
  var confettiTimer = null;
  var lastArcIndex = -1;
  var audioCtx = null; // WebAudio context for click sound
  var clickGain = null;
  var drumRollAudio = null; // Drum roll sound during spinning
  var celebrationAudio = null; // YAAAAAAAY sound for winner
  var drumRollDuration = 5000; // Default drum roll duration in ms
  var celebrationDuration = 3000; // Default celebration duration in ms

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

    // Initialize global tombola activity flag
    if (typeof window !== 'undefined' && typeof window.isTombolaActive === 'undefined') {
      window.isTombolaActive = false;
    }

    attachEvents();
    setStatus('Lade Tombola-Daten …');
    drawWheelPlaceholder();
    // Load audio files
    loadAudioFiles();
    // Auto-load default CSV on init
    loadDefaultCsv();
  }

  function attachEvents(){
    if (spinBtn) spinBtn.addEventListener('click', onSpin);
    if (resetBtn) resetBtn.addEventListener('click', onReset);
    window.addEventListener('resize', redraw);
  }

  function setTombolaActive(active){
    try {
      if (typeof window !== 'undefined') {
        window.isTombolaActive = !!active;
        if (active) {
          if (typeof window.stopAllSounds === 'function') window.stopAllSounds();
          if (typeof window.stopFloatingButtons === 'function') window.stopFloatingButtons();
          // Pause any page <audio>/<video>
          var media = document.querySelectorAll('audio, video');
          media.forEach(function(m){ try { m.pause(); } catch(e){} });
        } else {
          if (typeof window.startFloatingButtons === 'function') window.startFloatingButtons();
        }
      }
    } catch(e){ console.warn('setTombolaActive error', e); }
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
    setStatus('');
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

      // radial label inside wedge (from center outward)
      drawRadialLabelInWedge(ctx, a.name, a.startAngle, a.endAngle, r*0.18, r*0.92);
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

  // Draw name letters along the radius within the colored wedge
  function drawRadialLabelInWedge(ctx, text, startAngle, endAngle, innerR, outerR){
    if (!text) return;
    ctx.save();
    // Clip to wedge ring area so letters stay inside their slice
    ctx.beginPath();
    ctx.arc(0, 0, outerR, startAngle, endAngle);
    ctx.arc(0, 0, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.clip();

    var mid = (startAngle + endAngle) / 2;
    ctx.rotate(mid);
    ctx.fillStyle = '#0a0805';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var label = String(text).toUpperCase();
    var padding = 6; // inner/outer padding
    var available = Math.max(0, (outerR - innerR) - padding*2);
    if (available <= 0) { ctx.restore(); return; }
    var count = Math.max(1, label.length);
    var step = available / (count + 1);
    // Adapt font size to spacing; clamp for readability
    var fontSize = Math.min(14, Math.max(8, step * 0.9));
    ctx.font = 'bold ' + fontSize + 'px Inter, system-ui, sans-serif';

    var x = innerR + padding + step;
    for (var i=0; i<label.length; i++){
      ctx.fillText(label[i], x, 0);
      x += step;
      if (x > outerR - padding) break; // safety
    }

    ctx.restore();
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

  function ensureAudio(){
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      clickGain = audioCtx.createGain();
      clickGain.gain.value = 0.0;
      clickGain.connect(audioCtx.destination);
    } catch(e) { console.warn('AudioContext not available'); }
  }

  function loadAudioFiles(){
    // Load drum roll sound
    drumRollAudio = new Audio('./sounds/drum-roll.mp3');
    drumRollAudio.preload = 'auto';
    drumRollAudio.volume = 0.7;
    drumRollAudio.loop = false;
    
    // Load celebration sound
    celebrationAudio = new Audio('./sounds/yaaaaaaay.mp3');
    celebrationAudio.preload = 'auto';
    celebrationAudio.volume = 0.8;
    celebrationAudio.loop = false;
    
    // Get actual audio durations
    drumRollAudio.addEventListener('loadedmetadata', function(){
      drumRollDuration = drumRollAudio.duration * 1000; // Convert to ms
    });
    
    celebrationAudio.addEventListener('loadedmetadata', function(){
      celebrationDuration = celebrationAudio.duration * 1000; // Convert to ms
    });
  }

  function playDrumRoll(){
    if (!drumRollAudio) return;
    try {
      drumRollAudio.currentTime = 0;
      drumRollAudio.play().catch(function(e) { console.warn('Drum roll audio failed:', e); });
    } catch(e) { console.warn('Drum roll audio error:', e); }
  }

  function stopDrumRoll(){
    if (!drumRollAudio) return;
    try {
      drumRollAudio.pause();
      drumRollAudio.currentTime = 0;
      drumRollAudio.onended = null;
    } catch(e) { console.warn('Stop drum roll error:', e); }
  }

  function playCelebration(){
    if (!celebrationAudio) return;
    try {
      celebrationAudio.currentTime = 0;
      celebrationAudio.play().catch(function(e) { console.warn('Celebration audio failed:', e); });
    } catch(e) { console.warn('Celebration audio error:', e); }
  }

  function playClick(){
    if (!audioCtx) return;
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();
    osc.type = 'triangle';
    var base = 180 + Math.random()*140; // 180–320 Hz (deeper click)
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, base*0.6), now + 0.05);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.08);
  }

  function getArcIndexByAngle(angle){
    for (var i=0;i<arcs.length;i++){
      var a = arcs[i];
      if (angle >= a.startAngle && angle < a.endAngle) return i;
    }
    return arcs.length ? arcs.length-1 : -1;
  }

  function currentArc(){
    var pointerAngle = -Math.PI/2;
    var angle = (pointerAngle - rotation) % (Math.PI*2);
    if (angle < 0) angle += Math.PI*2;
    var idx = getArcIndexByAngle(angle);
    return { idx: idx, arc: (idx >=0 && arcs[idx]) ? arcs[idx] : null };
  }

  function handlePointerCrossing(){
    var cur = currentArc();
    if (cur.idx !== lastArcIndex){
      lastArcIndex = cur.idx;
      playClick();
    }
  }

  function onSpin(){
    ensureAudio();
    if (!arcs.length){ setStatus('Keine Daten geladen.'); return; }
    if (spinning) return;
    winner = null; stopConfetti();
    setTombolaActive(true);
    
    // Start drum roll sound
    playDrumRoll();

    spinning = true;
    lastArcIndex = -1;
    setStatus('Drehe…');

    var startTime = performance.now();
    var startRotation = rotation;
    var totalDuration = drumRollDuration; // Use actual audio duration
    
    // Random number of spins (3-8 full rotations)
    var totalSpins = 3 + Math.random() * 5;
    var finalRotation = startRotation - (totalSpins * Math.PI * 2);
    
    // Add random offset to make it truly random where it lands
    finalRotation += (Math.random() - 0.5) * Math.PI * 2;

    var rafId = 0;
    function animate(){
      var now = performance.now();
      var elapsed = now - startTime;
      var progress = Math.min(1, elapsed / totalDuration);
      
      // Ease-out cubic for smooth deceleration
      var eased = 1 - Math.pow(1 - progress, 3);
      
      // Calculate current rotation
      rotation = startRotation + (finalRotation - startRotation) * eased;
      
      redraw();
      updateLiveName();
      handlePointerCrossing();
      
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Spinning finished - determine winner from actual final position
        rotation = finalRotation;
        var cur = currentArc();
        winner = cur.arc;
        spinning = false;
        finalizeWinner();
      }
    }
    
    rafId = requestAnimationFrame(animate);

    // Safety: if audio ends earlier/later than metadata, finish exactly on audio end
    if (drumRollAudio){
      drumRollAudio.onended = function(){
        if (!spinning) return;
        // Force final frame and finalize
        cancelAnimationFrame(rafId);
        rotation = finalRotation;
        redraw();
        var cur = currentArc();
        winner = cur.arc;
        spinning = false;
        finalizeWinner();
      };
    }
  }


  function finalizeWinner(){
    // Always derive winner from current rotation to match live display
    var cur = currentArc();
    winner = cur.arc || winner;
    
    // Stop drum roll and play celebration sound
    stopDrumRoll();
    playCelebration();
    // Re-enable other sounds after celebration ends
    if (celebrationAudio){
      celebrationAudio.onended = function(){ setTombolaActive(false); };
      // Fallback timeout in case onended doesn't fire
      if (celebrationDuration && isFinite(celebrationDuration)) {
        setTimeout(function(){ setTombolaActive(false); }, celebrationDuration + 200);
      }
    } else {
      setTombolaActive(false);
    }
    
    setStatus('Gewinner: ' + formatName(winner.name));
    showWinnerOverlay(formatName(winner.name));
    startConfetti();
  }

  // Live display of current pointer name (per frame)
  function updateLiveName(){
    var nameEl = document.getElementById('tombolaLiveName');
    if (!nameEl || !arcs.length) return;
    var cur = currentArc();
    if (!cur.arc) return;
    nameEl.textContent = formatName(cur.arc.name);
  }

  function formatName(n){ return n.replace(/\b\w/g, function(c){ return c.toUpperCase(); }); }

  function onReset(){
    spinning = false; rotation = 0; winner = null; stopConfetti();
    stopDrumRoll(); // Stop any playing drum roll
    setTombolaActive(false);
    redraw();
    setStatus('Zurückgesetzt');
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
