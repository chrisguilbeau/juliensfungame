class Starfield {
    constructor() {
        this.gridSize = 1000; // Size of each star field section
        this.starsPerSection = 50;
        this.starCache = new Map();
        this.gridLineSpacing = 200;
        this.weaponStationsPerSection = 2; // Average number of weapon stations per section
        this.weaponStationCache = new Map();
        this.enemiesPerSection = 3; // Average number of enemies per section
        this.enemyCache = new Map();
    }
    
    // Simple hash function for consistent star placement
    hash(x, y) {
        let hash = 0;
        const str = `${x},${y}`;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    // Generate stars for a specific grid section
    generateStarsForSection(gridX, gridY) {
        const sectionKey = `${gridX},${gridY}`;
        
        if (this.starCache.has(sectionKey)) {
            return this.starCache.get(sectionKey);
        }
        
        const stars = [];
        const baseX = gridX * this.gridSize;
        const baseY = gridY * this.gridSize;
        
        // Use grid coordinates to seed random generation
        const seed = this.hash(gridX, gridY);
        
        for (let i = 0; i < this.starsPerSection; i++) {
            const starSeed = this.hash(seed, i);
            const x = baseX + (starSeed % this.gridSize);
            const y = baseY + ((starSeed >> 16) % this.gridSize);
            const brightness = 0.3 + (starSeed % 100) / 100 * 0.7;
            
            stars.push({
                x: x,
                y: y,
                brightness: brightness
            });
        }
        
        this.starCache.set(sectionKey, stars);
        return stars;
    }
    
    // Get all stars visible in the given viewport
    getVisibleStars(centerX, centerY, width, height) {
        const stars = [];
        
        // Calculate which grid sections are visible
        const leftGrid = Math.floor((centerX - width/2) / this.gridSize);
        const rightGrid = Math.floor((centerX + width/2) / this.gridSize);
        const topGrid = Math.floor((centerY - height/2) / this.gridSize);
        const bottomGrid = Math.floor((centerY + height/2) / this.gridSize);
        
        // Generate stars for each visible section
        for (let gridX = leftGrid; gridX <= rightGrid; gridX++) {
            for (let gridY = topGrid; gridY <= bottomGrid; gridY++) {
                const sectionStars = this.generateStarsForSection(gridX, gridY);
                
                // Filter stars that are actually visible
                for (const star of sectionStars) {
                    if (star.x >= centerX - width/2 && star.x <= centerX + width/2 &&
                        star.y >= centerY - height/2 && star.y <= centerY + height/2) {
                        stars.push(star);
                    }
                }
            }
        }
        
        return stars;
    }
    
    // Get grid lines visible in the viewport
    getVisibleGridLines(centerX, centerY, width, height) {
        const lines = [];
        
        // Vertical lines
        const leftX = centerX - width/2;
        const rightX = centerX + width/2;
        const startVertical = Math.floor(leftX / this.gridLineSpacing) * this.gridLineSpacing;
        const endVertical = Math.ceil(rightX / this.gridLineSpacing) * this.gridLineSpacing;
        
        for (let x = startVertical; x <= endVertical; x += this.gridLineSpacing) {
            if (x >= leftX && x <= rightX) {
                lines.push({
                    type: 'vertical',
                    x: x,
                    y1: centerY - height/2,
                    y2: centerY + height/2
                });
            }
        }
        
        // Horizontal lines
        const topY = centerY - height/2;
        const bottomY = centerY + height/2;
        const startHorizontal = Math.floor(topY / this.gridLineSpacing) * this.gridLineSpacing;
        const endHorizontal = Math.ceil(bottomY / this.gridLineSpacing) * this.gridLineSpacing;
        
        for (let y = startHorizontal; y <= endHorizontal; y += this.gridLineSpacing) {
            if (y >= topY && y <= bottomY) {
                lines.push({
                    type: 'horizontal',
                    x1: centerX - width/2,
                    x2: centerX + width/2,
                    y: y
                });
            }
        }
        
        return lines;
    }
    
    // Generate weapon stations for a specific grid section
    generateWeaponStationsForSection(gridX, gridY) {
        const sectionKey = `${gridX},${gridY}`;
        
        if (this.weaponStationCache.has(sectionKey)) {
            return this.weaponStationCache.get(sectionKey);
        }
        
        const stations = [];
        const baseX = gridX * this.gridSize;
        const baseY = gridY * this.gridSize;
        
        // Use grid coordinates to seed random generation
        const seed = this.hash(gridX, gridY);
        
        // Determine number of stations for this section (0-4)
        const stationCount = Math.floor((seed % 100) / 25); // 0, 1, 2, or 3 stations
        
        for (let i = 0; i < stationCount; i++) {
            const stationSeed = this.hash(seed, i + 1000); // Different seed space than stars
            const x = baseX + 100 + ((stationSeed % (this.gridSize - 200))); // Keep away from edges
            const y = baseY + 100 + (((stationSeed >> 16) % (this.gridSize - 200)));
            
            // Choose powerup type based on seed
            const powerUpType = (stationSeed % 2 === 0) ? 'S' : 'F';
            
            stations.push(new WeaponStation(x, y, powerUpType));
        }
        
        this.weaponStationCache.set(sectionKey, stations);
        return stations;
    }
    
    // Get all weapon stations visible in the given viewport
    getVisibleWeaponStations(centerX, centerY, width, height) {
        const stations = [];
        
        // Calculate which grid sections are visible
        const leftGrid = Math.floor((centerX - width/2) / this.gridSize);
        const rightGrid = Math.floor((centerX + width/2) / this.gridSize);
        const topGrid = Math.floor((centerY - height/2) / this.gridSize);
        const bottomGrid = Math.floor((centerY + height/2) / this.gridSize);
        
        // Generate stations for each visible section
        for (let gridX = leftGrid; gridX <= rightGrid; gridX++) {
            for (let gridY = topGrid; gridY <= bottomGrid; gridY++) {
                const sectionStations = this.generateWeaponStationsForSection(gridX, gridY);
                
                // Filter stations that are actually visible and active
                for (const station of sectionStations) {
                    if (station.isActive &&
                        station.position.x >= centerX - width/2 && station.position.x <= centerX + width/2 &&
                        station.position.y >= centerY - height/2 && station.position.y <= centerY + height/2) {
                        stations.push(station);
                    }
                }
            }
        }
        
        return stations;
    }
    
    // Generate enemies for a specific grid section
    generateEnemiesForSection(gridX, gridY) {
        const sectionKey = `${gridX},${gridY}`;
        
        if (this.enemyCache.has(sectionKey)) {
            return this.enemyCache.get(sectionKey);
        }
        
        const enemies = [];
        const baseX = gridX * this.gridSize;
        const baseY = gridY * this.gridSize;
        
        // Use grid coordinates to seed random generation
        const seed = this.hash(gridX, gridY);
        
        // Determine number of enemies for this section (1-5)
        const enemyCount = 1 + Math.floor((seed % 100) / 20); // 1-5 enemies
        
        for (let i = 0; i < enemyCount; i++) {
            const enemySeed = this.hash(seed, i + 2000); // Different seed space
            const x = baseX + 150 + ((enemySeed % (this.gridSize - 300))); // Keep away from edges
            const y = baseY + 150 + (((enemySeed >> 16) % (this.gridSize - 300)));
            
            // Choose enemy type (25% chance for large, 75% for small)
            const enemyType = (enemySeed % 4 === 0) ? 'large' : 'small';
            
            enemies.push(new Enemy(x, y, enemyType));
        }
        
        this.enemyCache.set(sectionKey, enemies);
        return enemies;
    }
    
    // Get all enemies in the given area (for spawning/updating)
    getEnemiesInArea(centerX, centerY, width, height) {
        const enemies = [];
        
        // Calculate which grid sections are in the area
        const leftGrid = Math.floor((centerX - width/2) / this.gridSize);
        const rightGrid = Math.floor((centerX + width/2) / this.gridSize);
        const topGrid = Math.floor((centerY - height/2) / this.gridSize);
        const bottomGrid = Math.floor((centerY + height/2) / this.gridSize);
        
        // Generate enemies for each section in the area
        for (let gridX = leftGrid; gridX <= rightGrid; gridX++) {
            for (let gridY = topGrid; gridY <= bottomGrid; gridY++) {
                const sectionEnemies = this.generateEnemiesForSection(gridX, gridY);
                enemies.push(...sectionEnemies);
            }
        }
        
        return enemies;
    }
}