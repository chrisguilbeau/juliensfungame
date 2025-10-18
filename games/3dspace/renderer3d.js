class Face3D {
    constructor(vertices, normal, color = '#0f0') {
        this.vertices = vertices; // Array of 3 vertex indices
        this.normal = normal;
        this.color = color;
        this.depth = 0; // For depth sorting
    }
}

class Mesh3D {
    constructor(vertices, faces) {
        this.vertices = vertices; // Array of Vector3D
        this.faces = faces; // Array of Face3D
        this.position = new Vector3D(0, 0, 0);
        this.rotation = new Vector3D(0, 0, 0);
        this.scale = new Vector3D(1, 1, 1);
    }

    getTransformMatrix() {
        const matrix = new Matrix4();
        matrix.translate(this.position.x, this.position.y, this.position.z);
        matrix.rotateX(this.rotation.x);
        matrix.rotateY(this.rotation.y);
        matrix.rotateZ(this.rotation.z);
        return matrix;
    }

    getTransformedVertices() {
        const transform = this.getTransformMatrix();
        return this.vertices.map(vertex => {
            const scaled = new Vector3D(
                vertex.x * this.scale.x,
                vertex.y * this.scale.y,
                vertex.z * this.scale.z
            );
            return transform.transformPoint(scaled);
        });
    }
}

class Renderer3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        this.lightDirection = new Vector3D(0.5, -0.7, 0.5).normalize();
        this.ambientLight = 0.3;
        this.diffuseLight = 0.7;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    projectPoint(point3D, viewProjectionMatrix) {
        const projected = viewProjectionMatrix.transformPoint(point3D);
        
        // Convert from clip space (-1 to 1) to screen space
        const screenX = (projected.x + 1) * 0.5 * this.width;
        const screenY = (1 - projected.y) * 0.5 * this.height; // Flip Y
        
        return {
            x: screenX,
            y: screenY,
            z: projected.z // Keep depth for sorting
        };
    }

    calculateLighting(normal) {
        const dotProduct = Math.max(0, -normal.dot(this.lightDirection));
        return this.ambientLight + this.diffuseLight * dotProduct;
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    applyLighting(color, intensity) {
        const rgb = this.hexToRgb(color);
        const r = Math.floor(rgb.r * intensity);
        const g = Math.floor(rgb.g * intensity);
        const b = Math.floor(rgb.b * intensity);
        return `rgb(${r}, ${g}, ${b})`;
    }

    renderMesh(mesh, camera, wireframe = false) {
        const viewProjectionMatrix = camera.getViewProjectionMatrix();
        const transformedVertices = mesh.getTransformedVertices();
        
        // Project all vertices
        const projectedVertices = transformedVertices.map(vertex => 
            this.projectPoint(vertex, viewProjectionMatrix)
        );

        // Render faces
        const facesToRender = [];
        
        mesh.faces.forEach(face => {
            const v1 = transformedVertices[face.vertices[0]];
            const v2 = transformedVertices[face.vertices[1]];
            const v3 = transformedVertices[face.vertices[2]];
            
            // Calculate face normal
            const edge1 = v2.subtract(v1);
            const edge2 = v3.subtract(v1);
            const normal = edge1.cross(edge2).normalize();
            
            // Back-face culling
            const viewDirection = camera.position.subtract(v1).normalize();
            if (normal.dot(viewDirection) <= 0 && !wireframe) {
                return; // Skip back faces
            }
            
            // Calculate depth for sorting
            const centerZ = (projectedVertices[face.vertices[0]].z + 
                           projectedVertices[face.vertices[1]].z + 
                           projectedVertices[face.vertices[2]].z) / 3;
            
            facesToRender.push({
                face: face,
                normal: normal,
                depth: centerZ,
                projectedVertices: [
                    projectedVertices[face.vertices[0]],
                    projectedVertices[face.vertices[1]],
                    projectedVertices[face.vertices[2]]
                ]
            });
        });

        // Sort faces by depth (back to front for transparency)
        facesToRender.sort((a, b) => b.depth - a.depth);

        // Render sorted faces
        facesToRender.forEach(({ face, normal, projectedVertices }) => {
            if (wireframe) {
                this.renderWireframeFace(projectedVertices, face.color);
            } else {
                const lighting = this.calculateLighting(normal);
                const litColor = this.applyLighting(face.color, lighting);
                this.renderSolidFace(projectedVertices, litColor, face.color);
            }
        });
    }

    renderWireframeFace(projectedVertices, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        for (let i = 0; i < projectedVertices.length; i++) {
            const current = projectedVertices[i];
            const next = projectedVertices[(i + 1) % projectedVertices.length];
            
            if (i === 0) {
                this.ctx.moveTo(current.x, current.y);
            }
            this.ctx.lineTo(next.x, next.y);
        }
        
        this.ctx.closePath();
        this.ctx.stroke();
    }

    renderSolidFace(projectedVertices, fillColor, strokeColor) {
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(projectedVertices[0].x, projectedVertices[0].y);
        
        for (let i = 1; i < projectedVertices.length; i++) {
            this.ctx.lineTo(projectedVertices[i].x, projectedVertices[i].y);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawPoint(point3D, camera, color = '#0f0', size = 2) {
        const viewProjectionMatrix = camera.getViewProjectionMatrix();
        const projected = this.projectPoint(point3D, viewProjectionMatrix);
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLine(start3D, end3D, camera, color = '#0f0') {
        const viewProjectionMatrix = camera.getViewProjectionMatrix();
        const startProj = this.projectPoint(start3D, viewProjectionMatrix);
        const endProj = this.projectPoint(end3D, viewProjectionMatrix);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(startProj.x, startProj.y);
        this.ctx.lineTo(endProj.x, endProj.y);
        this.ctx.stroke();
    }

    drawText(text, point3D, camera, color = '#0f0') {
        const viewProjectionMatrix = camera.getViewProjectionMatrix();
        const projected = this.projectPoint(point3D, viewProjectionMatrix);
        
        this.ctx.fillStyle = color;
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, projected.x, projected.y);
    }
}