class Projectile {
    constructor(position, velocity, owner) {
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.owner = owner;
        this.life = 120; // frames
        this.speed = 8;
    }

    update() {
        this.position = this.position.add(this.velocity.multiply(this.speed));
        this.life--;
    }

    isExpired() {
        return this.life <= 0;
    }

    render(renderer, camera, color) {
        renderer.drawPoint(this.position, camera, color, 3);
    }
}

class Ship {
    constructor(x, y, z, playerId) {
        this.position = new Vector3D(x, y, z);
        this.velocity = new Vector3D(0, 0, 0);
        this.rotation = new Vector3D(0, 0, 0);
        this.thrust = 0;
        this.maxSpeed = 5;
        this.thrustPower = 0.2;
        this.friction = 0.98;
        this.rotationSpeed = 0.05;
        this.playerId = playerId;
        this.lives = 5;
        this.projectiles = [];
        this.fireDelay = 0;
        this.maxFireDelay = 10;
        
        this.createMesh();
    }

    createMesh() {
        const vertices = [
            // Nose/Cockpit
            new Vector3D(0, 12, 0),     // 0: nose tip
            new Vector3D(-3, 8, -2),    // 1: cockpit left
            new Vector3D(3, 8, -2),     // 2: cockpit right
            new Vector3D(-3, 4, -4),    // 3: cockpit back left
            new Vector3D(3, 4, -4),     // 4: cockpit back right
            new Vector3D(0, 8, -4),     // 5: cockpit back center
            
            // Main body
            new Vector3D(-6, 0, -2),    // 6: body left
            new Vector3D(6, 0, -2),     // 7: body right
            new Vector3D(-4, -8, -2),   // 8: body back left
            new Vector3D(4, -8, -2),    // 9: body back right
            new Vector3D(0, -8, -4),    // 10: body back center
            
            // Wings
            new Vector3D(-12, -4, 0),   // 11: left wing tip
            new Vector3D(12, -4, 0),    // 12: right wing tip
            new Vector3D(-8, -6, -1),   // 13: left wing back
            new Vector3D(8, -6, -1),    // 14: right wing back
            
            // Engines
            new Vector3D(-3, -12, -2),  // 15: left engine
            new Vector3D(3, -12, -2),   // 16: right engine
            new Vector3D(-3, -12, -6),  // 17: left engine back
            new Vector3D(3, -12, -6),   // 18: right engine back
        ];

        const faces = [
            // Cockpit
            new Face3D([0, 1, 2], new Vector3D(0, 1, 0.5), this.playerId === 1 ? '#0f0' : '#f0f'),
            new Face3D([1, 3, 5], new Vector3D(-0.5, 0, -1), this.playerId === 1 ? '#0a0' : '#a0a'),
            new Face3D([2, 5, 4], new Vector3D(0.5, 0, -1), this.playerId === 1 ? '#0a0' : '#a0a'),
            new Face3D([3, 4, 5], new Vector3D(0, 0, -1), this.playerId === 1 ? '#080' : '#808'),
            
            // Main body
            new Face3D([3, 6, 8], new Vector3D(-1, 0, 0), this.playerId === 1 ? '#0c0' : '#c0c'),
            new Face3D([4, 9, 7], new Vector3D(1, 0, 0), this.playerId === 1 ? '#0c0' : '#c0c'),
            new Face3D([8, 9, 10], new Vector3D(0, -1, 0), this.playerId === 1 ? '#0a0' : '#a0a'),
            
            // Wings
            new Face3D([6, 11, 13], new Vector3D(0, 0, 1), this.playerId === 1 ? '#0f0' : '#f0f'),
            new Face3D([7, 14, 12], new Vector3D(0, 0, 1), this.playerId === 1 ? '#0f0' : '#f0f'),
            new Face3D([8, 13, 11], new Vector3D(-1, -0.5, 0), this.playerId === 1 ? '#0c0' : '#c0c'),
            new Face3D([9, 12, 14], new Vector3D(1, -0.5, 0), this.playerId === 1 ? '#0c0' : '#c0c'),
            
            // Engines
            new Face3D([8, 15, 17], new Vector3D(-0.5, -1, 0), this.playerId === 1 ? '#060' : '#606'),
            new Face3D([9, 18, 16], new Vector3D(0.5, -1, 0), this.playerId === 1 ? '#060' : '#606'),
            new Face3D([15, 16, 18], new Vector3D(0, -1, 0), this.playerId === 1 ? '#040' : '#404'),
            new Face3D([15, 18, 17], new Vector3D(0, -1, 0), this.playerId === 1 ? '#040' : '#404'),
        ];

        this.mesh = new Mesh3D(vertices, faces);
    }

