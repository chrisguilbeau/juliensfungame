class Projectile {
    constructor(x, y, direction, rotation) {
        this.position = new Vector2(x, y);
        this.velocity = direction.multiply(800); // pixels per second
        this.rotation = rotation;
        this.size = 4; // Length of the projectile line
        this.lifeTime = 3.0; // seconds before auto-cleanup
        this.age = 0;
        this.isActive = true;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.age += deltaTime;
        
        // Remove projectile if it's too old
        if (this.age >= this.lifeTime) {
            this.isActive = false;
            return;
        }
        
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }
    
    // Check if projectile is outside screen bounds (for cleanup)
    isOffScreen(centerX, centerY, screenWidth, screenHeight) {
        const margin = 100; // Extra margin for cleanup
        const left = centerX - screenWidth/2 - margin;
        const right = centerX + screenWidth/2 + margin;
        const top = centerY - screenHeight/2 - margin;
        const bottom = centerY + screenHeight/2 + margin;
        
        return this.position.x < left || this.position.x > right || 
               this.position.y < top || this.position.y > bottom;
    }
    
    getShape() {
        const direction = new Vector2(0, -1).rotate(this.rotation);
        const start = this.position.subtract(direction.multiply(this.size / 2));
        const end = this.position.add(direction.multiply(this.size / 2));
        
        return { start, end };
    }
}