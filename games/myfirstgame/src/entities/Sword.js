class Sword {
    constructor(scene) {
        this.scene = scene;
        this.damage = 25;
        this.reach = 4; // Much longer reach
        this.attackCooldown = 0.2; // Much faster attacks
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.sweepDuration = 0.3; // Faster sweep animation
        
        this.createMesh();
    }
    
    createMesh() {
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.0);
        const bladeGeometry = new THREE.BoxGeometry(0.1, 2.5, 0.02); // Much longer blade
        
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
        
        this.handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
        this.bladeMesh = new THREE.Mesh(bladeGeometry, bladeMaterial);
        
        this.bladeMesh.position.y = 1.75; // Adjust for longer blade
        
        this.mesh = new THREE.Group();
        this.mesh.add(this.handleMesh);
        this.mesh.add(this.bladeMesh);
        
        this.scene.add(this.mesh);
    }
    
    update(playerPosition, playerRotation) {
        if (this.isAttacking) {
            const attackProgress = (Date.now() - this.lastAttackTime) / (this.sweepDuration * 1000);
            if (attackProgress < 1) {
                // Full 360-degree sweep around the player
                const sweepAngle = attackProgress * Math.PI * 2; // Complete circle
                const radius = 2.0; // Stick out further from player
                
                // Position sword at current sweep angle
                this.mesh.position.set(
                    playerPosition.x + Math.sin(playerRotation.y + sweepAngle) * radius,
                    playerPosition.y + 0.1,
                    playerPosition.z + Math.cos(playerRotation.y + sweepAngle) * radius
                );
                
                // Point sword outward from player
                this.mesh.rotation.y = playerRotation.y + sweepAngle + Math.PI / 2;
            } else {
                this.isAttacking = false;
                // Reset to resting position
                this.resetToRestPosition(playerPosition, playerRotation);
            }
        } else {
            // Resting position - sword at player's side
            this.resetToRestPosition(playerPosition, playerRotation);
        }
    }
    
    resetToRestPosition(playerPosition, playerRotation) {
        const sideOffset = Math.PI / 2; // 90 degrees to the right
        const radius = 1.2; // Closer when not attacking
        
        this.mesh.position.set(
            playerPosition.x + Math.sin(playerRotation.y + sideOffset) * radius,
            playerPosition.y + 0.1,
            playerPosition.z + Math.cos(playerRotation.y + sideOffset) * radius
        );
        this.mesh.rotation.y = playerRotation.y;
    }
    
    attack() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime < this.attackCooldown * 1000) {
            return false;
        }
        
        this.lastAttackTime = currentTime;
        this.isAttacking = true;
        return true;
    }
    
    canHit(targetPosition, playerPosition) {
        const distance = Vector3Utils.distance(playerPosition, targetPosition);
        return distance <= this.reach;
    }
    
    getDamage() {
        return this.damage;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sword;
} else if (typeof window !== 'undefined') {
    window.Sword = Sword;
}