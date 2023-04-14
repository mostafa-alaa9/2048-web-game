document.addEventListener("DOMContentLoaded", event => {
    const canvas = document.getElementById("game-canvas");
    const game = new Game2048();
    const userInteractionHandler = new UserInteractionHandler(canvas, game);
    userInteractionHandler.init()
    game.init(canvas);
  });