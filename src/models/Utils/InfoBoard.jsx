// models/InfoBoard.js
export default class InfoBoard {
  constructor() {
    this.visible = false;
    this.fish = null;
  }

  display(ctx, fish) {
    this.fish = fish;
    this.visible = true;

    if (this.visible && this.fish) {
      const { color, width, height, name, gender, foodEaten } = this.fish;
      const info = `Color: ${color}, Size: ${width}x${height}, Name: ${name}, Gender: ${gender}, food eaten: ${foodEaten}`;
      ctx.font = "16px Arial";
      ctx.fillStyle = "black";
      ctx.fillRect(10, 10, 550, 70); // Background for readability
      ctx.fillStyle = "white";
      ctx.fillText(info, 20, 50);
    }
  }

  hide() {
    this.visible = false;
  }
}
