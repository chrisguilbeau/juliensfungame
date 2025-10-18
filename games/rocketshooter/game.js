class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.ship = new Ship(0, 0);
        this.starfield = new Starfield();
        this.projectiles = [];
        this.weaponStations = [];
        this.enemies = [];
        this.enemyProjectiles = [];
        this.explosions = [];
        
        this.lastTime = 0;
        this.isRunning = false;
        this.gameState = 'playing'; // 'playing', 'game_over'
        
        this.setupInput();
        this.setupUI();
        this.start();
    }
    
    setupInput() {
        const keys = {};
        
        window.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            
            switch(e.code) {
                case 'ArrowLeft':
                    this.ship.setControl('left', true);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.ship.setControl('right', true);
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.ship.setControl('thrust', true);
                    e.preventDefault();
                    break;
                case 'Space':
                    this.ship.setControl('shoot', true);
                    e.preventDefault();
                    break;
                case 'KeyR':
                    if (this.gameState === 'game_over') {
                        this.restartGame();
                    } else {
                        this.resetShip();
                    }
                    e.preventDefault();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            keys[e.code] = false;
            
            switch(e.code) {
                case 'ArrowLeft':
                    this.ship.setControl('left', false);
                    break;
                case 'ArrowRight':
                    this.ship.setControl('right', false);
                    break;
                case 'ArrowUp':
                    this.ship.setControl('thrust', false);
                    break;
                case 'Space':
                    this.ship.setControl('shoot', false);
                    break;
            }
        });
    }
    
    setupUI() {
        this.positionDisplay = document.getElementById('positionDisplay');
        this.velocityDisplay = document.getElementById('velocityDisplay');
        this.rotationDisplay = document.getElementById('rotationDisplay');
        this.powerUpDisplay = document.getElementById('powerUpDisplay');
    }
    
    updateUI() {
        this.positionDisplay.textContent = `${this.ship.position.x.toFixed(0)}, ${this.ship.position.y.toFixed(0)}`;
        this.velocityDisplay.textContent = `${this.ship.velocity.x.toFixed(1)}, ${this.ship.velocity.y.toFixed(1)}`;
        this.rotationDisplay.textContent = `${(this.ship.rotation * 180 / Math.PI).toFixed(0)}°`;
        this.powerUpDisplay.textContent = this.ship.getPowerUpStatus() || 'None';
    }
    
    resetShip() {
        this.ship.position = new Vector2(0, 0);
        this.ship.velocity = new Vector2(0, 0);
        this.ship.rotation = 0;
        this.projectiles = [];
    }
    
    restartGame() {
        this.ship = new Ship(0, 0);
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.explosions = [];
        this.gameState = 'playing';
    }
    
    update(deltaTime, currentTime) {
        if (this.gameState === 'game_over') {
            // Only update explosions when game is over
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                this.explosions[i].update(deltaTime);
                if (!this.explosions[i].isActive) {
                    this.explosions.splice(i, 1);
                }
            }
            return;
        }
        
        // Update ship and handle shooting
        if (this.ship.isAlive) {
            const newProjectiles = this.ship.update(deltaTime, currentTime);
            if (newProjectiles) {
                if (Array.isArray(newProjectiles)) {
                    this.projectiles.push(...newProjectiles);
                } else {
                    this.projectiles.push(newProjectiles);
                }
            }
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            // Remove inactive projectiles or those off screen
            if (!projectile.isActive || 
                projectile.isOffScreen(this.ship.position.x, this.ship.position.y, 
                                     this.renderer.width, this.renderer.height)) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update enemy projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            projectile.update(deltaTime);
            
            if (!projectile.isActive || 
                projectile.isOffScreen(this.ship.position.x, this.ship.position.y, 
                                     this.renderer.width, this.renderer.height)) {
                this.enemyProjectiles.splice(i, 1);
            }
        }
        
        // Get viewport bounds for efficient updates
        const viewport = this.renderer.getViewportBounds();
        
        // Update enemies
        const areaWidth = viewport.width * 1.5; // Slightly larger area
        const areaHeight = viewport.height * 1.5;
        this.enemies = this.starfield.getEnemiesInArea(
            viewport.centerX,
            viewport.centerY,
            areaWidth,
            areaHeight
        );
        
        // Update enemy behavior
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isActive) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            const newProjectile = enemy.update(deltaTime, this.ship.position);
            if (newProjectile) {
                this.enemyProjectiles.push(newProjectile);
            }
        }
        
        // Update weapon stations
        this.weaponStations = this.starfield.getVisibleWeaponStations(
            viewport.centerX,
            viewport.centerY,
            viewport.width,
            viewport.height
        );
        
        // Update weapon station animations
        for (const station of this.weaponStations) {
            station.update(deltaTime);
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (!this.explosions[i].isActive) {
                this.explosions.splice(i, 1);
            }
        }
        
        // Update camera to follow ship
        this.renderer.setCamera(this.ship.position.x, this.ship.position.y);
        
        this.updateUI();
    }
    
    checkCollisions() {
        // Check ship collisions with weapon stations
        this.ship.checkCollisionWithStations(this.weaponStations);
        
        // Check ship collisions with enemy projectiles
        const explosion = this.ship.checkCollisionWithProjectiles(this.enemyProjectiles);
        if (explosion) {
            this.explosions.push(explosion);
            this.gameState = 'game_over';
            return;
        }
        
        // Check player projectiles vs enemies
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile.isActive) continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.isActive) continue;
                
                if (enemy.checkCollision(projectile.position, projectile.size/2)) {
                    projectile.isActive = false;
                    this.projectiles.splice(i, 1);
                    
                    const destroyed = enemy.takeDamage(1);
                    if (destroyed) {
                        this.enemies.splice(j, 1);
                    }
                    break;
                }
            }
        }
    }
    
    render() {
        this.renderer.clear();
        
        // Get viewport bounds for efficient rendering
        const viewport = this.renderer.getViewportBounds();
        
        // Draw grid lines
        const gridLines = this.starfield.getVisibleGridLines(
            viewport.centerX,
            viewport.centerY,
            viewport.width,
            viewport.height
        );
        this.renderer.drawGridLines(gridLines);
        
        // Draw stars
        const stars = this.starfield.getVisibleStars(
            viewport.centerX,
            viewport.centerY,
            viewport.width,
            viewport.height
        );
        this.renderer.drawStars(stars);
        
        // Draw weapon stations
        for (const station of this.weaponStations) {
            this.renderer.drawWeaponStation(station);
        }
        
        // Draw enemies
        for (const enemy of this.enemies) {
            this.renderer.drawEnemy(enemy);
        }
        
        // Draw projectiles
        for (const projectile of this.projectiles) {
            this.renderer.drawProjectile(projectile);
        }
        
        // Draw enemy projectiles
        for (const projectile of this.enemyProjectiles) {
            this.renderer.drawEnemyProjectile(projectile);
        }
        
        // Draw ship (if alive)
        if (this.ship.isAlive) {
            this.renderer.drawShip(this.ship);
        }
        
        // Draw explosions
        for (const explosion of this.explosions) {
            this.renderer.drawExplosion(explosion);
        }
        
        // Draw game over screen
        if (this.gameState === 'game_over') {
            this.drawGameOverScreen();
        }
    }
    
    drawGameOverScreen() {
        // Draw semi-transparent overlay
        this.renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.renderer.ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
        
        // Draw game over text
        this.renderer.ctx.fillStyle = '#fff';
        this.renderer.ctx.font = '48px monospace';
        this.renderer.ctx.textAlign = 'center';
        this.renderer.ctx.textBaseline = 'middle';
        this.renderer.ctx.fillText('GAME OVER', this.renderer.width/2, this.renderer.height/2 - 40);
        
        this.renderer.ctx.font = '24px monospace';
        this.renderer.ctx.fillText('Press R to restart', this.renderer.width/2, this.renderer.height/2 + 40);
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        const clampedDeltaTime = Math.min(deltaTime, 1/30);
        
        this.update(clampedDeltaTime, currentTime / 1000);
        this.render();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        this.isRunning = false;
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});