class GiantEnemy {
    constructor(scene, position = { x: 0, y: 1, z: 0 }) {
        this.scene = scene;
        this.health = 120; // Reduced health for balance
        this.speed = 2; // Even slower
        this.damage = 15; // Much reduced damage
        this.position = { ...position };
        this.position.y = 2.5; // Higher up due to size
        this.rotation = { x: 0, y: 0, z: 0 };
        this.spinSpeed = 1.5; // Slower spinning
        this.attackRange = 3; // Much shorter reach - fair fight!
        this.lastAttackTime = 0;
        this.attackCooldown = 2.5; // Longer cooldown
        this.isAlive = true;
        
        this.createMesh();
    }
    
    createMesh() {
        this.mesh = new THREE.Group();
        
        // Main body - large rectangular block like Easter Island statue
        const bodyGeometry = new THREE.BoxGeometry(3, 5, 2); // 5 feet tall, 3 feet wide, 2 feet deep
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 }); // Stone color
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.position.y = 0; // Center the body
        
        this.createEasterIslandFace();
        this.mesh.add(this.bodyMesh);
        
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.mesh);
    }
    
    createEasterIslandFace() {
        const faceGroup = new THREE.Group();
        
        // Large nose (prominent feature of Easter Island statues)
        const noseGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0x9B8365 }); // Slightly lighter stone
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.5, 1.2);
        
        // Deep-set eyes (rectangular indentations)
        const eyeGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.2);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F }); // Dark eye sockets
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.6, 1.2, 1.1);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.6, 1.2, 1.1);
        
        // Glowing red pupils in the eye sockets
        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff0000,
            emissive: 0x440000 // Red glow
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.6, 1.2, 1.25);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.6, 1.2, 1.25);
        
        // Serious mouth (horizontal line carved into stone)
        const mouthGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x1F1F1F });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 0, 1.15);
        
        // Heavy brow ridge
        const browGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.4);
        const browMaterial = new THREE.MeshLambertMaterial({ color: 0x9B8365 });
        const brow = new THREE.Mesh(browGeometry, browMaterial);
        brow.position.set(0, 1.5, 1.0);
        
        // Ear details (long earlobes like Easter Island statues)
        const earGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.3);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-1.6, 0.5, 0);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(1.6, 0.5, 0);
        
        faceGroup.add(nose);
        faceGroup.add(leftEye);
        faceGroup.add(rightEye);
        faceGroup.add(leftPupil);
        faceGroup.add(rightPupil);
        faceGroup.add(mouth);
        faceGroup.add(brow);
        faceGroup.add(leftEar);
        faceGroup.add(rightEar);
        
        this.bodyMesh.add(faceGroup);
    }
    
    
    update(deltaTime, playerPosition) {
        if (!this.isAlive) return;
        
        this.spin(deltaTime);
        this.moveTowardsPlayer(deltaTime, playerPosition);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.y = this.rotation.y;
    }
    
    spin(deltaTime) {
        // Constant spinning motion
        this.rotation.y += this.spinSpeed * deltaTime;
        if (this.rotation.y > Math.PI * 2) {
            this.rotation.y -= Math.PI * 2;
        }
    }
    
    moveTowardsPlayer(deltaTime, playerPosition) {
        // Slow, menacing approach
        const direction = {
            x: playerPosition.x - this.position.x,
            y: 0,
            z: playerPosition.z - this.position.z
        };
        
        const distance = Vector3Utils.distance(this.position, playerPosition);
        if (distance > this.attackRange * 0.7) { // Don't get too close
            const normalizedDir = Vector3Utils.normalize(direction);
            const movement = Vector3Utils.multiply(normalizedDir, this.speed * deltaTime);
            this.position = Vector3Utils.add(this.position, movement);
        }
        
        // Boundary checking
        const worldSize = 45; // Stay a bit inside world bounds due to size
        if (Math.abs(this.position.x) > worldSize) {
            this.position.x = Math.sign(this.position.x) * worldSize;
        }
        if (Math.abs(this.position.z) > worldSize) {
            this.position.z = Math.sign(this.position.z) * worldSize;
        }
    }
    
    
    canAttack(playerPosition) {
        const distance = Vector3Utils.distance(this.position, playerPosition);
        const currentTime = Date.now();
        
        return distance <= this.attackRange && 
               (currentTime - this.lastAttackTime) >= (this.attackCooldown * 1000);
    }
    
    
    attack() {
        this.lastAttackTime = Date.now();
        return this.damage;
    }
    
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Visual damage feedback - flash red briefly
        this.bodyMesh.material.color.setHex(0xFF4444);
        setTimeout(() => {
            if (this.bodyMesh && this.bodyMesh.material) {
                this.bodyMesh.material.color.setHex(0x8B7355);
            }
        }, 100);
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }
    
    die() {
        this.isAlive = false;
        this.scene.remove(this.mesh);
        
        // Clean up resources
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
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
    module.exports = GiantEnemy;
} else if (typeof window !== 'undefined') {
    window.GiantEnemy = GiantEnemy;
}