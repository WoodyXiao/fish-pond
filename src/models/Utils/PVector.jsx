/**
 * A class to handle two-dimensional vector operations.
 */
export default class PVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
  }

  limit(max) {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    if (mag > max) {
      this.x = (this.x / mag) * max;
      this.y = (this.y / mag) * max;
    }
  }

  normalize() {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }
}
