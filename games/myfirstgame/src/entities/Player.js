class Player {
    constructor(scene) {
        this.scene = scene;
        this.health = 100;
        this.speed = 5;
        this.position = { x: 0, y: 1, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        
        this.createMesh();
        this.sword = null;
    }
    
    createMesh() {
        const geometry = new THREE.SphereGeometry(0.5, 8, 16);
        geometry.scale(1, 1.5, 1);
        
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        
        if (this.sword) {
            this.sword.update(this.position, this.rotation);
        }
    }
    
    move(direction) {
        const normalizedDir = Vector3Utils.normalize(direction);
        const movement = Vector3Utils.multiply(normalizedDir, this.speed * 0.016);
        this.position = Vector3Utils.add(this.position, movement);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    attack() {
        if (this.sword) {
            return this.sword.attack();
        }
        return false;
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    getHealth() {
        return this.health;
    }
    
    setSword(sword) {
        this.sword = sword;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
} else if (typeof window !== 'undefined') {
    window.Player = Player;
}