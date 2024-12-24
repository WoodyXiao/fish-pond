import React, { useRef, useEffect, useState } from "react";
import Fish from "../models/Fish";
import Food from "../models/Food";
import InfoBoard from "../models/Utils/InfoBoard";
import Control from "../models/Control/Control";

const Aquarium = () => {
  // References to the HTML canvas element and requestAnimationFrame ID
  const canvasRef = useRef(null);
  const requestRef = useRef();

  // State variables for fish, food items, and currently selected fish
  const [fishes, setFishes] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);

  // Reference to control object for handling user input for fish movement
  const controlRef = useRef(new Control());

  // Effect hook for setting up the canvas and initializing the fishes once
  useEffect(() => {
    const canvas = canvasRef.current;
    // Set the canvas dimensions to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Populate the fish array with sample fish objects
    setFishes([
      new Fish(
        canvas.width / 2 - 150,
        canvas.height / 2,
        60,
        30,
        "blue",
        "Xiao",
        "Male",
        true
      ),
      new Fish(
        canvas.width / 2 + 150,
        canvas.height / 2,
        60,
        30,
        "red",
        "Yu",
        "Male"
      ),
    ]);
  }, []);

  // Effect hook for handling canvas drawing, events, and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Mouse move event to update cursor style based on hover over fish
    const handleMouseMove = (event) =>
      updateCursor(event.clientX, event.clientY, canvas);

    // Click event to select a fish
    const handleClick = (event) => selectFish(event, canvas);

    // Key down and key up events to handle fish control (start/stop movement)
    const handleKeyDown = (event) => controlRef.current.handleKeyDown(event);
    const handleKeyUp = (event) => controlRef.current.handleKeyUp(event);

    // Registering the event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Start the rendering process
    requestRef.current = requestAnimationFrame(() => render(ctx));

    // Cleanup function to remove listeners and cancel the animation frame
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [selectedFish, fishes, foodItems]);

  // Function to handle cursor updates based on mouse position over fish
  function updateCursor(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const isOverFish = fishes.some(
      (fish) => Math.hypot(fish.x - x, fish.y - y) <= fish.width / 2
    );
    canvas.style.cursor = isOverFish ? "pointer" : "default";
  }

  // Function to select a fish when clicking on the canvas
  function selectFish(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickedFish = fishes.find(
      (fish) => Math.hypot(fish.x - x, fish.y - y) <= fish.width / 2
    );
    setSelectedFish(clickedFish || null);
  }

  // The main render function that is called on each animation frame
  function render(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    // Draw each food item
    foodItems.forEach((food) => food.draw(ctx));

    // Update and draw each fish
    fishes.forEach((fish) => {
      if (fish.isPlayerControlled) {
        const movement = controlRef.current.getMovementVector();
        fish.velocity.x = movement.dx;
        fish.velocity.y = movement.dy;
        fish.normalizeVelocity().mult(fish.maxSpeed);
        fish.angle = Math.atan2(fish.velocity.y, fish.velocity.x);
      }

      fish.update(canvas.width, canvas.height, fishes);
      fish.draw(ctx, fish === selectedFish);
    });

    // Remove eaten food items from the state
    setFoodItems((foodItems) =>
      foodItems.filter((food) => !fishes.some((fish) => fish.isNearFood(food)))
    );

    // Display info for the selected fish
    if (selectedFish) {
      const infoBoard = new InfoBoard();
      infoBoard.display(ctx, selectedFish);
    }

    requestRef.current = requestAnimationFrame(() => render(ctx)); // Request the next frame
  }

  return <canvas ref={canvasRef} />;
};

export default Aquarium;
