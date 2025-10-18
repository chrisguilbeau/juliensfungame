class Matrix4 {
    constructor() {
        this.m = new Float32Array(16);
        this.identity();
    }

    identity() {
        this.m.fill(0);
        this.m[0] = this.m[5] = this.m[10] = this.m[15] = 1;
        return this;
    }

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);

        this.m[0] = f / aspect;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 0;
        this.m[4] = 0;
        this.m[5] = f;
        this.m[6] = 0;
        this.m[7] = 0;
        this.m[8] = 0;
        this.m[9] = 0;
        this.m[10] = (far + near) * nf;
        this.m[11] = -1;
        this.m[12] = 0;
        this.m[13] = 0;
        this.m[14] = 2 * far * near * nf;
        this.m[15] = 0;
        return this;
    }

    lookAt(eye, target, up) {
        const zAxis = eye.subtract(target).normalize();
        const xAxis = up.cross(zAxis).normalize();
        const yAxis = zAxis.cross(xAxis);

        this.m[0] = xAxis.x;
        this.m[1] = yAxis.x;
        this.m[2] = zAxis.x;
        this.m[3] = 0;
        this.m[4] = xAxis.y;
        this.m[5] = yAxis.y;
        this.m[6] = zAxis.y;
        this.m[7] = 0;
        this.m[8] = xAxis.z;
        this.m[9] = yAxis.z;
        this.m[10] = zAxis.z;
        this.m[11] = 0;
        this.m[12] = -xAxis.dot(eye);
        this.m[13] = -yAxis.dot(eye);
        this.m[14] = -zAxis.dot(eye);
        this.m[15] = 1;
        return this;
    }

    translate(x, y, z) {
        this.m[12] += this.m[0] * x + this.m[4] * y + this.m[8] * z;
        this.m[13] += this.m[1] * x + this.m[5] * y + this.m[9] * z;
        this.m[14] += this.m[2] * x + this.m[6] * y + this.m[10] * z;
        this.m[15] += this.m[3] * x + this.m[7] * y + this.m[11] * z;
        return this;
    }

    rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m4 = this.m[4], m5 = this.m[5], m6 = this.m[6], m7 = this.m[7];
        const m8 = this.m[8], m9 = this.m[9], m10 = this.m[10], m11 = this.m[11];

        this.m[4] = m4 * c + m8 * s;
        this.m[5] = m5 * c + m9 * s;
        this.m[6] = m6 * c + m10 * s;
        this.m[7] = m7 * c + m11 * s;
        this.m[8] = m8 * c - m4 * s;
        this.m[9] = m9 * c - m5 * s;
        this.m[10] = m10 * c - m6 * s;
        this.m[11] = m11 * c - m7 * s;
        return this;
    }

    rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3];
        const m8 = this.m[8], m9 = this.m[9], m10 = this.m[10], m11 = this.m[11];

        this.m[0] = m0 * c - m8 * s;
        this.m[1] = m1 * c - m9 * s;
        this.m[2] = m2 * c - m10 * s;
        this.m[3] = m3 * c - m11 * s;
        this.m[8] = m0 * s + m8 * c;
        this.m[9] = m1 * s + m9 * c;
        this.m[10] = m2 * s + m10 * c;
        this.m[11] = m3 * s + m11 * c;
        return this;
    }

    rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3];
        const m4 = this.m[4], m5 = this.m[5], m6 = this.m[6], m7 = this.m[7];

        this.m[0] = m0 * c + m4 * s;
        this.m[1] = m1 * c + m5 * s;
        this.m[2] = m2 * c + m6 * s;
        this.m[3] = m3 * c + m7 * s;
        this.m[4] = m4 * c - m0 * s;
        this.m[5] = m5 * c - m1 * s;
        this.m[6] = m6 * c - m2 * s;
        this.m[7] = m7 * c - m3 * s;
        return this;
    }

    multiply(other) {
        const result = new Matrix4();
        const a = this.m;
        const b = other.m;
        const r = result.m;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                r[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + 
                              a[i * 4 + 2] * b[8 + j] + a[i * 4 + 3] * b[12 + j];
            }
        }
        return result;
    }

    transformPoint(point) {
        const x = point.x, y = point.y, z = point.z;
        const w = this.m[3] * x + this.m[7] * y + this.m[11] * z + this.m[15];

        if (Math.abs(w) < 0.0001) {
            return new Vector3D(0, 0, 1000); // Far away point
        }

        return new Vector3D(
            (this.m[0] * x + this.m[4] * y + this.m[8] * z + this.m[12]) / w,
            (this.m[1] * x + this.m[5] * y + this.m[9] * z + this.m[13]) / w,
            (this.m[2] * x + this.m[6] * y + this.m[10] * z + this.m[14]) / w
        );
    }
}

class Camera3D {
    constructor(position, target, up) {
        this.position = position || new Vector3D(0, 0, 0);
        this.target = target || new Vector3D(0, 0, -1);
        this.up = up || new Vector3D(0, 1, 0);
        this.fov = Math.PI / 4; // 45 degrees
        this.near = 0.1;
        this.far = 1000;
        this.aspect = 1;
    }

    setAspect(width, height) {
        this.aspect = width / height;
    }

    getViewMatrix() {
        return new Matrix4().lookAt(this.position, this.target, this.up);
    }

    getProjectionMatrix() {
        return new Matrix4().perspective(this.fov, this.aspect, this.near, this.far);
    }

    getViewProjectionMatrix() {
        return this.getProjectionMatrix().multiply(this.getViewMatrix());
    }

    followShip(ship, offset) {
        const forward = new Vector3D(0, 1, 0)
            .rotateX(ship.rotation.x)
            .rotateY(ship.rotation.y)
            .rotateZ(ship.rotation.z);
        
        const right = forward.cross(new Vector3D(0, 0, 1)).normalize();
        const up = right.cross(forward).normalize();

        this.position = ship.position.subtract(forward.multiply(offset.z))
                                    .add(right.multiply(offset.x))
                                    .add(up.multiply(offset.y));
        
        this.target = ship.position.add(forward.multiply(50));
        this.up = up;
    }
}