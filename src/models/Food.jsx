// models/Food.js
/**
 * Class representing food in the aquarium.
 */
export default class Food {
  /**
   * Create a Food instance.
   * @param {number} x - The x-coordinate of the food.
   * @param {number} y - The y-coordinate of the food.
   * @param {number} radius - The radius of the food.
   */
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "orange"; // Default color of the food
  }

  /**
   * Draw the food on the canvas.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
