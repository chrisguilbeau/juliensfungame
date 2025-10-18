class Helper {
    constructor(scene, playerPosition) {
        this.scene = scene;
        this.health = 30;
        this.speed = 10; // Fast little helpers
        this.damage = 15;
        this.position = {
            x: playerPosition.x + (Math.random() - 0.5) * 2,
            y: playerPosition.y,
            z: playerPosition.z + (Math.random() - 0.5) * 2
        };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.targetEnemy = null;
        this.attackRange = 1.0;
        this.lastAttackTime = 0;
        this.attackCooldown = 0.3; // Fast attacks
        this.isAlive = true;
        this.bounceHeight = 0;
        this.lifetime = 15000; // Helpers last 15 seconds
        this.spawnTime = Date.now();
        
        this.createMesh();
    }
    
    createMesh() {
        // Small white sphere with a happy face
        const geometry = new THREE.SphereGeometry(0.2, 12, 12);
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Pure white
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.createHappyFace();
        
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.mesh);
    }
    
    createHappyFace() {
        const faceGroup = new THREE.Group();
        
        // Happy eyes (small black dots)
        const eyeGeometry = new THREE.SphereGeometry(0.02, 6, 6);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 0.05, 0.18);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 0.05, 0.18);
        
        // Happy smile (small arc)
        const mouthGeometry = new THREE.TorusGeometry(0.06, 0.01, 4, 8, Math.PI);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.03, 0.18);
        mouth.rotation.z = 0; // Right-side up for a smile
        
        // Tiny halo above head for angelic look
        const haloGeometry = new THREE.TorusGeometry(0.15, 0.01, 4, 16);
        const haloMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffff00,
            emissive: 0x333300 // Slight glow
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.position.set(0, 0.3, 0);
        halo.rotation.x = Math.PI / 2;
        
        faceGroup.add(leftEye);
        faceGroup.add(rightEye);
        faceGroup.add(mouth);
        faceGroup.add(halo);
        
        this.mesh.add(faceGroup);
    }
    
    update(deltaTime, enemies, playerPosition) {
        if (!this.isAlive) return false;
        
        // Check lifetime - helpers disappear after 15 seconds
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.die();
            return false;
        }
        
        this.findTarget(enemies);
        this.moveAndAttack(deltaTime, enemies);
        this.updateBounceAnimation();
        this.mesh.position.set(this.position.x, this.position.y + this.bounceHeight, this.position.z);
        
        return true;
    }
    
    findTarget(enemies) {
        // Find the closest living enemy
        let closestDistance = Infinity;
        let closestEnemy = null;
        
        enemies.forEach(enemy => {
            if (!enemy.isDead()) {
                const distance = Vector3Utils.distance(this.position, enemy.getPosition());
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        });
        
        this.targetEnemy = closestEnemy;
    }
    
    moveAndAttack(deltaTime, enemies) {
        if (!this.targetEnemy || this.targetEnemy.isDead()) {
            // No target, just bounce around player area
            const randomDir = {
                x: (Math.random() - 0.5) * 2,
                y: 0,
                z: (Math.random() - 0.5) * 2
            };
            const normalizedDir = Vector3Utils.normalize(randomDir);
            const movement = Vector3Utils.multiply(normalizedDir, this.speed * 0.5 * deltaTime);
            this.position = Vector3Utils.add(this.position, movement);
            return;
        }
        
        const targetPos = this.targetEnemy.getPosition();
        const distance = Vector3Utils.distance(this.position, targetPos);
        
        if (distance <= this.attackRange) {
            // Attack the enemy
            this.attackTarget();
        } else {
            // Move towards target
            const direction = {
                x: targetPos.x - this.position.x,
                y: 0,
                z: targetPos.z - this.position.z
            };
            const normalizedDir = Vector3Utils.normalize(direction);
            const movement = Vector3Utils.multiply(normalizedDir, this.speed * deltaTime);
            this.position = Vector3Utils.add(this.position, movement);
        }
    }
    
    attackTarget() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime < this.attackCooldown * 1000) {
            return;
        }
        
        this.lastAttackTime = currentTime;
        
        if (this.targetEnemy && !this.targetEnemy.isDead()) {
            const killed = this.targetEnemy.takeDamage(this.damage);
            if (killed) {
                this.targetEnemy = null; // Clear target if killed
            }
        }
    }
    
    updateBounceAnimation() {
        // Fast, energetic bouncing
        this.bounceHeight = Math.abs(Math.sin(Date.now() * 0.015)) * 0.3;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }
    
    die() {
        this.isAlive = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            // Dispose of geometry and materials
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    getHealth() {
        return this.health;
    }
    
    isDead() {
        return !this.isAlive;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helper;
} else if (typeof window !== 'undefined') {
    window.Helper = Helper;
}