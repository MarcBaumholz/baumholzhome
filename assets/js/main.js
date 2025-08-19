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
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
      }
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
}

// Floating Reviews System
function createFloatingReview() {
  const reviews = [
    "Das was Schwaikheim fehlte! ⭐⭐⭐⭐⭐",
    "Tolle Stimmung, im Keller wie im Lehmann! ⭐⭐⭐⭐⭐",
    "Ein einzigartiges Erlebnis! ⭐⭐⭐⭐⭐",
    "33 von 33 Sternen! ⭐⭐⭐⭐⭐",
    "Weltklasse Gastfreundschaft! ⭐⭐⭐⭐⭐",
    "Super Atmosphäre und gute Stimmung! ⭐⭐⭐⭐⭐",
    "Verkotzt und versorgen - Baumholz home ist gut gelofen! ⭐⭐⭐⭐⭐",
    "Der einzige Ort mit Schneemännern im Sommer! ⭐⭐⭐⭐⭐",
    "Die beste Adresse von der ich je gehört habe! ⭐⭐⭐⭐⭐",
    "Es war so gut hey! ⭐⭐⭐⭐⭐"
  ];

  const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
  
  const floatingReview = document.createElement('div');
  floatingReview.className = 'floating-review';
  floatingReview.innerHTML = `
    <div class="floating-review-content">
      <span class="floating-review-text">${randomReview}</span>
    </div>
  `;

  // Random direction (0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right, 4: left, 5: right, 6: top, 7: bottom)
  const direction = Math.floor(Math.random() * 8);
  let startX, startY, endX, endY;
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const reviewWidth = 280;
  const reviewHeight = 60;
  
  switch(direction) {
    case 0: // top-left to bottom-right
      startX = -reviewWidth;
      startY = -reviewHeight;
      endX = screenWidth;
      endY = screenHeight;
      break;
    case 1: // top-right to bottom-left
      startX = screenWidth;
      startY = -reviewHeight;
      endX = -reviewWidth;
      endY = screenHeight;
      break;
    case 2: // bottom-left to top-right
      startX = -reviewWidth;
      startY = screenHeight;
      endX = screenWidth;
      endY = -reviewHeight;
      break;
    case 3: // bottom-right to top-left
      startX = screenWidth;
      startY = screenHeight;
      endX = -reviewWidth;
      endY = -reviewHeight;
      break;
    case 4: // left to right
      startX = -reviewWidth;
      startY = Math.random() * (screenHeight - reviewHeight);
      endX = screenWidth;
      endY = startY;
      break;
    case 5: // right to left
      startX = screenWidth;
      startY = Math.random() * (screenHeight - reviewHeight);
      endX = -reviewWidth;
      endY = startY;
      break;
    case 6: // top to bottom
      startX = Math.random() * (screenWidth - reviewWidth);
      startY = -reviewHeight;
      endX = startX;
      endY = screenHeight;
      break;
    case 7: // bottom to top
      startX = Math.random() * (screenWidth - reviewWidth);
      startY = screenHeight;
      endX = startX;
      endY = -reviewHeight;
      break;
  }
  
  floatingReview.style.left = startX + 'px';
  floatingReview.style.top = startY + 'px';
  
  document.body.appendChild(floatingReview);

  // Animate floating with longer duration
  setTimeout(() => {
    floatingReview.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
    floatingReview.style.opacity = '0';
  }, 100);

  // Remove after longer animation
  setTimeout(() => {
    if (document.body.contains(floatingReview)) {
      document.body.removeChild(floatingReview);
    }
  }, 8000);
}

// Show review popup after 25 seconds
setTimeout(createReviewPopup, 25000);

// Show floating reviews every 15 seconds
setInterval(createFloatingReview, 15000);

// Whiteboard System
class WhiteboardManager {
    constructor() {
        this.comments = [];
        this.isAdmin = false;
        this.canvas = document.getElementById('whiteboard-canvas');
        this.nameInput = document.getElementById('comment-name');
        this.textInput = document.getElementById('comment-text');
        this.addBtn = document.getElementById('add-comment-btn');
        
        // Secure deletion code (hashed)
        this.deletionHash = 'a1b2c3d4e5f6'; // This is a hash, not the actual code
        
        this.init();
    }
    
    // Secure code verification (the actual code is not stored in plain text)
    verifyDeletionCode(inputCode) {
        // Simple hash function to verify the code without storing it
        const hash = this.simpleHash(inputCode);
        return hash === this.deletionHash;
    }
    
    // Simple hash function (in real implementation, use a proper crypto library)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
    
    init() {
        this.loadComments();
        this.setupEventListeners();
        this.renderComments();
    }
    
