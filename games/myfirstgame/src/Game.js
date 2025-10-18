class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemies = [];
        this.helpers = [];
        this.damageTexts = [];
        this.cactuses = [];
        this.inputSystem = null;
        this.gameSystem = null;
        this.lastTime = 0;
        this.gameOverShown = false;
        this.gameMode = null; // 'normal' or 'army'
        this.gameStarted = false;
        
        this.showModeSelection();
    }
    
    init() {
        this.setupThreeJS();
        this.setupLighting();
        this.setupGround();
        
        this.inputSystem = new InputSystem();
        this.gameSystem = new GameSystem(this.gameMode);
        
        this.player = new Player(this.scene);
        const sword = new Sword(this.scene);
        this.player.setSword(sword);
        
        this.setupCamera();
        this.spawnInitialEnemies();
        this.spawnCactuses();
        
        this.animate();
    }
    
    setupThreeJS() {
        this.scene = new THREE.Scene();
        this.setupSkybox();
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    setupGround() {
        // Expand world size for biomes
        const worldSize = 200;
        
        // Grass biome (left half)
        const grassGeometry = new THREE.PlaneGeometry(worldSize / 2, worldSize);
        const grassTexture = this.createGrassTexture();
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(20, 20);
        
        const grassMaterial = new THREE.MeshLambertMaterial({ 
            map: grassTexture,
            color: 0xffffff
        });
        
        const grassGround = new THREE.Mesh(grassGeometry, grassMaterial);
        grassGround.rotation.x = -Math.PI / 2;
        grassGround.position.x = -worldSize / 4; // Position left half
        grassGround.receiveShadow = true;
        this.scene.add(grassGround);
        
        // Desert biome (right half)
        const desertGeometry = new THREE.PlaneGeometry(worldSize / 2, worldSize);
        const sandTexture = this.createSandTexture();
        sandTexture.wrapS = THREE.RepeatWrapping;
        sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(20, 20);
        
        const sandMaterial = new THREE.MeshLambertMaterial({ 
            map: sandTexture,
            color: 0xffffff
        });
        
        const desertGround = new THREE.Mesh(desertGeometry, sandMaterial);
        desertGround.rotation.x = -Math.PI / 2;
        desertGround.position.x = worldSize / 4; // Position right half
        desertGround.receiveShadow = true;
        this.scene.add(desertGround);
    }
    
    // Get terrain height at a given world position (flat terrain)
    getTerrainHeight(x, z) {
        return 0; // Flat ground at Y=0
    }
    
    setupCamera() {
        this.camera.position.set(0, 5, 8);
        this.camera.lookAt(0, 1, 0);
    }
    
    spawnInitialEnemies() {
        if (this.gameMode === 'army') {
            // Army mode: spawn initial wave of 50 enemies
            const waveSize = this.gameSystem.getWaveSize();
            for (let i = 0; i < waveSize; i++) {
                this.spawnEnemy();
            }
        } else {
            // Normal mode: spawn 15 initial enemies
            for (let i = 0; i < 15; i++) {
                this.spawnEnemy();
            }
        }
    }
    
    spawnEnemy() {
        const position = this.gameSystem.getRandomSpawnPosition(this.player.getPosition());
        
        // Adjust spawn position to terrain height
        const terrainHeight = this.getTerrainHeight(position.x, position.z);
        position.y = terrainHeight + 1;
        
        let enemy;
        
        if (this.gameMode === 'army') {
            // Army mode: only spawn basic circle enemies
            enemy = new Enemy(this.scene, position);
        } else {
            // Normal mode: spawn different enemy types with different probabilities
            const rand = Math.random();
            
            if (rand < 0.05) { // 5% chance for giant boss enemy
                enemy = new GiantEnemy(this.scene, position);
            } else if (rand < 0.25) { // 20% chance for cat enemy
                enemy = new CatEnemy(this.scene, position);
            } else { // 75% chance for regular enemy
                enemy = new Enemy(this.scene, position);
            }
        }
        
        this.enemies.push(enemy);
        this.gameSystem.onEnemySpawned();
    }
    
    update(deltaTime) {
        if (this.gameSystem.isOver()) {
            this.showGameOver();
            return;
        }
        
        this.gameSystem.update(deltaTime);
        this.handleInput(deltaTime);
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateHelpers(deltaTime);
        this.updateDamageTexts();
        this.updateCactuses(deltaTime);
        this.handleCombat();
        this.spawnEnemiesIfNeeded();
        this.updateCamera();
        this.updateUI();
    }
    
    handleInput(deltaTime) {
        const movement = this.inputSystem.getMovementVector();
        if (movement.x !== 0 || movement.z !== 0) {
            // Simple movement relative to camera view (third person)
            const playerRotation = this.player.rotation.y;
            const cos = Math.cos(playerRotation);
            const sin = Math.sin(playerRotation);
            
            // W/S moves forward/back, A/D moves left/right relative to camera
            const transformedMovement = {
                x: movement.x * cos - movement.z * sin,
                y: 0,
                z: movement.x * sin + movement.z * cos
            };
            
            this.player.move(transformedMovement);
        }
        
        const mouseMovement = this.inputSystem.getMouseMovement();
        if (mouseMovement.x !== 0 || mouseMovement.y !== 0) {
            this.player.rotation.y -= mouseMovement.x * 0.002;
        }
        
        if (this.inputSystem.isAttackPressed()) {
            this.handlePlayerAttack();
        }
        
        if (this.inputSystem.isKeyPressed('KeyH')) {
            this.spawnHelper();
        }
    }
    
    handlePlayerAttack() {
        if (this.player.attack()) {
            const playerPos = this.player.getPosition();
            
            // With 360-degree sweep, check all enemies within reach
            // Use reverse loop to safely modify array during iteration
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (!enemy.isDead()) {
                    const distance = Vector3Utils.distance(playerPos, enemy.getPosition());
                    // Hit all enemies within sword reach (4 units)
                    if (distance <= this.player.sword.reach) {
                        const damage = this.player.sword.getDamage();
                        
                        // Create damage text
                        this.createDamageText(enemy.getPosition(), damage);
                        
                        const killed = enemy.takeDamage(damage);
                        if (killed) {
                            this.gameSystem.onEnemyKilled();
                            this.enemies.splice(i, 1);
                        }
                    }
                }
            }
            
            // Check for cactus hits
            for (let i = this.cactuses.length - 1; i >= 0; i--) {
                const cactus = this.cactuses[i];
                if (!cactus.isDead()) {
                    const distance = Vector3Utils.distance(playerPos, cactus.getPosition());
                    if (distance <= this.player.sword.reach) {
                        const damage = this.player.sword.getDamage();
                        
                        // Create damage text
                        this.createDamageText(cactus.getPosition(), damage);
                        
                        const destroyed = cactus.takeDamage(damage);
                        if (destroyed) {
                            this.cactuses.splice(i, 1);
                        }
                    }
                }
            }
        }
    }
    
    updatePlayer(deltaTime) {
        this.player.update(deltaTime);
        
        // Keep player on terrain surface
        const playerPos = this.player.getPosition();
        const terrainHeight = this.getTerrainHeight(playerPos.x, playerPos.z);
        this.player.position.y = terrainHeight + 1; // Player height above ground
    }
    
    updateEnemies(deltaTime) {
        const playerPos = this.player.getPosition();
        
        // Update enemies in reverse order to safely remove dead ones
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isDead()) {
                enemy.update(deltaTime, playerPos);
                
                // Keep enemies on terrain surface
                const enemyPos = enemy.getPosition();
                const terrainHeight = this.getTerrainHeight(enemyPos.x, enemyPos.z);
                enemy.position.y = terrainHeight + 1; // Enemy height above ground
                
                if (enemy.canAttack(playerPos)) {
                    const damage = enemy.attack();
                    const playerDied = this.player.takeDamage(damage);
                    if (playerDied) {
                        this.gameSystem.onPlayerDeath();
                    }
                }
                
            } else {
                // Remove dead enemy immediately
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateHelpers(deltaTime) {
        // Update all helpers and remove expired/dead ones
        this.helpers = this.helpers.filter(helper => {
            return helper.update(deltaTime, this.enemies, this.player.getPosition());
        });
    }
    
    spawnHelper() {
        // Limit the number of helpers to prevent lag
        if (this.helpers.length >= 10) {
            return; // Maximum 10 helpers at once
        }
        
        const playerPos = this.player.getPosition();
        const terrainHeight = this.getTerrainHeight(playerPos.x, playerPos.z);
        const helperPosition = { 
            x: playerPos.x, 
            y: terrainHeight + 2, // Spawn helpers a bit higher 
            z: playerPos.z 
        };
        
        const helper = new Helper(this.scene, helperPosition);
        this.helpers.push(helper);
    }
    
    updateCactuses(deltaTime) {
        const playerPos = this.player.getPosition();
        
        // Check for cactus damage to player
        for (let i = this.cactuses.length - 1; i >= 0; i--) {
            const cactus = this.cactuses[i];
            if (!cactus.isDead()) {
                if (cactus.canDamagePlayer(playerPos)) {
                    const damage = cactus.damagePlayer();
                    this.createDamageText(playerPos, damage);
                    const playerDied = this.player.takeDamage(damage);
                    if (playerDied) {
                        this.gameSystem.onPlayerDeath();
                    }
                }
            } else {
                // Remove dead cactuses
                this.cactuses.splice(i, 1);
            }
        }
    }
    
    handleCombat() {
        const collisions = this.gameSystem.checkCollisions(this.player, this.enemies);
        
        collisions.forEach(collision => {
            if (collision.type === 'player-enemy') {
                // Handle additional collision effects if needed
            }
        });
    }
    
    spawnEnemiesIfNeeded() {
        if (this.gameMode === 'army') {
            // Army mode: spawn entire wave at once
            if (this.gameSystem.shouldSpawnEnemy(this.enemies.length)) {
                const waveSize = this.gameSystem.getWaveSize();
                for (let i = 0; i < waveSize; i++) {
                    this.spawnEnemy();
                }
            }
        } else {
            // Normal mode: spawn one enemy at a time
            if (this.gameSystem.shouldSpawnEnemy(this.enemies.length)) {
                this.spawnEnemy();
            }
        }
    }
    
    updateCamera() {
        const playerPos = this.player.getPosition();
        const playerRot = this.player.rotation;
        
        const cameraDistance = 8;
        const cameraHeight = 5;
        
        // Position camera behind the player (in the direction they're facing)
        this.camera.position.x = playerPos.x + Math.sin(playerRot.y) * cameraDistance;
        this.camera.position.y = playerPos.y + cameraHeight;
        this.camera.position.z = playerPos.z + Math.cos(playerRot.y) * cameraDistance;
        
        this.camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setupSkybox() {
        // Create a simple gradient skybox
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyTexture = this.createSkyTexture();
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            map: skyTexture, 
            side: THREE.BackSide 
        });
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(skybox);
    }
    
    createSkyTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create vertical gradient from light blue to white
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
        gradient.addColorStop(0.7, '#B0E0E6'); // Powder blue
        gradient.addColorStop(1, '#F0F8FF'); // Alice blue at bottom
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some simple clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.6; // Upper part only
            const size = 20 + Math.random() * 30;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add smaller cloud puffs
            ctx.beginPath();
            ctx.arc(x + size * 0.5, y, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x - size * 0.5, y, size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base grass color
        ctx.fillStyle = '#4F7942'; // Dark green
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grass variation
        const grassColors = ['#5B8A4A', '#6B9A5A', '#3F6932', '#4A7A3D'];
        
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const color = grassColors[Math.floor(Math.random() * grassColors.length)];
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
        
        // Add some grass blade details
        ctx.strokeStyle = '#6B9A5A';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const height = 2 + Math.random() * 4;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 2 - 1, y - height);
            ctx.stroke();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createSandTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base sand color
        ctx.fillStyle = '#F4A460'; // Sandy brown
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add sand variation
        const sandColors = ['#DEB887', '#F5DEB3', '#D2B48C', '#BC9A6A'];
        
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const color = sandColors[Math.floor(Math.random() * sandColors.length)];
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
        
        // Add some small rocks/pebbles
        ctx.fillStyle = '#8B7355';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    spawnCactuses() {
        // Spawn cactuses in desert biome (x > 0)
        for (let i = 0; i < 25; i++) {
            const x = 10 + Math.random() * 90; // Desert area (x > 0)
            const z = (Math.random() - 0.5) * 180; // Spread across Z
            
            const cactus = new Cactus(this.scene, { x, y: 0, z });
            this.cactuses.push(cactus);
        }
    }
    
    createDamageText(position, damage) {
        // Limit the number of damage texts to prevent memory issues
        if (this.damageTexts.length > 20) {
            const oldestText = this.damageTexts.shift();
            if (oldestText) {
                oldestText.destroy();
            }
        }
        
        const damageText = new DamageText(this.scene, position, damage);
        this.damageTexts.push(damageText);
    }
    
    updateDamageTexts() {
        // Update all damage texts and remove expired ones
        this.damageTexts = this.damageTexts.filter(damageText => {
            return damageText.update(this.camera);
        });
    }
    
    showGameOver() {
        if (this.gameOverShown) return;
        this.gameOverShown = true;
        
        // Create game over overlay
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameOverScreen';
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 1000;
        `;
        
        const gameOverText = document.createElement('h1');
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.cssText = `
            font-size: 4em;
            margin: 0 0 20px 0;
            color: #ff4444;
            text-shadow: 2px 2px 4px #000;
        `;
        
        const scoreText = document.createElement('p');
        scoreText.textContent = `Final Score: ${this.gameSystem.getScore()}`;
        scoreText.style.cssText = `
            font-size: 1.5em;
            margin: 0 0 10px 0;
            color: #ffff44;
        `;
        
        const enemiesText = document.createElement('p');
        enemiesText.textContent = `Enemies Defeated: ${this.gameSystem.getEnemiesKilled()}`;
        enemiesText.style.cssText = `
            font-size: 1.2em;
            margin: 0 0 30px 0;
            color: #44ff44;
        `;
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'RESTART GAME';
        restartButton.style.cssText = `
            font-size: 1.5em;
            padding: 15px 30px;
            background: #4444ff;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin: 10px;
            transition: background 0.3s;
        `;
        
        restartButton.onmouseover = () => restartButton.style.background = '#6666ff';
        restartButton.onmouseout = () => restartButton.style.background = '#4444ff';
        restartButton.onclick = () => {
            location.reload();
        };
        
        const reloadText = document.createElement('p');
        reloadText.textContent = 'Or press R to restart';
        reloadText.style.cssText = `
            font-size: 1em;
            margin: 20px 0 0 0;
            color: #aaaaaa;
        `;
        
        gameOverDiv.appendChild(gameOverText);
        gameOverDiv.appendChild(scoreText);
        gameOverDiv.appendChild(enemiesText);
        gameOverDiv.appendChild(restartButton);
        gameOverDiv.appendChild(reloadText);
        
        document.body.appendChild(gameOverDiv);
        
        // Add keyboard restart
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyR') {
                location.reload();
            }
        });
    }
    
    updateUI() {
        // Update health bar
        const healthBar = document.getElementById('healthBar');
        const healthText = document.getElementById('healthText');
        const scoreValue = document.getElementById('scoreValue');
        const enemiesValue = document.getElementById('enemiesValue');
        
        if (healthBar && healthText && this.player) {
            const currentHealth = this.player.getHealth();
            const maxHealth = 100;
            const healthPercent = Math.max(0, (currentHealth / maxHealth) * 100);
            
            // Update health bar width
            healthBar.style.width = healthPercent + '%';
            
            // Update health text
            healthText.textContent = `${Math.max(0, currentHealth)} / ${maxHealth}`;
            
            // Change health bar color based on health level
            if (healthPercent > 60) {
                healthBar.style.background = 'linear-gradient(90deg, #00ff00 0%, #88ff88 100%)'; // Green
            } else if (healthPercent > 30) {
                healthBar.style.background = 'linear-gradient(90deg, #ffff00 0%, #ffaa00 100%)'; // Yellow/Orange
            } else {
                healthBar.style.background = 'linear-gradient(90deg, #ff0000 0%, #ff4444 100%)'; // Red
            }
        }
        
        // Update game stats
        if (scoreValue && this.gameSystem) {
            scoreValue.textContent = this.gameSystem.getScore();
        }
        
        if (enemiesValue && this.gameSystem) {
            enemiesValue.textContent = this.gameSystem.getEnemiesKilled();
        }
    }
    
    showModeSelection() {
        // Create mode selection overlay
        const modeSelectionDiv = document.createElement('div');
        modeSelectionDiv.id = 'modeSelection';
        modeSelectionDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 2000;
        `;
        
        const titleText = document.createElement('h1');
        titleText.textContent = 'MY FIRST 3D GAME';
        titleText.style.cssText = `
            font-size: 4em;
            margin: 0 0 30px 0;
            color: #ecf0f1;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
            font-weight: bold;
        `;
        
        const subtitleText = document.createElement('h2');
        subtitleText.textContent = 'Choose Your Game Mode';
        subtitleText.style.cssText = `
            font-size: 2em;
            margin: 0 0 50px 0;
            color: #bdc3c7;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 40px;
            flex-direction: row;
        `;
        
        // Normal mode button
        const normalButton = document.createElement('button');
        normalButton.textContent = 'NORMAL MODE';
        normalButton.style.cssText = `
            font-size: 1.5em;
            padding: 20px 40px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-weight: bold;
        `;
        
        const normalDescription = document.createElement('p');
        normalDescription.textContent = 'Regular enemies, cats, and giant bosses';
        normalDescription.style.cssText = `
            font-size: 0.9em;
            margin: 10px 0 0 0;
            color: #95a5a6;
            text-align: center;
        `;
        
        // Army mode button
        const armyButton = document.createElement('button');
        armyButton.textContent = 'ARMY MODE';
        armyButton.style.cssText = `
            font-size: 1.5em;
            padding: 20px 40px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-weight: bold;
        `;
        
        const armyDescription = document.createElement('p');
        armyDescription.textContent = 'Massive waves of 50 basic enemies!';
        armyDescription.style.cssText = `
            font-size: 0.9em;
            margin: 10px 0 0 0;
            color: #95a5a6;
            text-align: center;
        `;
        
        // Button hover effects
        normalButton.onmouseover = () => {
            normalButton.style.background = '#2ecc71';
            normalButton.style.transform = 'translateY(-2px)';
            normalButton.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
        };
        normalButton.onmouseout = () => {
            normalButton.style.background = '#27ae60';
            normalButton.style.transform = 'translateY(0)';
            normalButton.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        };
        
        armyButton.onmouseover = () => {
            armyButton.style.background = '#c0392b';
            armyButton.style.transform = 'translateY(-2px)';
            armyButton.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
        };
        armyButton.onmouseout = () => {
            armyButton.style.background = '#e74c3c';
            armyButton.style.transform = 'translateY(0)';
            armyButton.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        };
        
        // Button click handlers
        normalButton.onclick = () => {
            this.gameMode = 'normal';
            this.startGame();
            document.body.removeChild(modeSelectionDiv);
        };
        
        armyButton.onclick = () => {
            this.gameMode = 'army';
            this.startGame();
            document.body.removeChild(modeSelectionDiv);
        };
        
        // Create button containers
        const normalContainer = document.createElement('div');
        normalContainer.style.textAlign = 'center';
        normalContainer.appendChild(normalButton);
        normalContainer.appendChild(normalDescription);
        
        const armyContainer = document.createElement('div');
        armyContainer.style.textAlign = 'center';
        armyContainer.appendChild(armyButton);
        armyContainer.appendChild(armyDescription);
        
        buttonContainer.appendChild(normalContainer);
        buttonContainer.appendChild(armyContainer);
        
        modeSelectionDiv.appendChild(titleText);
        modeSelectionDiv.appendChild(subtitleText);
        modeSelectionDiv.appendChild(buttonContainer);
        
        document.body.appendChild(modeSelectionDiv);
    }
    
    startGame() {
        this.gameStarted = true;
        this.init();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
} else if (typeof window !== 'undefined') {
    window.Game = Game;
}