// models/Control.js
export default class Control {
  constructor() {
    this.directions = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.burst = false; // speeding up
    this.resting = false; // resting
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(event) {
    switch (event.key.toLowerCase()) {
      case "arrowup":
        this.directions.up = true;
        break;
      case "arrowdown":
        this.directions.down = true;
        break;
      case "arrowleft":
        this.directions.left = true;
        break;
      case "arrowright":
        this.directions.right = true;
        break;
      case "s":
        this.burst = true;
        break;
      case "a":
        this.resting = !this.resting;
        break;
      default:
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.key.toLowerCase()) {
      case "arrowup":
        this.directions.up = false;
        break;
      case "arrowdown":
        this.directions.down = false;
        break;
      case "arrowleft":
        this.directions.left = false;
        break;
      case "arrowright":
        this.directions.right = false;
        break;
      case "s":
        this.burst = false;
        break;
      default:
        break;
    }
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.directions.up) dy -= 1;
    if (this.directions.down) dy += 1;
    if (this.directions.left) dx -= 1;
    if (this.directions.right) dx += 1;

    // Normalize the vector to have consistent movement speed in all directions
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
      dx /= magnitude;
      dy /= magnitude;
    }

    return { dx, dy, burst: this.burst, resting: this.resting };
  }
}
