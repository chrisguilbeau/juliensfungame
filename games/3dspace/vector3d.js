class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other) {
        return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    multiply(scalar) {
        return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector3D(0, 0, 0);
        return new Vector3D(this.x / mag, this.y / mag, this.z / mag);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other) {
        return new Vector3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    rotateX(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector3D(
            this.x,
            this.y * cos - this.z * sin,
            this.y * sin + this.z * cos
        );
    }

    rotateY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector3D(
            this.x * cos + this.z * sin,
            this.y,
            -this.x * sin + this.z * cos
        );
    }

    rotateZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector3D(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
            this.z
        );
    }

    clone() {
        return new Vector3D(this.x, this.y, this.z);
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
        this.focalLength = 400;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    project3D(point3D, camera = new Vector3D(0, 0, 0)) {
        const relative = point3D.subtract(camera);
        
        if (relative.z <= 0) {
            relative.z = 0.1;
        }

        const scale = this.focalLength / relative.z;
        return {
            x: this.centerX + relative.x * scale,
            y: this.centerY - relative.y * scale
        };
    }

    drawLine(start3D, end3D, camera = new Vector3D(0, 0, 0), color = '#0f0') {
        const startProj = this.project3D(start3D, camera);
        const endProj = this.project3D(end3D, camera);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(startProj.x, startProj.y);
        this.ctx.lineTo(endProj.x, endProj.y);
        this.ctx.stroke();
    }

    drawWireframe(vertices, edges, camera = new Vector3D(0, 0, 0), color = '#0f0') {
        for (const edge of edges) {
            const start = vertices[edge[0]];
            const end = vertices[edge[1]];
            this.drawLine(start, end, camera, color);
        }
    }

    drawPoint(point3D, camera = new Vector3D(0, 0, 0), color = '#0f0', size = 2) {
        const proj = this.project3D(point3D, camera);
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawText(text, point3D, camera = new Vector3D(0, 0, 0), color = '#0f0') {
        const proj = this.project3D(point3D, camera);
        
        this.ctx.fillStyle = color;
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, proj.x, proj.y);
    }
}