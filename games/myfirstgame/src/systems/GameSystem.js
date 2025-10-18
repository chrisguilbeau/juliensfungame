class GameSystem {
    constructor(gameMode = 'normal') {
        this.score = 0;
        this.enemiesKilled = 0;
        this.gameTime = 0;
        this.isGameOver = false;
        this.gameMode = gameMode;
        
        if (gameMode === 'army') {
            this.enemySpawnRate = 5000; // Spawn wave every 5 seconds
            this.lastEnemySpawn = 0;
            this.maxEnemies = 50; // 50 enemies per wave
            this.waveSize = 50; // Spawn 50 at once
            this.needsWaveSpawn = true; // Flag to spawn initial wave
        } else {
            this.enemySpawnRate = 200; // Spawn every 0.2 seconds!
            this.lastEnemySpawn = 0;
            this.maxEnemies = 50; // Way more enemies on screen
            this.waveSize = 1; // Spawn 1 at a time
            this.needsWaveSpawn = false;
        }
    }
    
    update(deltaTime) {
        if (this.isGameOver) return;
        
        this.gameTime += deltaTime;
    }
    
    shouldSpawnEnemy(currentEnemyCount) {
        if (this.gameMode === 'army') {
            // Army mode: spawn waves when all enemies are dead or initial spawn
            if (this.needsWaveSpawn) {
                return true;
            }
            
            // Spawn new wave when all enemies are defeated
            const currentTime = Date.now();
            return currentEnemyCount === 0 && 
                   (currentTime - this.lastEnemySpawn) > this.enemySpawnRate;
        } else {
            // Normal mode: gradual spawning
            const currentTime = Date.now();
            return currentEnemyCount < this.maxEnemies && 
                   (currentTime - this.lastEnemySpawn) > this.enemySpawnRate;
        }
    }
    
    onEnemySpawned() {
        this.lastEnemySpawn = Date.now();
        if (this.gameMode === 'army' && this.needsWaveSpawn) {
            this.needsWaveSpawn = false;
        }
    }
    
    getWaveSize() {
        return this.waveSize;
    }
    
    shouldSpawnWave() {
        return this.gameMode === 'army' && this.needsWaveSpawn;
    }
    
    onEnemyKilled() {
        this.enemiesKilled++;
        this.score += 100;
        
        if (this.gameMode === 'army') {
            // Army mode: increase wave size every 50 kills
            if (this.enemiesKilled % 50 === 0) {
                this.waveSize = Math.min(100, this.waveSize + 10);
                this.maxEnemies = this.waveSize;
            }
        } else {
            // Normal mode: increase spawn rate and max enemies
            if (this.enemiesKilled % 10 === 0) {
                this.enemySpawnRate = Math.max(50, this.enemySpawnRate - 20); // Gets insanely fast
                this.maxEnemies = Math.min(100, this.maxEnemies + 5); // More and more enemies
            }
        }
    }
    
    onPlayerDeath() {
        this.isGameOver = true;
    }
    
    getRandomSpawnPosition(playerPosition, minDistance = 8, maxDistance = 15) {
        const angle = Math.random() * Math.PI * 2;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        
        return {
            x: playerPosition.x + Math.cos(angle) * distance,
            y: 1,
            z: playerPosition.z + Math.sin(angle) * distance
        };
    }
    
    checkCollisions(player, enemies) {
        const collisions = [];
        
        enemies.forEach((enemy, index) => {
            if (!enemy.isDead()) {
                const distance = Vector3Utils.distance(player.getPosition(), enemy.getPosition());
                if (distance < 1.0) {
                    collisions.push({
                        type: 'player-enemy',
                        enemyIndex: index,
                        enemy: enemy
                    });
                }
            }
        });
        
        return collisions;
    }
    
    getScore() {
        return this.score;
    }
    
    getEnemiesKilled() {
        return this.enemiesKilled;
    }
    
    getGameTime() {
        return this.gameTime;
    }
    
    isOver() {
        return this.isGameOver;
    }
    
    reset() {
        this.score = 0;
        this.enemiesKilled = 0;
        this.gameTime = 0;
        this.isGameOver = false;
        
        if (this.gameMode === 'army') {
            this.enemySpawnRate = 5000; // Spawn wave every 5 seconds
            this.lastEnemySpawn = 0;
            this.maxEnemies = 50; // 50 enemies per wave
            this.waveSize = 50; // Spawn 50 at once
            this.needsWaveSpawn = true; // Flag to spawn initial wave
        } else {
            this.enemySpawnRate = 200; // Spawn every 0.2 seconds!
            this.lastEnemySpawn = 0;
            this.maxEnemies = 50; // Way more enemies on screen
            this.waveSize = 1; // Spawn 1 at a time
            this.needsWaveSpawn = false;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameSystem;
} else if (typeof window !== 'undefined') {
    window.GameSystem = GameSystem;
}