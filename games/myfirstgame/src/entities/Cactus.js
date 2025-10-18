class Cactus {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.health = 30;
        this.damage = 5; // Contact damage
        this.position = { ...position };
        this.position.y = 0; // On ground
        this.isAlive = true;
        this.lastDamageTime = 0;
        this.damageCooldown = 1000; // 1 second between damage ticks
        
        this.createMesh();
    }
    
    createMesh() {
        this.cactusGroup = new THREE.Group();
        
        // Main cactus trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 3, 8);
        const cactusColor = 0x228B22; // Forest green
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: cactusColor });
        this.trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        this.trunk.position.y = 1.5;
        this.trunk.castShadow = true;
        this.trunk.receiveShadow = true;
        
        // Left arm
        const armGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.5, 8);
        const leftArm = new THREE.Mesh(armGeometry, trunkMaterial);
        leftArm.position.set(-0.6, 2, 0);
        leftArm.rotation.z = Math.PI / 6; // Slight upward angle
        leftArm.castShadow = true;
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, trunkMaterial);
        rightArm.position.set(0.6, 1.8, 0);
        rightArm.rotation.z = -Math.PI / 6; // Slight upward angle
        rightArm.castShadow = true;
        
        // Add spikes around the cactus
        this.createSpikes();
        
        this.cactusGroup.add(this.trunk);
        this.cactusGroup.add(leftArm);
        this.cactusGroup.add(rightArm);
        
        this.cactusGroup.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.cactusGroup);
        
        this.mesh = this.cactusGroup; // For compatibility with game systems
    }
    
    createSpikes() {
        const spikeGeometry = new THREE.ConeGeometry(0.05, 0.2, 4);
        const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown spikes
        
        // Add spikes around the trunk
        for (let i = 0; i < 12; i++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            const angle = (i / 12) * Math.PI * 2;
            const height = Math.random() * 2 + 0.5; // Random height on trunk
            
            spike.position.set(
                Math.cos(angle) * 0.6,
                height,
                Math.sin(angle) * 0.6
            );
            spike.lookAt(
                spike.position.x * 2,
                spike.position.y,
                spike.position.z * 2
            );
            
            this.trunk.add(spike);
        }
    }
    
    canDamagePlayer(playerPosition) {
        const distance = Vector3Utils.distance(this.position, playerPosition);
        const currentTime = Date.now();
        
        return this.isAlive && 
               distance <= 1.2 && // Close contact
               (currentTime - this.lastDamageTime) >= this.damageCooldown;
    }
    
    damagePlayer() {
        this.lastDamageTime = Date.now();
        return this.damage;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Visual damage feedback - flash lighter green
        this.trunk.material.color.setHex(0x90EE90);
        setTimeout(() => {
            if (this.trunk && this.trunk.material) {
                this.trunk.material.color.setHex(0x228B22);
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
        this.scene.remove(this.cactusGroup);
        
        // Clean up resources
        if (this.cactusGroup) {
            this.cactusGroup.traverse((child) => {
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
    module.exports = Cactus;
} else if (typeof window !== 'undefined') {
    window.Cactus = Cactus;
}