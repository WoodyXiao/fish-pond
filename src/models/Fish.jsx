// models/Fish.js
import HealthBar from "./HeathBar";
import Control from "./Control/Control";
import PVector from "./Utils/PVector";
/**
 * Class representing a Fish with behavior for drawing, updating, and handling collisions.
 */
export default class Fish {
  /**
   * Create a Fish instance.
   * @param {number} x - The x-coordinate of the fish.
   * @param {number} y - The y-coordinate of the fish.
   * @param {number} width - Width of the fish.
   * @param {number} height - Height of the fish.
   * @param {string} color - Color of the fish.
   */
  constructor(x, y, width, height, color, name, gender, isPlayerControlled) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.name = name;
    this.gender = gender;
    this.isPlayerControlled = !isPlayerControlled ? false : isPlayerControlled;

    // Initialize velocity with random direction
    this.velocity = new PVector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.velocity.normalize().mult(2);
    this.angle = Math.atan2(this.velocity.y, this.velocity.x);
    this.maxSpeed = 1;
    this.scale = 1; // Scale for drawing the fish

    this.foodEaten = 0; // Initialize the count of food eaten by this fish

    this.status = "";

    this.healthBar = new HealthBar(50); // 创建HealthBar实例
    this.lastUpdateTime = Date.now(); // Track the last update time for health decrement

