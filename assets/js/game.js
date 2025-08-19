class BaumholzGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas setup
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.highscore = localStorage.getItem('baumholzHighscore') || 0;
        this.startTime = 0;
        this.currentTime = 0;
        
        // Player (airplane)
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 20,
            speed: 5,
            turboSpeed: 8,
            isTurbo: false
        };
        
        // Flying Baumholz Home - Much harder target
        this.house = {
            x: 700,
            y: 300,
            width: 100,
            height: 120,
            health: 200, // Much more health
            maxHealth: 200,
            destroyed: false,
            damageLevel: 0,
            speed: 2, // Flying speed
            direction: 1, // 1 = up, -1 = down
            parts: {
                roof: { health: 100, visible: true },
                walls: { health: 100, visible: true },
                windows: { health: 100, visible: true },
                door: { health: 100, visible: true }
            }
        };
        
        // Bullets - Much harder
        this.bullets = [];
        this.bulletSpeed = 6; // Slower bullets
        this.bulletDamage = 5; // Less damage per bullet
        
        // Enemy bullets (shooting back!)
        this.enemyBullets = [];
        this.enemyBulletSpeed = 4;
        
        // Explosions
        this.explosions = [];
        
        // Enemies (defending the house)
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 120; // Frames between enemy spawns
        
        // Player health
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        
        // Input handling
        this.keys = {};
        this.setupInputs();
        this.setupStartButton();
        
        // Initialize
        this.updateHighscore();
        this.gameLoop();
    }
    
    setupStartButton() {
        const startBtn = document.getElementById('startGameBtn');
        const startScreen = document.getElementById('startScreen');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
                if (startScreen) {
                    startScreen.classList.add('hidden');
                }
                // Focus canvas immediately after starting
                setTimeout(() => {
                    this.canvas.focus();
                }, 100);
            });
        }
    }
    
    setupInputs() {
        // Only handle inputs when game is running and canvas is focused
        this.canvas.addEventListener('keydown', (e) => {
            if (this.gameRunning) {
                this.keys[e.code] = true;
                e.preventDefault(); // Prevent page scrolling
            }
        });
        
        this.canvas.addEventListener('keyup', (e) => {
            if (this.gameRunning) {
                this.keys[e.code] = false;
                e.preventDefault();
            }
        });
        
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        
        // Focus canvas when clicked
        this.canvas.addEventListener('click', () => {
            if (this.gameRunning) {
                this.canvas.focus();
            }
        });
        
        // Prevent canvas from losing focus when clicking inside
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameRunning) {
                e.preventDefault();
                this.canvas.focus();
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameStarted = true;
        this.score = 0;
        this.startTime = Date.now();
        this.house.health = this.house.maxHealth;
        this.house.destroyed = false;
        this.house.damageLevel = 0;
        this.house.y = 300;
        this.house.direction = 1;
        this.house.parts = {
            roof: { health: 100, visible: true },
            walls: { health: 100, visible: true },
            windows: { health: 100, visible: true },
            door: { health: 100, visible: true }
        };
        
        // Reset player
        this.player.x = 100;
        this.player.y = 300;
        this.playerHealth = this.maxPlayerHealth;
        
        // Clear arrays
        this.bullets = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.enemies = [];
        
        // Focus canvas for input
        this.canvas.focus();
        
        console.log('Game started!');
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.currentTime.toFixed(1);
        document.getElementById('playerHealth').textContent = this.playerHealth;
    }
    
    updateHighscore() {
        document.getElementById('highscore').textContent = this.highscore;
    }
    
    updateHouseDamage() {
        const healthPercent = this.house.health / this.house.maxHealth;
        
        // Update damage level based on health
        if (healthPercent <= 0.2) {
            this.house.damageLevel = 4; // Completely destroyed
        } else if (healthPercent <= 0.4) {
            this.house.damageLevel = 3; // Heavily damaged
        } else if (healthPercent <= 0.6) {
            this.house.damageLevel = 2; // Moderately damaged
        } else if (healthPercent <= 0.8) {
            this.house.damageLevel = 1; // Slightly damaged
        } else {
            this.house.damageLevel = 0; // Intact
        }
        
        // Update individual parts
        this.house.parts.windows.health = Math.max(0, this.house.parts.windows.health - 5);
        this.house.parts.walls.health = Math.max(0, this.house.parts.walls.health - 3);
        this.house.parts.roof.health = Math.max(0, this.house.parts.roof.health - 2);
        this.house.parts.door.health = Math.max(0, this.house.parts.door.health - 4);
        
        // Hide parts when destroyed
        if (this.house.parts.windows.health <= 0) this.house.parts.windows.visible = false;
        if (this.house.parts.walls.health <= 0) this.house.parts.walls.visible = false;
        if (this.house.parts.roof.health <= 0) this.house.parts.roof.visible = false;
        if (this.house.parts.door.health <= 0) this.house.parts.door.visible = false;
    }
    
    getHighscores() {
        const highscores = localStorage.getItem('baumholzHighscores');
        return highscores ? JSON.parse(highscores) : [];
    }
    
    saveHighscore() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('Bitte gib deinen Namen ein!');
            return;
        }
        
        // Get existing highscores
        let highscores = JSON.parse(localStorage.getItem('baumholzHighscores') || '[]');
        
        // Add new score
        highscores.push({
            name: playerName,
            score: this.score,
            time: this.currentTime,
            date: new Date().toISOString()
        });
        
        // Sort by score (highest first)
        highscores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        highscores = highscores.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('baumholzHighscores', JSON.stringify(highscores));
        
        // Update display
        this.displayHighscores();
        
        // Clear input
        document.getElementById('playerName').value = '';
        
        alert('Highscore gespeichert!');
    }
    
    displayHighscores() {
        const highscores = this.getHighscores();
        const container = document.getElementById('highscoreList');
        
        if (highscores.length === 0) {
            container.innerHTML = '<p>Noch keine Highscores!</p>';
            return;
        }
        
        let html = '<h3>🏆 Top Highscores:</h3><div class="highscore-table">';
        highscores.forEach((hs, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            html += `<div class="highscore-entry">
                <span class="medal">${medal}</span>
                <span class="name">${hs.name}</span>
                <span class="score">${hs.score}</span>
                <span class="time">${hs.time.toFixed(1)}s</span>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }
    
    handleInput() {
        if (!this.gameRunning) return;
        
        // Movement
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.player.y += this.player.speed;
        }
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += this.player.speed;
        }
        
        // Firing (Q key)
        if (this.keys['KeyQ']) {
            this.fireBullet();
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
    }
    
    fireBullet() {
        // Prevent rapid firing
        if (this.lastFireTime && Date.now() - this.lastFireTime < 200) return;
        
        this.lastFireTime = Date.now();
        
        const bullet = {
            x: this.player.x + this.player.width,
            y: this.player.y + this.player.height / 2,
            width: 8,
            height: 4,
            speed: this.bulletSpeed
        };
        
        this.bullets.push(bullet);
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.speed;
            
            // Remove bullets that are off screen
            if (bullet.x > this.canvas.width) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check collision with house
            if (this.checkCollision(bullet, this.house)) {
                this.bullets.splice(i, 1);
                this.house.health -= this.bulletDamage;
                this.score += this.bulletDamage;
                this.createExplosion(bullet.x, bullet.y);
                
                // Realistic damage progression
                this.updateHouseDamage();
                
                if (this.house.health <= 0) {
                    this.house.destroyed = true;
                    this.score += 100; // Bonus for destroying the house
                    this.gameOver();
                }
                
                this.updateScore();
            }
        }
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.x -= bullet.speed;
            
            // Remove bullets that are off screen
            if (bullet.x < 0) {
                this.enemyBullets.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (this.checkCollision(bullet, this.player)) {
                this.enemyBullets.splice(i, 1);
                this.playerHealth -= 20;
                this.createExplosion(bullet.x, bullet.y);
                
                if (this.playerHealth <= 0) {
                    this.gameOver();
                }
                
                this.updateScore();
            }
        }
    }
    
    updateHouse() {
        // Make house fly up and down
        this.house.y += this.house.speed * this.house.direction;
        
        // Change direction at boundaries
        if (this.house.y <= 100 || this.house.y >= 400) {
            this.house.direction *= -1;
        }
        
        // House shoots back occasionally
        if (Math.random() < 0.02) { // 2% chance per frame
            this.enemyBullets.push({
                x: this.house.x,
                y: this.house.y + this.house.height / 2,
                width: 8,
                height: 4,
                speed: this.enemyBulletSpeed
            });
        }
    }
    
    spawnEnemy() {
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnRate) {
            this.enemySpawnTimer = 0;
            
            // Spawn enemy from right side
            this.enemies.push({
                x: this.canvas.width + 50,
                y: Math.random() * (this.canvas.height - 40),
                width: 30,
                height: 30,
                speed: 2 + Math.random() * 2,
                health: 30
            });
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.x -= enemy.speed;
            
            // Remove enemies that are off screen
            if (enemy.x < -50) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (this.checkCollision(enemy, this.player)) {
                this.enemies.splice(i, 1);
                this.playerHealth -= 30;
                this.createExplosion(enemy.x, enemy.y);
                
                if (this.playerHealth <= 0) {
                    this.gameOver();
                }
                
                this.updateScore();
            }
            
            // Enemy shoots at player
            if (Math.random() < 0.01) { // 1% chance per frame
                this.enemyBullets.push({
                    x: enemy.x,
                    y: enemy.y + enemy.height / 2,
                    width: 6,
                    height: 3,
                    speed: this.enemyBulletSpeed
                });
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            particles: [],
            life: 30
        });
        
        // Create particles
        for (let i = 0; i < 8; i++) {
            this.explosions[this.explosions.length - 1].particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30
            });
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life--;
            
            for (let j = explosion.particles.length - 1; j >= 0; j--) {
                const particle = explosion.particles[j];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                if (particle.life <= 0) {
                    explosion.particles.splice(j, 1);
                }
            }
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    drawPlayer() {
        this.ctx.save();
        this.ctx.fillStyle = this.player.isTurbo ? '#ff6b35' : '#ffd700';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw airplane details
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, 10, 10);
        
        // Draw wings
        this.ctx.fillStyle = this.player.isTurbo ? '#ff4500' : '#ffa500';
        this.ctx.fillRect(this.player.x - 5, this.player.y + 5, 10, 15);
        this.ctx.fillRect(this.player.x + this.player.width - 5, this.player.y + 5, 10, 15);
        
        // Draw turbo effect
        if (this.player.isTurbo) {
            this.ctx.fillStyle = '#ff4500';
            this.ctx.fillRect(this.player.x - 15, this.player.y + 8, 10, 4);
        }
        
        this.ctx.restore();
    }
    
    drawHouse() {
        this.ctx.save();
        
        // Draw damage effects
        const damageLevel = this.house.damageLevel;
        const healthPercent = this.house.health / this.house.maxHealth;
        
        // House base with damage
        if (this.house.parts.walls.visible) {
            this.ctx.fillStyle = damageLevel >= 2 ? '#654321' : '#8B4513';
            this.ctx.fillRect(this.house.x, this.house.y, this.house.width, this.house.height);
            
            // Add cracks for damage
            if (damageLevel >= 1) {
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.house.x + 20, this.house.y);
                this.ctx.lineTo(this.house.x + 40, this.house.y + 30);
                this.ctx.stroke();
            }
        }
        
        // Roof with damage
        if (this.house.parts.roof.visible) {
            this.ctx.fillStyle = damageLevel >= 3 ? '#4a2c0a' : '#654321';
            this.ctx.beginPath();
            this.ctx.moveTo(this.house.x - 10, this.house.y);
            this.ctx.lineTo(this.house.x + this.house.width / 2, this.house.y - 30);
            this.ctx.lineTo(this.house.x + this.house.width + 10, this.house.y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Roof damage effects
            if (damageLevel >= 2) {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(this.house.x + 20, this.house.y - 15, 40, 5);
            }
        }
        
        // Windows with damage
        if (this.house.parts.windows.visible) {
            this.ctx.fillStyle = damageLevel >= 1 ? '#ff6b35' : '#87CEEB';
            this.ctx.fillRect(this.house.x + 15, this.house.y + 20, 15, 20);
            this.ctx.fillRect(this.house.x + 50, this.house.y + 20, 15, 20);
            
            // Broken glass effect
            if (damageLevel >= 1) {
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(this.house.x + 15, this.house.y + 20);
                this.ctx.lineTo(this.house.x + 30, this.house.y + 40);
                this.ctx.moveTo(this.house.x + 50, this.house.y + 20);
                this.ctx.lineTo(this.house.x + 65, this.house.y + 40);
                this.ctx.stroke();
            }
        }
        
        // Door with damage
        if (this.house.parts.door.visible) {
            this.ctx.fillStyle = damageLevel >= 2 ? '#4a2c0a' : '#654321';
            this.ctx.fillRect(this.house.x + 30, this.house.y + 50, 20, 50);
            
            // Door handle
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillRect(this.house.x + 45, this.house.y + 70, 3, 3);
        }
        
        // Destruction debris
        if (damageLevel >= 3) {
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(this.house.x + 10, this.house.y + 90, 10, 5);
            this.ctx.fillRect(this.house.x + 60, this.house.y + 95, 8, 3);
        }
        
        // Health bar
        const barWidth = this.house.width;
        const barHeight = 8;
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.house.x, this.house.y - 15, barWidth, barHeight);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.house.x, this.house.y - 15, barWidth * healthPercent, barHeight);
        
        // Damage level indicator
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Damage: ${damageLevel}/4`, this.house.x, this.house.y - 25);
        
        this.ctx.restore();
    }
    
    drawBullets() {
        this.ctx.save();
        
        // Player bullets
        this.ctx.fillStyle = '#ffd700';
        for (const bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Enemy bullets
        this.ctx.fillStyle = '#ff0000';
        for (const bullet of this.enemyBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        this.ctx.restore();
    }
    
    drawEnemies() {
        this.ctx.save();
        this.ctx.fillStyle = '#ff0000';
        
        for (const enemy of this.enemies) {
            // Enemy body
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Enemy details
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
            this.ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
            
            // Enemy wings
            this.ctx.fillStyle = '#8B0000';
            this.ctx.fillRect(enemy.x - 5, enemy.y + 10, 10, 10);
            this.ctx.fillRect(enemy.x + enemy.width - 5, enemy.y + 10, 10, 10);
            
            this.ctx.fillStyle = '#ff0000';
        }
        
        this.ctx.restore();
    }
    
    drawPlayerHealth() {
        this.ctx.save();
        
        const barWidth = 200;
        const barHeight = 15;
        const x = 10;
        const y = 10;
        const healthPercent = this.playerHealth / this.maxPlayerHealth;
        
        // Health bar background
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health bar
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Health text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Health: ${this.playerHealth}`, x, y + 25);
        
        this.ctx.restore();
    }
    
    drawExplosions() {
        this.ctx.save();
        
        for (const explosion of this.explosions) {
            const alpha = explosion.life / 30;
            this.ctx.globalAlpha = alpha;
            
            for (const particle of explosion.particles) {
                const particleAlpha = particle.life / 30;
                this.ctx.globalAlpha = alpha * particleAlpha;
                this.ctx.fillStyle = '#ff6b35';
                this.ctx.fillRect(particle.x, particle.y, 4, 4);
            }
        }
        
        this.ctx.restore();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.drawClouds();
        this.drawBackgroundEffects();
        
        // Draw game objects
        this.drawHouse();
        this.drawBullets();
        this.drawEnemies();
        this.drawExplosions();
        this.drawPlayer();
        this.drawPlayerHealth();
    }
    
    drawClouds() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Multiple cloud layers for depth
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + this.currentTime * 10) % (this.canvas.width + 100);
            const y = 50 + i * 30;
            const size = 20 + i * 5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.8, y, size * 0.7, 0, Math.PI * 2);
            this.ctx.arc(x + size * 1.6, y, size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawBackgroundEffects() {
        this.ctx.save();
        
        // Flying debris particles
        for (let i = 0; i < 20; i++) {
            const x = (i * 50 + this.currentTime * 20) % this.canvas.width;
            const y = Math.sin(this.currentTime + i) * 50 + 200;
            
            this.ctx.fillStyle = `rgba(139, 69, 19, ${0.3 + Math.sin(this.currentTime + i) * 0.2})`;
            this.ctx.fillRect(x, y, 3, 3);
        }
        
        // Lightning effects
        if (Math.random() < 0.005) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.random() * this.canvas.width, 0);
            this.ctx.lineTo(Math.random() * this.canvas.width, this.canvas.height);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.currentTime = (Date.now() - this.startTime) / 1000;
        this.handleInput();
        this.updateHouse();
        this.updateBullets();
        this.updateEnemies();
        this.spawnEnemy();
        this.updateExplosions();
        this.updateScore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    saveHighscore() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('Bitte gib deinen Namen ein!');
            return;
        }
        
        // Get existing highscores
        let highscores = JSON.parse(localStorage.getItem('baumholzHighscores') || '[]');
        
        // Add new score
        highscores.push({
            name: playerName,
            score: this.score,
            time: this.currentTime,
            date: new Date().toISOString()
        });
        
        // Sort by score (highest first)
        highscores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        highscores = highscores.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('baumholzHighscores', JSON.stringify(highscores));
        
        // Update display
        this.displayHighscores();
        
        // Clear input
        document.getElementById('playerName').value = '';
        
        alert('Highscore gespeichert!');
    }
    
    displayHighscores() {
        const highscoreList = document.getElementById('highscoreList');
        if (!highscoreList) return;
        
        const highscores = JSON.parse(localStorage.getItem('baumholzHighscores') || '[]');
        
        highscoreList.innerHTML = '';
        
        if (highscores.length === 0) {
            highscoreList.innerHTML = '<div>Noch keine Highscores!</div>';
            return;
        }
        
        highscores.forEach((score, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            const div = document.createElement('div');
            div.innerHTML = `
                <span>${medal} ${score.name}</span>
                <span>${score.score} (${score.time.toFixed(1)}s)</span>
            `;
            highscoreList.appendChild(div);
        });
    }

    gameOver() {
        this.gameRunning = false;
        
        // Show game over screen
        const gameOverEl = document.getElementById('gameOver');
        const finalScoreEl = document.getElementById('finalScore');
        const finalTimeEl = document.getElementById('finalTime');
        
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (finalTimeEl) finalTimeEl.textContent = this.currentTime.toFixed(1);
        
        if (gameOverEl) {
            gameOverEl.classList.remove('hidden');
        }
        
        // Update highscore if needed
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('baumholzHighscore', this.highscore);
            this.updateHighscore();
        }
        
        console.log('Game Over! Score:', this.score);
    }
    
    resetGame() {
        // Hide game over screen
        const gameOverEl = document.getElementById('gameOver');
        if (gameOverEl) {
            gameOverEl.classList.add('hidden');
        }
        
        // Show start screen again
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
        }
        
        // Reset game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.currentTime = 0;
        
        // Update displays
        this.updateScore();
        this.updateTime();
        this.updateHealth();
    }
}

// Global game instance
let gameInstance = null;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Baumholz Home Game...');
    
    // Check if we're on the secrets page
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        console.log('Game canvas found, initializing game...');
        gameInstance = new BaumholzGame();
        
        // Don't auto-start, wait for START button click
        console.log('Game ready, waiting for START button click...');
    } else {
        console.log('Game canvas not found, not on secrets page');
    }
});

// Global functions for HTML buttons
function startGame() {
    if (gameInstance) {
        if (gameInstance.gameRunning) {
            // If game is running, reset it
            gameInstance.resetGame();
        } else {
            // Start new game
            gameInstance.startGame();
            const startScreen = document.getElementById('startScreen');
            if (startScreen) {
                startScreen.classList.add('hidden');
            }
        }
    }
}

function saveHighscore() {
    if (gameInstance) {
        gameInstance.saveHighscore();
    }
}