    update() {
        if (this.thrust > 0) {
            const thrustVector = new Vector3D(0, 1, 0)
                .rotateX(this.rotation.x)
                .rotateY(this.rotation.y)
                .rotateZ(this.rotation.z)
                .multiply(this.thrustPower * this.thrust);
            
            this.velocity = this.velocity.add(thrustVector);
        }

        this.velocity = this.velocity.multiply(this.friction);

        if (this.velocity.magnitude() > this.maxSpeed) {
            this.velocity = this.velocity.normalize().multiply(this.maxSpeed);
        }

        this.position = this.position.add(this.velocity);

        // Update mesh position and rotation
        this.mesh.position = this.position;
        this.mesh.rotation = this.rotation;

        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update();
            return !projectile.isExpired();
        });

        if (this.fireDelay > 0) {
            this.fireDelay--;
        }

        this.wrapPosition();
    }

    wrapPosition() {
        const boundary = 200;
        
        if (this.position.x > boundary) this.position.x = -boundary;
        if (this.position.x < -boundary) this.position.x = boundary;
        if (this.position.y > boundary) this.position.y = -boundary;
        if (this.position.y < -boundary) this.position.y = boundary;
        if (this.position.z > boundary) this.position.z = -boundary;
        if (this.position.z < -boundary) this.position.z = boundary;
    }

    fire() {
        if (this.fireDelay <= 0) {
            const fireDirection = new Vector3D(0, 1, 0)
                .rotateX(this.rotation.x)
                .rotateY(this.rotation.y)
                .rotateZ(this.rotation.z)
                .normalize();
            
            const firePosition = this.position.add(fireDirection.multiply(15));
            
            this.projectiles.push(new Projectile(firePosition, fireDirection, this.playerId));
            this.fireDelay = this.maxFireDelay;
        }
    }

    takeDamage() {
        this.lives--;
        return this.lives <= 0;
    }

    render(renderer, camera, wireframe = false) {
        // Try 3D mesh rendering first, fallback to wireframe
        try {
            if (renderer.renderMesh && !wireframe) {
                renderer.renderMesh(this.mesh, camera, wireframe);
            } else {
                this.renderWireframe(renderer, camera, this.playerId === 1 ? '#0f0' : '#f0f');
            }
        } catch (error) {
            console.log('3D rendering failed, using wireframe:', error);
            this.renderWireframe(renderer, camera, this.playerId === 1 ? '#0f0' : '#f0f');
        }

        // Render engine exhaust if thrusting
        if (this.thrust > 0) {
            const exhaustVertices = [
                new Vector3D(-3, -12, -2),
                new Vector3D(3, -12, -2),
                new Vector3D(-2, -18, -3),
                new Vector3D(2, -18, -3),
                new Vector3D(0, -20, -4)
            ].map(vertex => {
                let transformed = vertex.clone();
                transformed = transformed.rotateX(this.rotation.x);
                transformed = transformed.rotateY(this.rotation.y);
                transformed = transformed.rotateZ(this.rotation.z);
                return transformed.add(this.position);
            });

            // Draw exhaust as lines
            const color = this.playerId === 1 ? '#ff0' : '#f80';
            renderer.drawLine(exhaustVertices[0], exhaustVertices[2], camera, color);
            renderer.drawLine(exhaustVertices[1], exhaustVertices[3], camera, color);
            renderer.drawLine(exhaustVertices[2], exhaustVertices[4], camera, color);
            renderer.drawLine(exhaustVertices[3], exhaustVertices[4], camera, color);
        }

        // Render projectiles
        this.projectiles.forEach(projectile => {
            const color = this.playerId === 1 ? '#0f0' : '#f0f';
            projectile.render(renderer, camera, color);
        });
    }

    renderWireframe(renderer, camera, color) {
        // Simple wireframe rendering using the original Vector3D approach
        const vertices = [
            new Vector3D(0, 12, 0),    // nose
            new Vector3D(-10, -8, 0),  // left wing tip
            new Vector3D(10, -8, 0),   // right wing tip
            new Vector3D(-6, -12, 0),  // left tail
            new Vector3D(6, -12, 0),   // right tail
            new Vector3D(0, -8, 0),    // center back
            new Vector3D(-4, -4, 0),   // left wing root
            new Vector3D(4, -4, 0),    // right wing root
            new Vector3D(-3, 2, 0),    // left cockpit
            new Vector3D(3, 2, 0),     // right cockpit
            new Vector3D(0, 6, 0),     // cockpit front
            new Vector3D(-2, -14, 0),  // left engine
            new Vector3D(2, -14, 0),   // right engine
        ];

        const edges = [
            [0, 8], [0, 9], [0, 10],   // nose connections
            [8, 9], [8, 10], [9, 10], // cockpit frame
            [8, 6], [9, 7],           // cockpit to wing roots
            [6, 1], [7, 2],           // wing roots to tips
            [6, 5], [7, 5],           // wing roots to center
            [1, 3], [2, 4],           // wing tips to tail
            [3, 5], [4, 5],           // tail to center
            [3, 11], [4, 12],         // tail to engines
            [11, 5], [12, 5],         // engines to center
        ];

        const transformedVertices = vertices.map(vertex => {
            let transformed = vertex.clone();
            transformed = transformed.rotateX(this.rotation.x);
            transformed = transformed.rotateY(this.rotation.y);
            transformed = transformed.rotateZ(this.rotation.z);
            return transformed.add(this.position);
        });

        for (const edge of edges) {
            const start = transformedVertices[edge[0]];
            const end = transformedVertices[edge[1]];
            renderer.drawLine(start, end, camera, color);
        }
    }

    getCollisionRadius() {
        return 12;
    }

    distanceTo(other) {
        return this.position.subtract(other.position).magnitude();
    }

    checkProjectileCollisions(otherShip) {
        const hits = [];
        
        this.projectiles.forEach((projectile, index) => {
            const distance = projectile.position.subtract(otherShip.position).magnitude();
            if (distance < otherShip.getCollisionRadius()) {
                hits.push(index);
            }
        });

        hits.reverse().forEach(index => {
            this.projectiles.splice(index, 1);
            if (otherShip.takeDamage()) {
                return true; // Ship destroyed
            }
        });

        return hits.length > 0;
    }
}