const PLAYING = 0;
const YOU_WIN = 1;
const YOU_LOST = 2;
const PLAY_ANOTHER = 3;
const WIN_VAL = 2048;

class Game2048 {
  constructor(rows = 4) {
    this.rows = rows;
    this.bestScore = 0;
    this.score = 0;
    this.maxVal = 0;
    this.attempts = 0;
    this.status = PLAYING;
  }  
  
  init(canvas) {
    this.scoreBoard = document.getElementById("score-lbl");
    this.bestBoard = document.getElementById("best-lbl");
    this.overPanel = document.getElementById("gameover");
    this.gameContainer = document.getElementById("content");
    const btnRestart = document.getElementById("newGameBtn");
    btnRestart.addEventListener("click", () => this.restart());
    const ctx = canvas.getContext("2d");
    this.initCanvasParams(ctx);
    this.animationMngr = new AnimationsManager(ctx);
    this.grid = new Grid(this.rows, canvas.height, this.animationMngr);  
    this.gridCopy = new Grid(this.rows, canvas.height, this.animationMngr);
    this.grid.init();
  }

  initCanvasParams(ctx) {
    ctx.font = "700 35px " + FONT_FAMILY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }
  
  restart() {
    this.score = 0;
    this.attempts++;
    this.status = PLAY_ANOTHER;
    this.grid.init();
    this.updateGameBoard();
    this.updateScore();
    this.status = PLAYING;
  }

  updateScore() {
    this.bestScore = Math.max(this.bestScore, this.score);
    this.scoreBoard.innerHTML = this.score;
    this.bestBoard.innerHTML = this.bestScore;
  }
  
  updateGameBoard() {
    switch(this.status) {
      case PLAY_ANOTHER:
        this.overPanel.style.opacity = 0;
        this.gameContainer.style.opacity = 1;
        break;
      case YOU_WIN:
        this.overPanel.style.opacity = 1;
        this.gameContainer.style.opacity = 0.2;
        this.overPanel.innerHTML = "YOU WIN";
        break;
      case YOU_LOST:
        this.overPanel.style.opacity = 1;
        this.gameContainer.style.opacity = 0.2;
        this.overPanel.innerHTML = "YOU LOST";
    }
  }

  makeMove(keyCode) {
    
    if(this.status !== PLAYING) return;

    this.score += this.grid.move(keyCode);
    this.updateScore();
    this.checkGameOver();
    this.updateGameBoard()
    
  }

  checkGameOver() {
    if(this.grid.getMaxTileValue() >= WIN_VAL) {
      this.status = YOU_WIN;
    } else { 
      if(this.grid.emptyTiles.length == 0) { // you may have lost
        this.animationMngr.blockAnimations = true;
        this.gridCopy.tiles = this.grid.tiles.map(tile => {
           let newTile = new Tile(tile.row, tile.col, tile.val, tile.size);
           Object.assign(newTile, tile);
           return newTile;
        });
        
        if([LEFTKEY, RIGHTKEY, UPKEY, DOWNKEY].map((key) => this.gridCopy.move(key)).every(mergeVal => mergeVal == 0)) {
          this.status = YOU_LOST;
        }
        this.animationMngr.blockAnimations = false;
      } 
    }
  }
}