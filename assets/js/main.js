(function() {
	// Year in footer
	var y = document.getElementById('y');
	if (y) y.textContent = new Date().getFullYear();

	// Countdown
	var cd = document.querySelector('[data-countdown]');
	if (cd) {
		var start = cd.getAttribute('data-start');
		var target = start ? new Date(start) : null;
		console.log('Countdown target date:', target);
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
  // Load all reviews from JSON file
  fetch('./assets/js/reviews.json')
    .then(response => response.json())
    .then(reviews => {
      // Filter out reviews with empty text
      const validReviews = reviews.filter(review => review.text && review.text.trim() !== '' && review.text !== '—');
      
      if (validReviews.length === 0) {
        console.log('No valid reviews found');
        return;
      }
      
      const randomReview = validReviews[Math.floor(Math.random() * validReviews.length)];
      
      const popup = document.createElement('div');
      popup.className = 'review-popup';
      popup.innerHTML = `
        <div class="review-popup-content">
          <button class="review-popup-close" aria-label="Schließen">×</button>
          <div class="review-popup-header">
            <h3>Was andere sagen</h3>
            <div class="review-popup-stars">
              ${'★'.repeat(randomReview.rating)}
            </div>
          </div>
          <blockquote class="review-popup-quote">
            "${randomReview.text}"
          </blockquote>
          <cite class="review-popup-reviewer">— ${randomReview.name}</cite>
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
    })
    .catch(error => {
      console.error('Error loading reviews:', error);
    });
}

// Floating Reviews System
function createFloatingReview() {
  // Load all reviews from JSON file
  fetch('./assets/js/reviews.json')
    .then(response => response.json())
    .then(reviews => {
      // Filter out reviews with empty text and create floating review text
      const validReviews = reviews.filter(review => review.text && review.text.trim() !== '' && review.text !== '—');
      
      if (validReviews.length === 0) {
        console.log('No valid reviews found for floating reviews');
        return;
      }
      
      const randomReview = validReviews[Math.floor(Math.random() * validReviews.length)];
      const reviewText = randomReview.text.length > 50 ? randomReview.text.substring(0, 50) + '...' : randomReview.text;
      const floatingText = `${reviewText} ⭐⭐⭐⭐⭐`;
      
      const floatingReview = document.createElement('div');
      floatingReview.className = 'floating-review';
      floatingReview.innerHTML = `
        <div class="floating-review-content">
          <span class="floating-review-text">${floatingText}</span>
        </div>
      `;
      
      // Random start position (8 different directions)
      const directions = [
        { start: { x: -20, y: 20 }, end: { x: 120, y: 80 } },   // Top-left to bottom-right
        { start: { x: 120, y: 20 }, end: { x: -20, y: 80 } },   // Top-right to bottom-left
        { start: { x: 50, y: -20 }, end: { x: 50, y: 120 } },   // Top to bottom
        { start: { x: 50, y: 120 }, end: { x: 50, y: -20 } },   // Bottom to top
        { start: { x: -20, y: 50 }, end: { x: 120, y: 50 } },   // Left to right
        { start: { x: 120, y: 50 }, end: { x: -20, y: 50 } },   // Right to left
        { start: { x: 20, y: 20 }, end: { x: 80, y: 80 } },     // Top-left to bottom-right (diagonal)
        { start: { x: 80, y: 20 }, end: { x: 20, y: 80 } }      // Top-right to bottom-left (diagonal)
      ];
      
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      floatingReview.style.cssText = `
        position: fixed;
        left: ${direction.start.x}vw;
        top: ${direction.start.y}vh;
        z-index: 1000;
        pointer-events: none;
        transition: all 7s ease-in-out;
      `;
      
      document.body.appendChild(floatingReview);
      
      // Animate to end position
      setTimeout(() => {
        floatingReview.style.left = `${direction.end.x}vw`;
        floatingReview.style.top = `${direction.end.y}vh`;
      }, 100);
      
      // Remove after animation
      setTimeout(() => {
        if (document.body.contains(floatingReview)) {
          document.body.removeChild(floatingReview);
        }
      }, 8000);
    })
    .catch(error => {
      console.error('Error loading reviews for floating reviews:', error);
    });
}

// Show review popup every minute
    setInterval(createReviewPopup, 90000);

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
        
        // IP-based rate limiting
        this.userIPs = JSON.parse(localStorage.getItem('whiteboardUserIPs') || '{}');
        this.currentIP = this.getUserIP();
        
        this.init();
    }
    
    // Get user IP (simplified - in production use a proper IP service)
    getUserIP() {
        // For demo purposes, use a combination of user agent and screen resolution
        // In production, you'd want to use a proper IP detection service
        const userAgent = navigator.userAgent;
        const screenRes = `${screen.width}x${screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Create a pseudo-unique identifier
        return btoa(`${userAgent}-${screenRes}-${timezone}`).substring(0, 16);
    }
    
    // Check if user can post (24-hour limit)
    canUserPost() {
        const now = Date.now();
        const lastPost = this.userIPs[this.currentIP];
        
        if (!lastPost) {
            return true; // First time posting
        }
        
        const hoursSinceLastPost = (now - lastPost) / (1000 * 60 * 60);
        return hoursSinceLastPost >= 24;
    }
    
    // Get time until user can post again
    getTimeUntilNextPost() {
        const now = Date.now();
        const lastPost = this.userIPs[this.currentIP];
        
        if (!lastPost) {
            return 0; // Can post immediately
        }
        
        const hoursSinceLastPost = (now - lastPost) / (1000 * 60 * 60);
        const hoursRemaining = Math.max(0, 24 - hoursSinceLastPost);
        
        if (hoursRemaining < 1) {
            const minutesRemaining = Math.ceil(hoursRemaining * 60);
            return `${minutesRemaining} Minuten`;
        } else {
            const hours = Math.floor(hoursRemaining);
            const minutes = Math.ceil((hoursRemaining - hours) * 60);
            return `${hours} Stunden ${minutes} Minuten`;
        }
    }
    
    // Save user post time
    saveUserPostTime() {
        this.userIPs[this.currentIP] = Date.now();
        localStorage.setItem('whiteboardUserIPs', JSON.stringify(this.userIPs));
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
        this.clearOldData(); // Clear any old unwanted data
        this.loadComments();
        this.setupEventListeners();
        this.renderComments();
        this.updatePostingStatus();
    }
    
    clearOldData() {
        // Clear any old unwanted comments from localStorage
        const saved = localStorage.getItem('whiteboardComments');
        if (saved) {
            try {
                const oldComments = JSON.parse(saved);
                const unwantedNames = ['sad', 'assa', 'asdasd', 'asdfadsd'];
                const unwantedTexts = ['sad', '213123', '34234', 'assa', 'asdasd', 'asdfadsd'];
                
                const hasUnwanted = oldComments.some(comment => 
                    unwantedNames.includes(comment.name) || 
                    unwantedTexts.includes(comment.text)
                );
                
                if (hasUnwanted) {
                    // Clear all whiteboard data and start fresh
                    localStorage.removeItem('whiteboardComments');
                    console.log('Cleared old unwanted whiteboard data');
                }
            } catch (e) {
                console.error('Error checking old data:', e);
            }
        }
    }
    
    updatePostingStatus() {
        const statusEl = document.getElementById('posting-status');
        if (!statusEl) return;
        
        if (this.canUserPost()) {
            statusEl.textContent = '✅ Du kannst einen Kommentar schreiben';
            statusEl.className = 'posting-status can-post';
        } else {
            const timeRemaining = this.getTimeUntilNextPost();
            statusEl.textContent = `⏰ Du kannst in ${timeRemaining} wieder kommentieren`;
            statusEl.className = 'posting-status cannot-post';
        }
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
                // Filter out unwanted old comments
                this.comments = this.comments.filter(comment => {
                    const unwantedNames = ['sad', 'assa', 'asdasd', 'asdfadsd'];
                    const unwantedTexts = ['sad', '213123', '34234', 'assa', 'asdasd', 'asdfadsd'];
                    
                    return !unwantedNames.includes(comment.name) && 
                           !unwantedTexts.includes(comment.text);
                });
            } catch (e) {
                console.error('Error loading comments:', e);
                this.comments = [];
            }
        }
        
        if (this.comments.length === 0) {
            this.loadSampleComments();
        }
    }
    
    loadSampleComments() {
        this.comments = [
            { name: 'MARC', text: 'hyper hyper', x: 20, y: 30 },
            { name: 'JAKOB M.', text: 'Das wird EPISCH! 🔥', x: 50, y: 20 },
            { name: 'KÜBI', text: 'Weltklasse Party incoming! 🎉', x: 70, y: 60 },
            { name: 'BENE_DIKT17', text: 'Techno Bunker here I come!', x: 30, y: 70 },
            { name: 'ODIN S.', text: '33 von 33 Sternen! ⭐', x: 60, y: 40 }
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
        
        // Check rate limiting
        if (!this.canUserPost()) {
            const timeRemaining = this.getTimeUntilNextPost();
            alert(`⏰ Du kannst nur alle 24 Stunden einen Kommentar schreiben.\n\nBitte warte noch ${timeRemaining} bis zu deinem nächsten Kommentar.`);
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
        
        // Save user post time after successful post
        this.saveUserPostTime();
        
        // Clear form
        this.nameInput.value = '';
        this.textInput.value = '';
        
        // Update posting status
        this.updatePostingStatus();
        
        this.showSuccessMessage('✅ Nachricht hinzugefügt! Du kannst in 24 Stunden wieder kommentieren.');
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
                <div style="font-weight: 800; color: #000; margin-bottom: 0.5rem; font-size: 0.95rem; text-shadow: none;">
                    ${comment.name}
                </div>
                <div style="color: #000; font-size: 0.9rem; line-height: 1.4; font-weight: 500; text-shadow: none;">
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

// Scroll to top function - Fixed
function scrollToTop() {
    // Prevent default link behavior
    event.preventDefault();
    
    // Smooth scroll to top with better compatibility
    if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        // Fallback for older browsers
        const scrollStep = -window.scrollY / (500 / 15);
        const scrollInterval = setInterval(() => {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep);
            } else {
                clearInterval(scrollInterval);
            }
        }, 15);
    }
    
    return false;
}

// Mobile optimization improvements
document.addEventListener('DOMContentLoaded', function() {
    // Add mobile-specific optimizations
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Improve touch targets for mobile
        const touchTargets = document.querySelectorAll('a, button, .btn, .nav a, .footer-link');
        touchTargets.forEach(target => {
            target.style.minHeight = '44px';
            target.style.minWidth = '44px';
        });
        
        // Improve scrolling performance
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // Initialize existing functionality
    if (typeof initReviewsSlider === 'function') {
        initReviewsSlider();
    }
    
    if (typeof initWhiteboard === 'function') {
        initWhiteboard();
    }
    
    if (typeof initReviewPopup === 'function') {
        initReviewPopup();
    }
    
    if (typeof initFloatingReviews === 'function') {
        initFloatingReviews();
    }
});

// Meme Carousel System
class MemeCarouselManager {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 50; // Total number of meme slides (all memes from folder)
        this.autoAdvanceInterval = null;
        this.modalCurrentSlide = 0;
        
        this.init();
    }
    
    init() {
        this.setupCarousel();
        this.createDots();
        this.setupModal();
        this.startAutoAdvance();
    }
    
    setupCarousel() {
        const prevBtn = document.querySelector('.carousel-nav.prev');
        const nextBtn = document.querySelector('.carousel-nav.next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Touch/swipe support
        const track = document.querySelector('.carousel-track');
        if (track) {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            
            track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                this.stopAutoAdvance();
            });
            
            track.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                const diff = startX - currentX;
                const threshold = 50;
                
                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                    isDragging = false;
                }
            });
            
            track.addEventListener('touchend', () => {
                isDragging = false;
                this.startAutoAdvance();
            });
        }
    }
    
    setupModal() {
        const modal = document.getElementById('memeModal');
        const closeBtn = document.querySelector('.modal-close');
        const overlay = document.querySelector('.modal-overlay');
        const prevBtn = document.querySelector('.modal-prev');
        const nextBtn = document.querySelector('.modal-next');
        
        // Add click handlers to all meme cards
        const memeCards = document.querySelectorAll('.meme-card');
        memeCards.forEach((card, index) => {
            card.addEventListener('click', () => this.openModal(index));
        });
        
        // Modal controls
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (overlay) overlay.addEventListener('click', () => this.closeModal());
        if (prevBtn) prevBtn.addEventListener('click', () => this.modalPrevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.modalNextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.modalPrevSlide();
                    break;
                case 'ArrowRight':
                    this.modalNextSlide();
                    break;
            }
        });
    }
    
    openModal(slideIndex) {
        this.modalCurrentSlide = slideIndex;
        const modal = document.getElementById('memeModal');
        const modalImage = document.getElementById('modalImage');
        const modalVideo = document.getElementById('modalVideo');
        const modalCaption = document.getElementById('modalCaption');
        
        // Get the clicked meme data
        const slides = document.querySelectorAll('.carousel-slide');
        const currentSlide = slides[slideIndex];
        if (!currentSlide) return;
        
        const memeCard = currentSlide.querySelector('.meme-card');
        const img = memeCard.querySelector('.meme-image');
        const video = memeCard.querySelector('.meme-video');
        const caption = memeCard.querySelector('.meme-caption');
        
        if (img) {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalImage.style.display = 'block';
            modalVideo.style.display = 'none';
        } else if (video) {
            modalVideo.src = video.querySelector('source').src;
            modalVideo.style.display = 'block';
            modalImage.style.display = 'none';
        }
        
        if (caption) {
            modalCaption.textContent = caption.textContent;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        const modal = document.getElementById('memeModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Pause video if playing
        const modalVideo = document.getElementById('modalVideo');
        if (modalVideo) {
            modalVideo.pause();
        }
    }
    
    modalPrevSlide() {
        this.modalCurrentSlide = (this.modalCurrentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateModalContent();
    }
    
    modalNextSlide() {
        this.modalCurrentSlide = (this.modalCurrentSlide + 1) % this.totalSlides;
        this.updateModalContent();
    }
    
    updateModalContent() {
        const modalImage = document.getElementById('modalImage');
        const modalVideo = document.getElementById('modalVideo');
        const modalCaption = document.getElementById('modalCaption');
        
        // Get the current slide data
        const slides = document.querySelectorAll('.carousel-slide');
        const currentSlide = slides[this.modalCurrentSlide];
        if (!currentSlide) return;
        
        const memeCard = currentSlide.querySelector('.meme-card');
        const img = memeCard.querySelector('.meme-image');
        const video = memeCard.querySelector('.meme-video');
        const caption = memeCard.querySelector('.meme-caption');
        
        if (img) {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalImage.style.display = 'block';
            modalVideo.style.display = 'none';
        } else if (video) {
            modalVideo.src = video.querySelector('source').src;
            modalVideo.style.display = 'block';
            modalImage.style.display = 'none';
        }
        
        if (caption) {
            modalCaption.textContent = caption.textContent;
        }
    }
    
    createDots() {
        const dotsContainer = document.querySelector('.carousel-dots');
        if (!dotsContainer) return;
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        this.restartAutoAdvance();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
        this.restartAutoAdvance();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
        this.restartAutoAdvance();
    }
    
    updateCarousel() {
        const track = document.querySelector('.carousel-track');
        const dots = document.querySelectorAll('.carousel-dot');
        
        if (track) {
            const slideWidth = 300 + 16; // slide width + gap (updated for better display)
            const translateX = -this.currentSlide * slideWidth;
            track.style.transform = `translateX(${translateX}px)`;
        }
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    startAutoAdvance() {
        this.autoAdvanceInterval = setInterval(() => {
            this.nextSlide();
        }, 4000); // 4 seconds per slide
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
    
    restartAutoAdvance() {
        this.stopAutoAdvance();
        this.startAutoAdvance();
    }
}

// Initialize meme carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new MemeCarouselManager();
});

// Sound Button System - Myinstants.com style
var soundCache = {};
var isPlaying = false;

function playSound(soundName) {
    // Get the button element for visual feedback
    const button = document.querySelector(`[data-sound="${soundName}"]`);
    if (button) {
        button.classList.add('loading');
    }

    // Create audio element if not cached
    if (!soundCache[soundName]) {
        soundCache[soundName] = new Audio(`./sounds/${soundName}.mp3`);
        soundCache[soundName].volume = 0.7;
        soundCache[soundName].preload = 'auto';
        
        // Handle audio end
        soundCache[soundName].onended = function() {
            isPlaying = false;
            if (button) {
                button.classList.remove('playing', 'loading');
            }
        };
        
        // Handle audio error
        soundCache[soundName].onerror = function() {
            console.warn(`Sound file not found: ${soundName}.mp3`);
            isPlaying = false;
            if (button) {
                button.classList.remove('loading');
                // Show a brief error indication
                button.style.backgroundColor = '#ff4444';
                setTimeout(() => {
                    button.style.backgroundColor = '';
                }, 1000);
            }
        };
    }

    // Stop any currently playing sound
    if (isPlaying) {
        stopAllSounds();
    }

    // Play the sound
    try {
        soundCache[soundName].currentTime = 0; // Reset to beginning
        soundCache[soundName].play().then(() => {
            isPlaying = true;
            console.log(`🎵 Playing sound: ${soundName}`);
            if (button) {
                button.classList.remove('loading');
                button.classList.add('playing');
            }
        }).catch(error => {
            console.warn(`Could not play sound: ${soundName}`, error);
            isPlaying = false;
            if (button) {
                button.classList.remove('loading');
                // Show a brief error indication
                button.style.backgroundColor = '#ff4444';
                setTimeout(() => {
                    button.style.backgroundColor = '';
                }, 1000);
            }
        });
    } catch (error) {
        console.warn(`Error playing sound: ${soundName}`, error);
        isPlaying = false;
        if (button) {
            button.classList.remove('loading');
        }
    }
}

function stopAllSounds() {
    // Stop all currently playing sounds
    Object.values(soundCache).forEach(audio => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
    
    // Reset all button states
    document.querySelectorAll('.sound-btn').forEach(button => {
        button.classList.remove('playing', 'loading');
        button.style.backgroundColor = '';
    });
    
    isPlaying = false;
    console.log('🛑 All sounds stopped');
}

// Floating Sound Buttons System
var floatingButtons = [];
var floatingButtonInterval;
var isFloatingEnabled = true;

// List of available sounds for floating buttons (only working sounds)
var floatingSoundList = [
    'vine-boom', 'bruh', 'sven', 'ralf-schumacher', 'was-geht-yallah',
    'neggaz', 'clash-royale', 'wecker-laut', 'ching-cheng', 'handy-ran',
    'fart', 'backfisch', 'helmut', 'klingelton', 'garmin', 'halts-maul',
    'rizz', 'among-us', 'nebenrisiken', 'max-kacken', 'aura-farming',
    'schnitzel', 'fortnite', 'brainrot', 'spongebob', 'apple-pay',
    'phone-ringing', 'eiermann', 'jet2', 'mortis', 'galaxy', 
    'clash-royale-deep', 'ralf-willst-du',
    // New meme sounds
    'emotional-damage', 'baby-laughing', 'cat-laugh', 'oh-my-god-bro',
    'run-vine', 'clash-royale-hog-rider', 'he-he-he-ha-clash-royale-deep',
    'goku-drip', 'explosion-meme', 'windows-xp-shutdown', 'minecraft-eating',
    'minecraft-hurt', 'fart-with-reverb', 'fart-meme-better', 'buzzer',
    'rizzbot-laugh', 'oh-my-god-meme', 'confused-kitten', 'max-verstappen'
];

function createFloatingButton() {
    if (!isFloatingEnabled) return;
    
    // Allow up to 2 buttons at once (increased from 3)
    if (floatingButtons.length >= 2) return;
    
    // Random sound selection
    var randomSound = floatingSoundList[Math.floor(Math.random() * floatingSoundList.length)];
    
    // Create button element
    var button = document.createElement('button');
    button.className = 'floating-sound-btn';
    button.setAttribute('data-sound', randomSound);
    button.onclick = function() {
        playSound(randomSound);
        removeFloatingButton(button);
    };
    
    // Random position (avoid edges)
    var x = Math.random() * (window.innerWidth - 120) + 60;
    var y = Math.random() * (window.innerHeight - 120) + 60;
    
    // Random size variation
    var size = 60 + Math.random() * 40; // 60-100px
    
    // Apply styles
    button.style.position = 'fixed';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
    button.style.width = size + 'px';
    button.style.height = size + 'px';
    button.style.borderRadius = '50%';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999';
    button.style.opacity = '0';
    button.style.transform = 'scale(0)';
    button.style.transition = 'all 0.3s ease';
    button.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    button.style.fontSize = (size * 0.15) + 'px';
    button.style.fontWeight = 'bold';
    button.style.color = 'white';
    button.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
    button.style.display = 'flex';
    button.style.flexDirection = 'column';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.textAlign = 'center';
    button.style.userSelect = 'none';
    button.style.background = getRandomButtonColor();
    
    // Add emoji and text
    var emoji = getSoundEmoji(randomSound);
    var shortName = getShortSoundName(randomSound);
    
    button.innerHTML = `
        <span style="font-size: ${size * 0.3}px; line-height: 1;">${emoji}</span>
        <span style="font-size: ${size * 0.12}px; line-height: 1; margin-top: 2px;">${shortName}</span>
    `;
    
    // Add to DOM
    document.body.appendChild(button);
    floatingButtons.push(button);
    
    // Animate in
    setTimeout(() => {
        button.style.opacity = '0.9';
        button.style.transform = 'scale(1)';
    }, 100);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        removeFloatingButton(button);
    }, 10000);
}

function removeFloatingButton(button) {
    if (!button || !button.parentNode) return;
    
    // Animate out
    button.style.opacity = '0';
    button.style.transform = 'scale(0)';
    
    setTimeout(() => {
        if (button.parentNode) {
            button.parentNode.removeChild(button);
        }
        // Remove from array
        var index = floatingButtons.indexOf(button);
        if (index > -1) {
            floatingButtons.splice(index, 1);
        }
    }, 300);
}

function getRandomButtonColor() {
    var colors = [
        '#ff4757', '#ff6b6b', '#74b9ff', '#0984e3', '#a29bfe',
        '#2d3436', '#fdcb6e', '#00b894', '#6c5ce7', '#ffffff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getSoundEmoji(soundName) {
    var emojiMap = {
        'vine-boom': '💥', 'bruh': '😤', 'sven': '🤔', 'ralf-schumacher': '😡',
        'was-geht-yallah': '👋', 'neggaz': '🥚', 'clash-royale': '🐷', 'wecker-laut': '⏰',
        'ching-cheng': '🎵', 'handy-ran': '📱', 'fart': '💨', 'backfisch': '🐟',
        'helmut': '🙂', 'klingelton': '🔔', 'garmin': '⌚', 'halts-maul': '🙄',
        'rizz': '😏', 'among-us': '👾', 'nebenrisiken': '💊', 'max-kacken': '🚽',
        'aura-farming': '✨', 'schnitzel': '🍖', 'fortnite': '💃', 'brainrot': '🧠',
        'spongebob': '💰', 'apple-pay': '🍎', 'katzenvieh': '🐱', 'phone-ringing': '📞',
        'verrueckter-vogel': '🐦', 'eiermann': '🥚', 'jet2': '✈️', 'mortis': '🌙',
        'galaxy': '🌌', 'clash-royale-deep': '🏆', 'neeeee': '😩', 'ralf-willst-du': '🎲',
        // New meme emojis
        'emotional-damage': '💔', 'baby-laughing': '👶', 'cat-laugh': '😸', 'oh-my-god-bro': '😱',
        'run-vine': '🏃', 'clash-royale-hog-rider': '🐗', 'he-he-he-ha-clash-royale-deep': '😈',
        'goku-drip': '🐉', 'explosion-meme': '💣', 'windows-xp-shutdown': '💻', 'minecraft-eating': '🍖',
        'minecraft-hurt': '💀', 'fart-with-reverb': '💨', 'fart-meme-better': '💨', 'buzzer': '🔔',
        'rizzbot-laugh': '🤖', 'oh-my-god-meme': '😲', 'confused-kitten': '😿', 'max-verstappen': '🏎️'
    };
    return emojiMap[soundName] || '🎵';
}

function getShortSoundName(soundName) {
    var nameMap = {
        'vine-boom': 'BOOM', 'bruh': 'BRUH', 'sven': 'SVEN', 'ralf-schumacher': 'RALF',
        'was-geht-yallah': 'YALLAH', 'neggaz': 'NEGGAZ', 'clash-royale': 'CLASH', 'wecker-laut': 'WECKER',
        'ching-cheng': 'CHING', 'handy-ran': 'HANDY', 'fart': 'FART', 'backfisch': 'FISCH',
        'helmut': 'HELMUT', 'klingelton': 'RING', 'garmin': 'GARMIN', 'halts-maul': 'MAUL',
        'rizz': 'RIZZ', 'among-us': 'AMONG', 'nebenrisiken': 'PILL', 'max-kacken': 'MAX',
        'aura-farming': 'AURA', 'schnitzel': 'SCHNITZ', 'fortnite': 'FORTNITE', 'brainrot': 'BRAIN',
        'spongebob': 'SPONGE', 'apple-pay': 'APPLE', 'katzenvieh': 'KATZE', 'phone-ringing': 'RING',
        'verrueckter-vogel': 'VOGEL', 'eiermann': 'EIER', 'jet2': 'JET2', 'mortis': 'MORTIS',
        'galaxy': 'GALAXY', 'clash-royale-deep': 'DEEP', 'neeeee': 'NEEEE', 'ralf-willst-du': 'WILLST',
        // New meme short names
        'emotional-damage': 'DAMAGE', 'baby-laughing': 'BABY', 'cat-laugh': 'CAT', 'oh-my-god-bro': 'OMG',
        'run-vine': 'RUN', 'clash-royale-hog-rider': 'HOG', 'he-he-he-ha-clash-royale-deep': 'HEHE',
        'goku-drip': 'GOKU', 'explosion-meme': 'BOOM', 'windows-xp-shutdown': 'XP', 'minecraft-eating': 'EAT',
        'minecraft-hurt': 'HURT', 'fart-with-reverb': 'FART2', 'fart-meme-better': 'FART3', 'buzzer': 'BUZZ',
        'rizzbot-laugh': 'RIZZBOT', 'oh-my-god-meme': 'OMG2', 'confused-kitten': 'KITTEN', 'max-verstappen': 'MAX'
    };
    return nameMap[soundName] || 'SOUND';
}

function startFloatingButtons() {
    if (floatingButtonInterval) return;
    
    // Create first button after 2 seconds
    setTimeout(() => {
        createFloatingButton();
    }, 2000);
    
    // Then create buttons every 5-10 seconds (more frequent)
    floatingButtonInterval = setInterval(() => {
        if (Math.random() < 0.8) { // 80% chance to create a button (increased)
            createFloatingButton();
        }
    }, 5000 + Math.random() * 5000); // Faster interval
}

function stopFloatingButtons() {
    if (floatingButtonInterval) {
        clearInterval(floatingButtonInterval);
        floatingButtonInterval = null;
    }
    
    // Remove all existing floating buttons
    floatingButtons.forEach(button => {
        removeFloatingButton(button);
    });
    floatingButtons = [];
}

// Initialize floating buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start floating buttons after a short delay
    setTimeout(() => {
        startFloatingButtons();
    }, 1000);
});

// Toggle floating buttons functionality
function toggleFloatingButtons() {
    const toggleBtn = document.getElementById('floatingToggle');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    
    if (isFloatingEnabled) {
        // Disable floating buttons
        isFloatingEnabled = false;
        stopFloatingButtons();
        toggleIcon.textContent = '🔇';
        toggleText.textContent = 'Sounds aus';
        toggleBtn.classList.add('disabled');
        console.log('🔇 Floating buttons disabled');
    } else {
        // Enable floating buttons
        isFloatingEnabled = true;
        startFloatingButtons();
        toggleIcon.textContent = '🎵';
        toggleText.textContent = 'Schwebende Sounds';
        toggleBtn.classList.remove('disabled');
        console.log('🎵 Floating buttons enabled');
    }
}

// Make functions globally available
window.playSound = playSound;
window.stopAllSounds = stopAllSounds;
window.startFloatingButtons = startFloatingButtons;
window.stopFloatingButtons = stopFloatingButtons;
window.toggleFloatingButtons = toggleFloatingButtons;


