(function() {
	// Year in footer
	var y = document.getElementById('y');
	if (y) y.textContent = new Date().getFullYear();

	// Countdown
	var cd = document.querySelector('[data-countdown]');
	if (cd) {
		var start = cd.getAttribute('data-start');
		var target = start ? new Date(start) : null;
		if (target) {
			function pad(n) { return String(n).padStart(2, '0'); }
			function tick() {
				var now = new Date();
				var diff = target.getTime() - now.getTime();
				if (diff < 0) diff = 0;
				var sec = Math.floor(diff / 1000);
				var days = Math.floor(sec / 86400); sec -= days * 86400;
				var hrs  = Math.floor(sec / 3600); sec -= hrs * 3600;
				var min  = Math.floor(sec / 60); sec -= min * 60;
				var dd = cd.querySelector('[data-dd]');
				var hh = cd.querySelector('[data-hh]');
				var mm = cd.querySelector('[data-mm]');
				var ss = cd.querySelector('[data-ss]');
				if (dd) dd.textContent = pad(days);
				if (hh) hh.textContent = pad(hrs);
				if (mm) mm.textContent = pad(min);
				if (ss) ss.textContent = pad(sec);
			}
			tick();
			setInterval(tick, 1000);
		}
	}

	// Reviews slider
	var sliderEl = document.querySelector('[data-reviews-slider]');
	if (sliderEl) {
		var track = sliderEl.querySelector('.reviews-track');
		var dotsEl = document.querySelector('[data-reviews-dots]');
		var index = 0;
		var groups = [];
		var autoTimer = null;
		var isDragging = false;
		var startX = 0;
		var currentX = 0;

		function buildGroups(reviews) {
			track.innerHTML = '';
			dotsEl.innerHTML = '';
			var perSlide = window.innerWidth < 768 ? 1 : 2;
			groups = [];
			for (var i = 0; i < reviews.length; i += perSlide) {
				var group = document.createElement('div');
				group.className = 'reviews-group';
				for (var j = i; j < i + perSlide && j < reviews.length; j++) {
					var r = reviews[j];
					var card = document.createElement('article');
					card.className = 'review-card';
					var stars = '★★★★★'.slice(0, r.rating);
					card.innerHTML = '<div class="stars">' + stars + '</div>' +
						'<blockquote>' + escapeHtml(r.text) + '</blockquote>' +
						'<div class="reviewer">' + escapeHtml(r.name) + ' · ' + r.rating + '/5</div>';
					group.appendChild(card);
				}
				track.appendChild(group);
				groups.push(group);
				var dot = document.createElement('button');
				dot.className = 'dot';
				dot.setAttribute('aria-label', 'Slide ' + (groups.length));
				dot.addEventListener('click', (function(idx){ return function(){ goTo(idx); resetAuto(); }; })(groups.length - 1));
				dotsEl.appendChild(dot);
			}
			goTo(0);
		}

		function goTo(i) {
			if (!groups.length) return;
			index = (i + groups.length) % groups.length;
			track.style.transform = 'translateX(' + (-index * 100) + '%)';
			var dots = dotsEl.querySelectorAll('.dot');
			for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('active', k === index);
		}

		function startAuto() { autoTimer = setInterval(function(){ goTo(index + 1); }, 6000); }
		function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
		function resetAuto() { stopAuto(); startAuto(); }

		function escapeHtml(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); }); }

		// Controls
		var prevBtn = document.querySelector('.reviews-nav.prev');
		var nextBtn = document.querySelector('.reviews-nav.next');
		if (prevBtn) prevBtn.addEventListener('click', function(){ goTo(index - 1); resetAuto(); });
		if (nextBtn) nextBtn.addEventListener('click', function(){ goTo(index + 1); resetAuto(); });
		document.addEventListener('keydown', function(e){ if (e.key === 'ArrowLeft') { goTo(index - 1); resetAuto(); } else if (e.key === 'ArrowRight') { goTo(index + 1); resetAuto(); } });

		// Drag / Swipe
		sliderEl.addEventListener('touchstart', function(e){ isDragging = true; startX = e.touches[0].clientX; currentX = startX; stopAuto(); });
		sliderEl.addEventListener('touchmove', function(e){ if (!isDragging) return; var diff = e.touches[0].clientX - startX; var offset = -index * 100 + (diff / sliderEl.offsetWidth) * 100; track.style.transform = 'translateX(' + offset + '%)'; });
		sliderEl.addEventListener('touchend', function(e){ if (!isDragging) return; isDragging = false; var diff = e.changedTouches[0].clientX - startX; var threshold = sliderEl.offsetWidth * 0.25; if (Math.abs(diff) > threshold) { diff > 0 ? goTo(index - 1) : goTo(index + 1); } else { goTo(index); } startAuto(); });
		sliderEl.addEventListener('mousedown', function(e){ isDragging = true; startX = e.clientX; currentX = startX; stopAuto(); sliderEl.style.cursor='grabbing'; });
		sliderEl.addEventListener('mousemove', function(e){ if (!isDragging) return; var diff = e.clientX - startX; var offset = -index * 100 + (diff / sliderEl.offsetWidth) * 100; track.style.transform = 'translateX(' + offset + '%)'; });
		sliderEl.addEventListener('mouseup', function(e){ if (!isDragging) return; isDragging=false; sliderEl.style.cursor='grab'; var diff = e.clientX - startX; var threshold = sliderEl.offsetWidth * 0.25; if (Math.abs(diff) > threshold) { diff > 0 ? goTo(index - 1) : goTo(index + 1); } else { goTo(index); } startAuto(); });
		sliderEl.addEventListener('mouseleave', function(){ if (isDragging) { isDragging=false; sliderEl.style.cursor='grab'; goTo(index); startAuto(); } });

		// Load reviews
		fetch('./assets/js/reviews.json').then(function(r){ return r.json(); }).then(function(list){ buildGroups(list); startAuto(); });
		window.addEventListener('resize', function(){ fetch('./assets/js/reviews.json').then(function(r){ return r.json(); }).then(function(list){ buildGroups(list); }); });
	}
})();

