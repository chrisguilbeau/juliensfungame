class PowerUp {
    constructor(type, level = 1) {
        this.type = type; // 'S' or 'F'
        this.level = level;
        this.maxLevel = type === 'S' ? 8 : 3;
    }
    
    canUpgrade() {
        return this.level < this.maxLevel;
    }
    
    upgrade() {
        if (this.canUpgrade()) {
            this.level++;
            return true;
        }
        return false;
    }
    
    getDescription() {
        switch(this.type) {
            case 'S':
                return `Shooter Level ${this.level}`;
            case 'F':
                return `Faster Level ${this.level}`;
            default:
                return `Unknown ${this.type}`;
        }
    }
}

class WeaponStation {
    constructor(x, y, powerUpType) {
        this.position = new Vector2(x, y);
        this.powerUpType = powerUpType; // 'S' or 'F'
        this.radius = 8;
        this.isActive = true;
        this.pulseTime = 0;
        
        // Colors for different powerup types
        this.colors = {
            'S': '#ff4444', // Red for Shooter
            'F': '#4444ff'  // Blue for Faster
        };
    }
    
    update(deltaTime) {
        this.pulseTime += deltaTime * 3; // Pulse animation
    }
    
    getColor() {
        const baseColor = this.colors[this.powerUpType] || '#ffffff';
        const pulse = 0.7 + 0.3 * Math.sin(this.pulseTime);
        
        // Convert hex to RGB and apply pulse
        const r = Math.floor(parseInt(baseColor.substr(1, 2), 16) * pulse);
        const g = Math.floor(parseInt(baseColor.substr(3, 2), 16) * pulse);
        const b = Math.floor(parseInt(baseColor.substr(5, 2), 16) * pulse);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    checkCollision(ship) {
        if (!this.isActive) return false;
        
        const distance = ship.position.subtract(this.position).length();
        return distance < (this.radius + ship.size/2);
    }
    
    collect() {
        this.isActive = false;
        return new PowerUp(this.powerUpType);
    }
}