class CatEnemy {
    constructor(scene, position = { x: 0, y: 1, z: 0 }) {
        this.scene = scene;
        this.health = 75; // Stronger than regular enemies
        this.speed = 6; // Slightly slower but still fast
        this.damage = 15; // More damage
        this.position = { ...position };
        this.position.y = 2; // Start higher due to long legs
        this.velocity = { 
            x: (Math.random() - 0.5) * 8, 
            y: 0, 
            z: (Math.random() - 0.5) * 8 
        };
        this.bounceHeight = 0;
        this.attackRange = 2.0; // Longer reach due to height
        this.lastAttackTime = 0;
        this.attackCooldown = 0.8;
        this.isAlive = true;
        this.legSwingTime = 0; // For leg animation
        
        this.createMesh();
    }
    
    createMesh() {
        this.mesh = new THREE.Group();
        
        // Create the main body (cat head/body)
        const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffa500 }); // Orange cat
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.position.y = 3; // High up on the legs
        
        // Create 4 very long legs
        this.legs = [];
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3); // Very long legs
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xff8c00 }); // Darker orange
        
        const legPositions = [
            { x: -0.3, z: -0.3 }, // Back left
            { x: 0.3, z: -0.3 },  // Back right
            { x: -0.3, z: 0.3 },  // Front left
            { x: 0.3, z: 0.3 }    // Front right
        ];
        
        legPositions.forEach((pos, index) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, 1.5, pos.z); // Legs are 3 units tall
            leg.userData = { originalX: pos.x, originalZ: pos.z, index: index };
            this.legs.push(leg);
            this.mesh.add(leg);
        });
        
        this.createCatFace();
        this.mesh.add(this.bodyMesh);
        
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.mesh);
    }
    
    createCatFace() {
        const faceGroup = new THREE.Group();
        
        // Cat ears (triangular)
        const earGeometry = new THREE.ConeGeometry(0.15, 0.3, 3);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xff8c00 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.25, 0.35, 0.2);
        leftEar.rotation.z = 0.3;
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.25, 0.35, 0.2);
        rightEar.rotation.z = -0.3;
        
        // Cat eyes (larger and more cat-like)
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 }); // Green cat eyes
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.1, 0.4);
        leftEye.scale.set(1, 0.7, 1); // Make eyes more cat-like (oval)
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.1, 0.4);
        rightEye.scale.set(1, 0.7, 1);
        
        // Cat nose (small triangle)
        const noseGeometry = new THREE.ConeGeometry(0.03, 0.05, 3);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 }); // Pink nose
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0, 0.45);
        nose.rotation.x = Math.PI;
        
        // Cat mouth (two small curves)
        const mouthGeometry = new THREE.TorusGeometry(0.06, 0.01, 4, 8, Math.PI);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftMouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        leftMouth.position.set(-0.05, -0.08, 0.42);
        leftMouth.rotation.z = Math.PI * 1.2;
        
        const rightMouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        rightMouth.position.set(0.05, -0.08, 0.42);
        rightMouth.rotation.z = Math.PI * 0.8;
        
        // Whiskers
        const whiskerGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.4);
        const whiskerMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        for (let i = 0; i < 6; i++) {
            const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
            const side = i < 3 ? -1 : 1;
            const height = -0.02 + (i % 3) * 0.02;
            whisker.position.set(side * 0.3, height, 0.4);
            whisker.rotation.z = side * 0.1;
            whisker.rotation.y = Math.PI / 2;
            faceGroup.add(whisker);
        }
        
        faceGroup.add(leftEar);
        faceGroup.add(rightEar);
        faceGroup.add(leftEye);
        faceGroup.add(rightEye);
        faceGroup.add(nose);
        faceGroup.add(leftMouth);
        faceGroup.add(rightMouth);
        
        this.bodyMesh.add(faceGroup);
    }
    
    update(deltaTime, playerPosition) {
        if (!this.isAlive) return;
        
        this.bounceAndMove(deltaTime, playerPosition);
        this.updateLegAnimation(deltaTime);
        this.updateBounceAnimation(deltaTime);
        this.mesh.position.set(this.position.x, this.position.y + this.bounceHeight, this.position.z);
    }
    
    bounceAndMove(deltaTime, playerPosition) {
        // Similar to regular enemy but slightly different behavior
        const directionToPlayer = {
            x: playerPosition.x - this.position.x,
            y: 0,
            z: playerPosition.z - this.position.z
        };
        
        const normalizedPlayerDir = Vector3Utils.normalize(directionToPlayer);
        const playerInfluence = 0.4; // Slightly more attracted to player
        
        this.velocity.x += normalizedPlayerDir.x * this.speed * playerInfluence * deltaTime;
        this.velocity.z += normalizedPlayerDir.z * this.speed * playerInfluence * deltaTime;
        
        // Less randomness than regular enemies (more focused)
        this.velocity.x += (Math.random() - 0.5) * 1 * deltaTime;
        this.velocity.z += (Math.random() - 0.5) * 1 * deltaTime;
        
        this.velocity.x *= 0.95;
        this.velocity.z *= 0.95;
        
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Bounce off boundaries
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
    
    updateLegAnimation(deltaTime) {
        // Animate the legs swinging back and forth like walking
        this.legSwingTime += deltaTime * 3;
        
        this.legs.forEach((leg, index) => {
            const swingOffset = index * Math.PI / 2; // Different phase for each leg
            const swing = Math.sin(this.legSwingTime + swingOffset) * 0.3;
            
            leg.position.x = leg.userData.originalX + swing;
            leg.rotation.z = swing * 0.5;
        });
    }
    
    updateBounceAnimation(deltaTime) {
        // Slower, more graceful bouncing for the cat
        this.bounceHeight = Math.abs(Math.sin(Date.now() * 0.006)) * 0.3;
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
    module.exports = CatEnemy;
} else if (typeof window !== 'undefined') {
    window.CatEnemy = CatEnemy;
}