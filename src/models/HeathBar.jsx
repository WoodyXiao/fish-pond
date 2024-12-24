// HealthBar.js
export default class HealthBar {
  constructor(currentHealth) {
    this.width = 60;
    this.height = 10;
    this.currentHealth = currentHealth; // Initialize current health to zero
    this.maxHealth = 100; // Set the maximum health to 100
  }

  draw(ctx, x, y) {
    ctx.save();

    // Draw the background of the health bar
    ctx.fillStyle = "gray";
    ctx.fillRect(x - this.width / 2, y + 20, this.width, this.height);

    // Draw the current health on the health bar
    ctx.fillStyle = "green";
    ctx.fillRect(
      x - this.width / 2,
      y + 20,
      (this.currentHealth / this.maxHealth) * this.width,
      this.height
    );

    // Draw a border around the health bar
    ctx.strokeStyle = "black";
    ctx.strokeRect(x - this.width / 2, y + 20, this.width, this.height);

    // Label the health bar with the current health
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText(
      `${Math.round(this.currentHealth)}/${this.maxHealth}`,
      x - this.width / 2 + 10,
      y + 28
    );

    ctx.restore();
  }

  // Method to increase health
  increaseHealth(amount) {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth); // Ensure health does not exceed maxHealth
  }

  decreaseHealth(amount) {
    this.currentHealth = Math.max(this.currentHealth - amount, 0); // Ensure health does not drop below zero
  }
}