// Google Calendar Integration
function addToGoogleCalendar() {
  const event = {
    summary: 'Baumholz Home – The Last Chapter',
    description: 'Baumholz Home – The Last Chapter\n\nHausparty mit 3 Stages, Tombola und DJ Dome\n\nTickets: 15€ (Unlimited Bier/Aperol)\nZusätzliche Tombola Lose: 5€\n\nInstagram: @baumholz.home',
    location: 'Kürräckerstraße 10, 71409 Schwaikheim, Deutschland',
    start: {
      dateTime: '2025-09-13T19:00:00+02:00',
      timeZone: 'Europe/Berlin'
    },
    end: {
      dateTime: '2025-09-14T02:00:00+02:00',
      timeZone: 'Europe/Berlin'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 }
      ]
    }
  };

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.summary)}&dates=20250913T170000Z/20250914T000000Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
  
  window.open(calendarUrl, '_blank');
}

// Add event listener to calendar button
document.addEventListener('DOMContentLoaded', function() {
  const calendarBtn = document.querySelector('a[href="./assets/party.ics"]');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      addToGoogleCalendar();
    });
  }
});

// Review Popup System
function createReviewPopup() {
  const reviews = [
    {
      quote: "Das was Schwaikheim fehlte! Für Spaß, Unterhaltung und netter Gesellschaft ist hier gesorgt.",
      reviewer: "Jakob Mühlpointner",
      stars: 5
    },
    {
      quote: "Tolle Stimmung, im Keller habe ich mich gefühlt wie im Lehmann. Überall verrückte Vögel welche auf den Brutalen Beat der Anlage abgegangen sind.",
      reviewer: "Bene_dikt17",
      stars: 5
    },
    {
      quote: "Ein einzigartiges Erlebnis. Wer auf Abenteuer und neue Erfahrungen steht, ist herzlich willkommen.",
      reviewer: "Julian Slangen",
      stars: 5
    },
    {
      quote: "Ich würde diesen Ort mit 33 von 33 Sternen bewerten. Die Gastgeber waren sehr zuvorkommend.",
      reviewer: "Odin Schreiber",
      stars: 5
    },
    {
      quote: "Weltklasse!! Gastfreundschaft auf höchster Stufe und und um die Uhr geöffnet!!",
      reviewer: "Kübi",
      stars: 5
    }
  ];

  const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
  
  const popup = document.createElement('div');
  popup.className = 'review-popup';
  popup.innerHTML = `
    <div class="review-popup-content">
      <button class="review-popup-close" aria-label="Schließen">×</button>
      <div class="review-popup-header">
        <h3>Was andere sagen</h3>
        <div class="review-popup-stars">
          ${'★'.repeat(randomReview.stars)}
        </div>
      </div>
      <blockquote class="review-popup-quote">
        "${randomReview.quote}"
      </blockquote>
      <cite class="review-popup-reviewer">— ${randomReview.reviewer}</cite>
      <div class="review-popup-actions">
        <button class="btn btn-ghost review-popup-close-btn">Schließen</button>
        <button class="btn review-popup-write-btn">Ja, mach ich!</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Close functionality
  const closePopup = () => {
    popup.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 300);
  };

  popup.querySelector('.review-popup-close').addEventListener('click', closePopup);
  popup.querySelector('.review-popup-close-btn').addEventListener('click', closePopup);

  // Write review functionality
  popup.querySelector('.review-popup-write-btn').addEventListener('click', () => {
    const googleReviewUrl = 'https://www.google.com/search?sca_esv=0cad35c59d313fc9&rlz=1C5CHFA_enDE1156DE1156&biw=1652&bih=916&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-Ez7tBuSJudopwFXMsQc6eF2EIYw4FwHGZsbikYxEuSxSJUKoSFSVYOaIdJZU5AI6AjtPrK7AC2bdHdhGNKc3m1_cN7wX&q=Baumholz+Home+Reviews&sa=X&ved=2ahUKEwj7hPXRqZWPAxUx1gIHHaXRHWIQ0bkNegQIJBAC';
    window.open(googleReviewUrl, '_blank');
    closePopup();
  });

  // Auto-close after 10 seconds
  setTimeout(closePopup, 10000);
}

// Show review popup after 20 seconds
setTimeout(createReviewPopup, 20000);


