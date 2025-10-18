class Enemy {
    constructor(x, y, type = 'small') {
        this.position = new Vector2(x, y);
        this.type = type;
        this.isActive = true;
        this.age = 0;
        
        // Different stats for different enemy types
        if (type === 'large') {
            this.size = 32;
            this.speed = 50;
            this.health = 3;
            this.maxHealth = 3;
            this.shootInterval = 1.5; // shoots every 1.5 seconds
        } else {
            this.size = 16;
            this.speed = 120;
            this.health = 1;
            this.maxHealth = 1;
            this.shootInterval = 1.0; // shoots every 1 second
        }
        
        // Zigzag movement pattern
        this.baseDirection = new Vector2(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();
        this.zigzagFrequency = 2 + Math.random() * 3; // 2-5 Hz
        this.zigzagAmplitude = 0.5 + Math.random() * 0.5; // 0.5-1.0
        
        this.lastShotTime = Math.random() * this.shootInterval; // Random start
        this.velocity = new Vector2(0, 0);
    }
    
    update(deltaTime, playerPosition) {
        this.age += deltaTime;
        
        // Calculate zigzag movement
        const zigzagOffset = Math.sin(this.age * this.zigzagFrequency * Math.PI * 2) * this.zigzagAmplitude;
        
        // Get perpendicular direction for zigzag
        const perpDirection = new Vector2(-this.baseDirection.y, this.baseDirection.x);
        
        // Combine base direction with zigzag
        const moveDirection = this.baseDirection.add(perpDirection.multiply(zigzagOffset)).normalize();
        this.velocity = moveDirection.multiply(this.speed);
        
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Check if should shoot
        if (this.age - this.lastShotTime >= this.shootInterval) {
            this.lastShotTime = this.age;
            return this.createProjectile(playerPosition);
        }
        
        return null;
    }
    
    createProjectile(playerPosition) {
        // Shoot in a random direction with some bias toward player
        const toPlayer = playerPosition.subtract(this.position).normalize();
        const randomAngle = (Math.random() - 0.5) * Math.PI; // ±90 degrees
        const shootDirection = toPlayer.rotate(randomAngle);
        
        const spawnPos = this.position.add(shootDirection.multiply(this.size * 0.6));
        return new EnemyProjectile(spawnPos.x, spawnPos.y, shootDirection);
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isActive = false;
            return true; // Enemy destroyed
        }
        return false;
    }
    
    checkCollision(otherPosition, otherRadius) {
        const distance = this.position.subtract(otherPosition).length();
        return distance < (this.size/2 + otherRadius);
    }
    
    getShape() {
        // Flying saucer design
        const centerX = this.position.x;
        const centerY = this.position.y;
        const radius = this.size / 2;
        
        // Main body (ellipse)
        const bodyWidth = radius * 1.5;
        const bodyHeight = radius * 0.4;
        
        // Top dome (smaller ellipse)
        const domeWidth = radius * 0.8;
        const domeHeight = radius * 0.3;
        
        // Create saucer outline points
        const bodyPoints = [];
        const domePoints = [];
        
        // Generate ellipse points for body
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            bodyPoints.push(new Vector2(
                centerX + Math.cos(angle) * bodyWidth,
                centerY + Math.sin(angle) * bodyHeight
            ));
        }
        
        // Generate ellipse points for dome
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            domePoints.push(new Vector2(
                centerX + Math.cos(angle) * domeWidth,
                centerY - radius * 0.2 + Math.sin(angle) * domeHeight
            ));
        }
        
        // Add some detail lines
        const detailLines = [
            // Horizontal line across middle
            [new Vector2(centerX - bodyWidth, centerY), new Vector2(centerX + bodyWidth, centerY)],
            // Vertical line in center
            [new Vector2(centerX, centerY - bodyHeight), new Vector2(centerX, centerY + bodyHeight)]
        ];
        
        return {
            body: bodyPoints,
            dome: domePoints,
            details: detailLines
        };
    }
    
    isOffScreen(centerX, centerY, screenWidth, screenHeight) {
        const margin = 200; // Extra margin for cleanup
        const left = centerX - screenWidth/2 - margin;
        const right = centerX + screenWidth/2 + margin;
        const top = centerY - screenHeight/2 - margin;
        const bottom = centerY + screenHeight/2 + margin;
        
        return this.position.x < left || this.position.x > right || 
               this.position.y < top || this.position.y > bottom;
    }
}

class EnemyProjectile {
    constructor(x, y, direction) {
        this.position = new Vector2(x, y);
        this.velocity = direction.multiply(400); // Slightly slower than player projectiles
        this.size = 3;
        this.lifeTime = 4.0; // seconds
        this.age = 0;
        this.isActive = true;
        this.isEnemyProjectile = true; // Flag to distinguish from player projectiles
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.age += deltaTime;
        
        if (this.age >= this.lifeTime) {
            this.isActive = false;
            return;
        }
        
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }
    
    checkCollision(otherPosition, otherRadius) {
        const distance = this.position.subtract(otherPosition).length();
        return distance < (this.size/2 + otherRadius);
    }
    
    isOffScreen(centerX, centerY, screenWidth, screenHeight) {
        const margin = 100;
        const left = centerX - screenWidth/2 - margin;
        const right = centerX + screenWidth/2 + margin;
        const top = centerY - screenHeight/2 - margin;
        const bottom = centerY + screenHeight/2 + margin;
        
        return this.position.x < left || this.position.x > right || 
               this.position.y < top || this.position.y > bottom;
    }
    
    getShape() {
        const start = this.position.subtract(this.velocity.normalize().multiply(this.size / 2));
        const end = this.position.add(this.velocity.normalize().multiply(this.size / 2));
        return { start, end };
    }
}