    if (this.isPlayerControlled) {
      this.control = new Control(); // Initialize Control instance for player-controlled fish
    }
  }

  eatFood() {
    this.foodEaten += 1;
    this.healthBar.increaseHealth(1);
  }

  /**
   * Draw the fish on the canvas.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {boolean} isSelected - Whether the fish is currently selected.
   */
  draw(ctx, isSelected) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);

    // Draw highlight if selected
    if (isSelected) {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 1.2, this.height / 1.2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(75, 75, 75, 0.2)"; // Semi-transparent white highlight
      ctx.fill();
    }

    // Draw fish body
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Draw an eye or additional features
    ctx.beginPath();
    ctx.arc(this.width / 4, 0, this.width / 10, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore();

    this.healthBar.draw(ctx, this.x, this.y + this.height / 2, this.health);

    // Display resting status if the fish is resting
    if (this.status === "Resting" || this.status === "Speeding!") {
      ctx.fillStyle = "red";
      ctx.font = "14px Arial";
      ctx.fillText(this.status, this.x, this.y - 20);
    }
  }

  /**
   * Update fish position and behavior based on the environment.
   * @param {number} canvasWidth - Width of the canvas.
   * @param {number} canvasHeight - Height of the canvas.
   * @param {Array<Fish>} otherFish - Array of other fish for collision detection.
   */
  update(canvasWidth, canvasHeight, otherFish) {
    // Calculate time passed since the last update
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = now;

    // Control fish
    if (this.isPlayerControlled && this.control) {
      this.applyControl(deltaTime);
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.detectBoundaryCollision(canvasWidth, canvasHeight);
    this.detectFishCollision(otherFish);
  }

  /**
   * Apply control inputs to the fish's velocity and angle.
   */
  applyControl(deltaTime) {
    const movement = this.control.getMovementVector();

    if (movement.resting) {
      this.status = "Resting";
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.healthBar.currentHealth <= 50 &&
        this.healthBar.increaseHealth(0.8 * deltaTime); // Recover health while resting
    } else {
      this.status = "Awake";
      if (movement.dx !== 0 || movement.dy !== 0) {
        this.velocity.x = movement.dx;
        this.velocity.y = movement.dy;
        this.angle = Math.atan2(this.velocity.y, this.velocity.x);

        if (movement.burst) {
          this.status = "Speeding!";
          this.velocity.x *= 2;
          this.velocity.y *= 2;
          this.healthBar.decreaseHealth(1 * deltaTime);
        }

        // Decrease health based on time and movement
        if (deltaTime > 0) {
          this.healthBar.decreaseHealth(0.25 * deltaTime);
        }
      } else {
        // Optionally stop the fish if no keys are pressed
        this.velocity.x = 0;
        this.velocity.y = 0;

        this.healthBar.decreaseHealth(0.01 * deltaTime);
      }
    }
  }

  /**
   * Updates the fish's satiety and adjusts mood based on how full it is.
   * @param {number} amount - The amount to increase satiety by.
   */
  updateSatiety(amount) {
    this.satiety += amount;
    if (this.satiety > 50) {
      this.mood = "full"; // Change mood to full if satiety is high.
    } else if (this.satiety < 20) {
      this.mood = "hungry"; // Change mood to hungry if satiety is low.
    }
  }

  /**
   * Detect and handle boundary collisions with dynamic and smooth turning.
   * @param {number} canvasWidth - Width of the canvas.
   * @param {number} canvasHeight - Height of the canvas.
   */
  detectBoundaryCollision(canvasWidth, canvasHeight) {
    const boundaryThreshold = 50; // Distance from the edge where the fish starts reacting.

    let adjustmentNeeded = false;
    let deltaX = 0;
    let deltaY = 0;

    // Adjust if the fish is close to the left or right boundaries
    if (this.x < boundaryThreshold) {
      deltaX = (boundaryThreshold - this.x) / boundaryThreshold; // Proportional influence
      adjustmentNeeded = true;
    } else if (this.x > canvasWidth - boundaryThreshold) {
      deltaX =
        -(boundaryThreshold - (canvasWidth - this.x)) / boundaryThreshold;
      adjustmentNeeded = true;
    }

    // Adjust if the fish is close to the top or bottom boundaries
    if (this.y < boundaryThreshold) {
      deltaY = (boundaryThreshold - this.y) / boundaryThreshold;
      adjustmentNeeded = true;
    } else if (this.y > canvasHeight - boundaryThreshold) {
      deltaY =
        -(boundaryThreshold - (canvasHeight - this.y)) / boundaryThreshold;
      adjustmentNeeded = true;
    }

    if (adjustmentNeeded) {
      // Calculate a new steering angle based on the proximity to the nearest boundary
      let targetAngle = Math.atan2(deltaY, deltaX) + Math.random() * 0.2 - 0.1; // Adding random variation

      // Gradually adjust the fish's current angle towards the new target angle
      this.angle = this.smoothAngleTransition(this.angle, targetAngle, 0.05);
      this.updateVelocity();
    }

    // Clamp the fish's position within the canvas to prevent it from going out of bounds
    this.x = Math.max(
      this.width / 2,
      Math.min(this.x, canvasWidth - this.width / 2)
    );
    this.y = Math.max(
      this.height / 2,
      Math.min(this.y, canvasHeight - this.height / 2)
    );
  }

  /**
   * Smooth transition between current angle and target angle.
   * @param {number} currentAngle - Current angle of the fish.
   * @param {number} targetAngle - New target angle.
   * @param {number} rate - Rate of change towards the target angle.
   * @return {number} Adjusted angle.
   */
  smoothAngleTransition(currentAngle, targetAngle, rate) {
    let angleDifference = targetAngle - currentAngle;
    // Normalize the angle to prevent excessive rotation
    while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
    while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;

    return currentAngle + angleDifference * rate;
  }

  /**
   * Update the velocity of the fish based on its adjusted angle.
   */
  updateVelocity() {
    this.velocity.x = Math.cos(this.angle) * this.maxSpeed;
    this.velocity.y = Math.sin(this.angle) * this.maxSpeed;
  }

  /**
   * Detect and handle collisions with other fish.
   * @param {Array<Fish>} otherFish - Array of other fish.
   */
  detectFishCollision(otherFish) {
    otherFish.forEach((fish) => {
      if (fish !== this) {
        let dx = this.x - fish.x;
        let dy = this.y - fish.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let minDistance = ((this.width + fish.width) / 2) * this.scale;

        if (distance < minDistance) {
          let overlap = minDistance - distance;
          let avoidanceAngle = Math.atan2(dy, dx) + Math.PI;

          let damping = 0.05;
          this.velocity.x -= damping * Math.cos(avoidanceAngle) * overlap;
          this.velocity.y -= damping * Math.sin(avoidanceAngle) * overlap;
          this.velocity.limit(this.maxSpeed);

          this.angle = Math.atan2(this.velocity.y, this.velocity.x);
        }
      }
    });
  }

  /**
   * Check if the fish is near enough to eat the food.
   * @param {Food} food - The food item to check against.
   * @return {boolean} - Returns true if the fish is close enough to eat the food.
   */
  isNearFood(food) {
    const distance = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
    const effectiveDistance = this.width / 2 + food.radius; // Includes radius of the fish and food for more accurate touching
    if (distance < effectiveDistance) {
      this.eatFood();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Move towards the closest food item.
   * @param {Array<Food>} foodItems - Array of food items.
   */
  moveTowardsFood(foodItems) {
    if (foodItems.length > 0) {
      // Find the closest food item
      let closestFood = foodItems.reduce((closest, food) => {
        let currentDistance = Math.sqrt(
          (food.x - this.x) ** 2 + (food.y - this.y) ** 2
        );
        let closestDistance = Math.sqrt(
          (closest.x - this.x) ** 2 + (closest.y - this.y) ** 2
        );
        return currentDistance < closestDistance ? food : closest;
      });

      // Calculate direction towards the food
      let angleToFood = Math.atan2(
        closestFood.y - this.y,
        closestFood.x - this.x
      );
      this.velocity.x += 0.1 * Math.cos(angleToFood);
      this.velocity.y += 0.1 * Math.sin(angleToFood);
      this.velocity.limit(this.maxSpeed);

      // Update angle to point towards the food
      this.angle = Math.atan2(this.velocity.y, this.velocity.x);
    }
  }
}
