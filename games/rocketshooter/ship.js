class Ship {
    constructor(x = 0, y = 0) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.rotation = 0; // radians
        this.thrust = 0;
        this.maxThrust = 300;
        this.rotationSpeed = 4; // radians per second
        this.size = 16;
        this.drag = 0.98;
        this.isThrusting = false;
        
        // Control state
        this.controls = {
            left: false,
            right: false,
            thrust: false,
            shoot: false
        };
        
        // Weapon system
        this.fireRate = 0.15; // seconds between shots
        this.lastShotTime = 0;
        
        // Powerup system
        this.powerUps = new Map(); // type -> PowerUp instance
        this.baseMaxThrust = this.maxThrust;
        
        // State management
        this.isAlive = true;
    }
    
    update(deltaTime, currentTime) {
        // Rotation
        if (this.controls.left) {
            this.rotation -= this.rotationSpeed * deltaTime;
        }
        if (this.controls.right) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        
        // Thrust
        if (this.controls.thrust) {
            this.isThrusting = true;
            const thrustDirection = new Vector2(0, -1).rotate(this.rotation);
            const thrustForce = thrustDirection.multiply(this.maxThrust * deltaTime);
            this.velocity = this.velocity.add(thrustForce);
        } else {
            this.isThrusting = false;
        }
        
        // Apply drag
        this.velocity = this.velocity.multiply(this.drag);
        
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Handle shooting
        if (this.controls.shoot && currentTime - this.lastShotTime >= this.fireRate) {
            this.lastShotTime = currentTime;
            return this.createProjectiles();
        }
        
        return null;
    }
    
    createProjectiles() {
        const projectiles = [];
        const shooterLevel = this.powerUps.has('S') ? this.powerUps.get('S').level : 0;
        
        if (shooterLevel === 0) {
            // Default: shoot forward only
            const direction = this.getForwardVector();
            const spawnPos = this.position.add(direction.multiply(this.size * 0.8));
            projectiles.push(new Projectile(spawnPos.x, spawnPos.y, direction, this.rotation));
        } else {
            // Multi-directional shooting based on level
            const directions = this.getShootingDirections(shooterLevel);
            
            for (const dir of directions) {
                const spawnPos = this.position.add(dir.multiply(this.size * 0.8));
                const rotation = Math.atan2(dir.x, -dir.y);
                projectiles.push(new Projectile(spawnPos.x, spawnPos.y, dir, rotation));
            }
        }
        
        return projectiles;
    }
    
    getShootingDirections(level) {
        const directions = [];
        
        // Always shoot forward
        directions.push(this.getForwardVector());
        
        if (level >= 1) {
            // Level 1: Add backward
            directions.push(this.getForwardVector().multiply(-1));
        }
        
        if (level >= 2) {
            // Level 2: Add right
            directions.push(this.getRightVector());
        }
        
        if (level >= 3) {
            // Level 3: Add left
            directions.push(this.getRightVector().multiply(-1));
        }
        
        if (level >= 4) {
            // Level 4: Add diagonal forward-right
            const diag1 = this.getForwardVector().add(this.getRightVector()).normalize();
            directions.push(diag1);
        }
        
        if (level >= 5) {
            // Level 5: Add diagonal forward-left
            const diag2 = this.getForwardVector().add(this.getRightVector().multiply(-1)).normalize();
            directions.push(diag2);
        }
        
        if (level >= 6) {
            // Level 6: Add diagonal backward-right
            const diag3 = this.getForwardVector().multiply(-1).add(this.getRightVector()).normalize();
            directions.push(diag3);
        }
        
        if (level >= 7) {
            // Level 7: Add diagonal backward-left
            const diag4 = this.getForwardVector().multiply(-1).add(this.getRightVector().multiply(-1)).normalize();
            directions.push(diag4);
        }
        
        // Level 8 already has all 8 directions
        
        return directions;
    }
    
    addPowerUp(powerUp) {
        if (this.powerUps.has(powerUp.type)) {
            // Upgrade existing powerup
            this.powerUps.get(powerUp.type).upgrade();
        } else {
            // Add new powerup
            this.powerUps.set(powerUp.type, powerUp);
        }
        
        // Apply powerup effects
        this.applyPowerUpEffects();
    }
    
    applyPowerUpEffects() {
        // Reset to base values
        this.maxThrust = this.baseMaxThrust;
        
        // Apply Faster powerup
        if (this.powerUps.has('F')) {
            const fasterLevel = this.powerUps.get('F').level;
            this.maxThrust = this.baseMaxThrust * (1 + fasterLevel * 0.5); // 50% increase per level
        }
    }
    
    getPowerUpStatus() {
        const status = [];
        for (const [type, powerUp] of this.powerUps) {
            status.push(`${type}${powerUp.level}`);
        }
        return status.join(' ');
    }
    
    checkCollisionWithStations(stations) {
        for (const station of stations) {
            if (station.checkCollision(this)) {
                const powerUp = station.collect();
                this.addPowerUp(powerUp);
                return true;
            }
        }
        return false;
    }
    
    checkCollisionWithProjectiles(projectiles) {
        if (!this.isAlive) return false;
        
        for (const projectile of projectiles) {
            if (projectile.isEnemyProjectile && projectile.isActive) {
                if (projectile.checkCollision(this.position, this.size/2)) {
                    projectile.isActive = false;
                    this.destroy();
                    return true;
                }
            }
        }
        return false;
    }
    
    destroy() {
        this.isAlive = false;
        return new Explosion(this.position.x, this.position.y, this.getShape());
    }
    
    setControl(control, value) {
        if (control in this.controls) {
            this.controls[control] = value;
        }
    }
    
    getForwardVector() {
        return new Vector2(0, -1).rotate(this.rotation);
    }
    
    getRightVector() {
        return new Vector2(1, 0).rotate(this.rotation);
    }
    
    getShape() {
        const forward = this.getForwardVector();
        const right = this.getRightVector();
        
        // Ship body (rectangle)
        const bodyWidth = this.size * 0.6;
        const bodyHeight = this.size * 0.8;
        
        const body = [
            this.position.add(forward.multiply(bodyHeight/2)).add(right.multiply(bodyWidth/2)),
            this.position.add(forward.multiply(bodyHeight/2)).add(right.multiply(-bodyWidth/2)),
            this.position.add(forward.multiply(-bodyHeight/2)).add(right.multiply(-bodyWidth/2)),
            this.position.add(forward.multiply(-bodyHeight/2)).add(right.multiply(bodyWidth/2))
        ];
        
        // Nose (triangle)
        const noseLength = this.size * 0.4;
        const noseWidth = this.size * 0.3;
        
        const nose = [
            this.position.add(forward.multiply(bodyHeight/2 + noseLength)),
            this.position.add(forward.multiply(bodyHeight/2)).add(right.multiply(noseWidth/2)),
            this.position.add(forward.multiply(bodyHeight/2)).add(right.multiply(-noseWidth/2))
        ];
        
        // Thruster (lines when thrusting)
        const thruster = [];
        if (this.isThrusting) {
            const thrusterLength = this.size * 0.3;
            const thrusterWidth = this.size * 0.2;
            
            thruster.push([
                this.position.add(forward.multiply(-bodyHeight/2)),
                this.position.add(forward.multiply(-bodyHeight/2 - thrusterLength)).add(right.multiply(thrusterWidth/2))
            ]);
            thruster.push([
                this.position.add(forward.multiply(-bodyHeight/2)),
                this.position.add(forward.multiply(-bodyHeight/2 - thrusterLength)).add(right.multiply(-thrusterWidth/2))
            ]);
            thruster.push([
                this.position.add(forward.multiply(-bodyHeight/2)),
                this.position.add(forward.multiply(-bodyHeight/2 - thrusterLength))
            ]);
        }
        
        return { body, nose, thruster };
    }
}