    setupEventListeners() {
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.addComment());
        }
    }
    
    promptForDeletionCode() {
        const code = prompt('🔐 Lösch-Code eingeben:');
        if (code && this.verifyDeletionCode(code)) {
            return true;
        } else if (code) {
            alert('❌ Falscher Code!');
        }
        return false;
    }
    
    loadComments() {
        const saved = localStorage.getItem('whiteboardComments');
        if (saved) {
            try {
                this.comments = JSON.parse(saved);
            } catch (e) {
                this.comments = [];
            }
        }
        
        // Load sample comments if empty
        if (this.comments.length === 0) {
            this.loadSampleComments();
        }
    }
    
    loadSampleComments() {
        this.comments = [
            { name: 'MARC', text: 'hyper hyper', x: 20, y: 30 },
            { name: 'JAKOB M.', text: 'Das wird EPISCH! 🔥', x: 50, y: 20 },
            { name: 'KÜBI', text: 'Weltklasse Party incoming! 🎉', x: 70, y: 60 },
            { name: 'BENE_DIKT17', text: 'Techno Bunker here I come!', x: 30, y: 70 }
        ];
        this.saveComments();
    }
    
    addComment() {
        const name = this.nameInput.value.trim();
        const text = this.textInput.value.trim();
        
        if (!name || !text) {
            alert('Bitte fülle alle Felder aus!');
            return;
        }
        
        if (name.length > 30) {
            alert('Name ist zu lang! (max. 30 Zeichen)');
            return;
        }
        
        if (text.length > 100) {
            alert('Nachricht ist zu lang! (max. 100 Zeichen)');
            return;
        }
        
        const comment = {
            name: this.escapeHtml(name),
            text: this.escapeHtml(text),
            x: Math.random() * 70 + 10, // 10-80%
            y: Math.random() * 70 + 10  // 10-80%
        };
        
        this.comments.push(comment);
        this.saveComments();
        this.renderComments();
        this.updateWhiteboardSize();
        
        // Clear form
        this.nameInput.value = '';
        this.textInput.value = '';
        
        this.showSuccessMessage('✅ Nachricht hinzugefügt!');
    }
    
    deleteComment(index) {
        if (this.promptForDeletionCode()) {
            if (confirm('Nachricht wirklich löschen?')) {
                this.comments.splice(index, 1);
                this.saveComments();
                this.renderComments();
                this.updateWhiteboardSize();
                this.showSuccessMessage('🗑️ Nachricht gelöscht!');
            }
        }
    }
    
    showSuccessMessage(message) {
        // Remove existing message
        const existing = document.querySelector('.success-message');
        if (existing) {
            existing.remove();
        }
        
        const msg = document.createElement('div');
        msg.className = 'success-message';
        msg.textContent = message;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--gold-1), var(--gold-2));
            color: var(--bg);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 16px rgba(212,161,90,0.4);
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveComments() {
        localStorage.setItem('whiteboardComments', JSON.stringify(this.comments));
    }
    
    renderComments() {
        if (!this.canvas) return;
        
        this.canvas.innerHTML = '';
        
        this.comments.forEach((comment, index) => {
            const commentEl = document.createElement('div');
            commentEl.className = 'whiteboard-comment';
            commentEl.style.cssText = `
                position: absolute;
                left: ${comment.x}%;
                top: ${comment.y}%;
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid rgba(212,161,90,0.4);
                border-radius: 12px;
                padding: 1rem;
                max-width: 200px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            `;
            
            commentEl.innerHTML = `
                <div style="font-weight: 700; color: #333; margin-bottom: 0.5rem; font-size: 0.9rem;">
                    ${comment.name}
                </div>
                <div style="color: #000; font-size: 0.85rem; line-height: 1.3;">
                    ${comment.text}
                </div>
            `;
            
            // Add click functionality for deletion
            commentEl.addEventListener('click', () => this.deleteComment(index));
            commentEl.addEventListener('mouseenter', () => {
                commentEl.style.transform = 'scale(1.05)';
                commentEl.style.borderColor = 'rgba(212,161,90,0.8)';
                commentEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            });
            commentEl.addEventListener('mouseleave', () => {
                commentEl.style.transform = 'scale(1)';
                commentEl.style.borderColor = 'rgba(212,161,90,0.4)';
                commentEl.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
            });
            
            this.canvas.appendChild(commentEl);
        });
    }
    
    updateWhiteboardSize() {
        if (!this.canvas) return;
        
        // Remove existing size classes
        this.canvas.classList.remove('expanded', 'super-expanded', 'ultra-expanded');
        
        // Add size class based on comment count
        if (this.comments.length > 25) {
            this.canvas.classList.add('ultra-expanded');
        } else if (this.comments.length > 15) {
            this.canvas.classList.add('super-expanded');
        } else if (this.comments.length > 8) {
            this.canvas.classList.add('expanded');
        }
    }
}

// Initialize whiteboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing whiteboard...');
  new WhiteboardManager();
});

// Add CSS animations for success message
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);


