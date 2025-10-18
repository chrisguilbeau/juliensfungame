class Enemy {
    constructor(scene, position = { x: 0, y: 1, z: 0 }) {
        this.scene = scene;
        this.health = 50;
        this.speed = 8; // Much faster!
        this.damage = 10;
        this.position = { ...position };
        this.velocity = { 
            x: (Math.random() - 0.5) * 10, 
            y: 0, 
            z: (Math.random() - 0.5) * 10 
        }; // Random starting velocity for bouncing
        this.bounceHeight = 0;
        this.bounceSpeed = 6;
        this.attackRange = 1.5;
        this.lastAttackTime = 0;
        this.attackCooldown = 1.0;
        this.isAlive = true;
        
        this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color: 0xff4444 });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.createFace();
        
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.mesh);
    }
    
    createFace() {
        const faceGroup = new THREE.Group();
        
        // Make eyes bigger and more visible
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red angry eyes
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 0.08, 0.38);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 0.08, 0.38);
        
        // Create angry eyebrows
        const browGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.02);
        const browMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
        leftBrow.position.set(-0.12, 0.18, 0.39);
        leftBrow.rotation.z = 0.3; // Angled for angry look
        
        const rightBrow = new THREE.Mesh(browGeometry, browMaterial);
        rightBrow.position.set(0.12, 0.18, 0.39);
        rightBrow.rotation.z = -0.3; // Angled for angry look
        
        // Create angry mouth (frown)
        const mouthGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.08, 0.38);
        mouth.rotation.z = Math.PI; // Upside down for frown
        
        faceGroup.add(leftEye);
        faceGroup.add(rightEye);
        faceGroup.add(leftBrow);
        faceGroup.add(rightBrow);
        faceGroup.add(mouth);
        
        this.mesh.add(faceGroup);
    }
    
    update(deltaTime, playerPosition) {
        if (!this.isAlive) return;
        
        this.bounceAndMove(deltaTime, playerPosition);
        this.updateBounceAnimation(deltaTime);
        this.mesh.position.set(this.position.x, this.position.y + this.bounceHeight, this.position.z);
    }
    
    bounceAndMove(deltaTime, playerPosition) {
        // Add chaotic bouncing movement towards player
        const directionToPlayer = {
            x: playerPosition.x - this.position.x,
            y: 0,
            z: playerPosition.z - this.position.z
        };
        
        const distanceToPlayer = Vector3Utils.distance(this.position, playerPosition);
        
        // Mix player attraction with current velocity for chaotic movement
        const playerInfluence = 0.3; // How much they're attracted to player
        const normalizedPlayerDir = Vector3Utils.normalize(directionToPlayer);
        
        // Add player attraction to velocity
        this.velocity.x += normalizedPlayerDir.x * this.speed * playerInfluence * deltaTime;
        this.velocity.z += normalizedPlayerDir.z * this.speed * playerInfluence * deltaTime;
        
        // Add some randomness for chaos
        this.velocity.x += (Math.random() - 0.5) * 2 * deltaTime;
        this.velocity.z += (Math.random() - 0.5) * 2 * deltaTime;
        
        // Apply velocity damping to prevent infinite acceleration
        this.velocity.x *= 0.95;
        this.velocity.z *= 0.95;
        
        // Move based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Bounce off world boundaries (optional - keeps them in area)
        const worldSize = 50;
        if (Math.abs(this.position.x) > worldSize) {
            this.velocity.x *= -0.8;
            this.position.x = Math.sign(this.position.x) * worldSize;
        }
        if (Math.abs(this.position.z) > worldSize) {
            this.velocity.z *= -0.8;
            this.position.z = Math.sign(this.position.z) * worldSize;
        }
    }
    
    updateBounceAnimation(deltaTime) {
        // Continuous bouncing animation
        this.bounceHeight = Math.abs(Math.sin(Date.now() * 0.008)) * 0.5;
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
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }
    
    die() {
        this.isAlive = false;
        this.scene.remove(this.mesh);
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
    module.exports = Enemy;
} else if (typeof window !== 'undefined') {
    window.Enemy = Enemy;
}