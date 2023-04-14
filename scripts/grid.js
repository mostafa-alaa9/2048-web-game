class Grid{ 
    constructor(length, canvasSize, animationMngr) {
      this.tileSize = (canvasSize - (length + 1) * BORDER_WIDTH)/ length;
      this.rows = length;
      this.cols = length;
      this.tiles = [];
      this.animationMngr = animationMngr;
    }
    
    get emptyTiles() {
      return this.tiles.filter(tile => tile.val === 0);
    }
    
    get occupiedTiles() {
      return this.tiles.filter(tile => tile.val !== 0);
    }
    
    init() {
      this.tiles = [];
      this.animationMngr.clearAnimations();
       for(let row = 0; row < this.rows; row++) {
         for(let col = 0; col < this.cols; col++) {
           var emptyTile = new Tile(row, col, 0, this.tileSize);
           this.tiles.push(emptyTile);
           this.animationMngr.addAnimation(new PopulatedTileAnimation(emptyTile.row, emptyTile.col, emptyTile.size, emptyTile.val, 0));
         }
       } 
       this.populate(2);
       this.animationMngr.runAnimations();
    }
  
    getCompareFunction(direction) {
      let compareFunction = null;
      switch (direction) {
        case LEFTKEY:
          compareFunction = function(tileA, tileB) {
            return tileA.col - tileB.col;
          };
          break;
        case RIGHTKEY:
          compareFunction = function(tileA, tileB) {
            return tileB.col - tileA.col;
          };
          break;
        case UPKEY:
          compareFunction = function(tileA, tileB) {
            return tileA.row - tileB.row;
          };
          break;
        case DOWNKEY:
          compareFunction = function(tileA, tileB) {
            return tileB.row - tileA.row;
          };
          break;
      }
      return compareFunction;
    }
    
    // populate the requested amount of empty tiles
    populate(amount = 1) {
      const animOrder = this.animationMngr.getMaxAnimationOrder() + 1;
      for (let i = 0; i < amount; i++) {
        let randIndex = Math.floor(this.emptyTiles.length * Math.random());
        let rndTile = this.emptyTiles[randIndex];
        rndTile.val = Math.random() > 0.9 ? 4 : 2;
        this.animationMngr.addAnimation(new PopulatedTileAnimation(rndTile.row, rndTile.col, rndTile.size, 
          rndTile.val, animOrder));
      }
    }
    
    clearMergedTiles() {
      this.tiles.forEach(tile => tile.isMerged = false);
    }
  
    getTileAt(row, col) {
      return this.tiles.find((tile) => tile.row === row && tile.col === col);
    }
    
    getNextTile(direction, currentRow, currentCol) {
      switch (direction) {
        case LEFTKEY:
          currentCol--;
          break;
        case RIGHTKEY:
          currentCol++;
          break;
        case UPKEY:
          currentRow--;
          break;
        case DOWNKEY:
          currentRow++;
          break;
      }
      
      if(currentCol < 0 || currentRow < 0 || currentCol >= this.cols || currentRow >= this.rows) {
        return null;
      }
      
      return this.getTileAt(currentRow, currentCol);
    }
    
    getMaxTileValue() {
      return this.tiles.reduce((maxVal, tile) => maxVal > tile.val ? maxVal : tile.val, 0);
    }
  
    move(direction) {
      var totalMerged = 0;
      var changes = false;
      if(!this.animationMngr.allAnimationsCompleted()) {
        console.log("playing to fast");
        return totalMerged;
        this.animationMngr.cancelRunningAnimations();
      }
      this.animationMngr.clearAnimations();
      var movingOrder;
      var compareFunc = this.getCompareFunction(direction);
      var occupiedTiles = this.occupiedTiles.sort(compareFunc);
      for(let currentTile of occupiedTiles) {
        movingOrder = 0;
        let nextTile = this.getNextTile(direction, currentTile.row, currentTile.col);
        while(nextTile !== null && (nextTile.val == 0 || (nextTile.val == currentTile.val && !nextTile.isMerged && !currentTile.isMerged)) ) {
          changes = true;
          if(nextTile.val !== 0) {
            this.animationMngr.addAnimation(new MovingTileAnimation(currentTile.val, currentTile.size, currentTile.row, 
              currentTile.col, nextTile.row, nextTile.col, direction, movingOrder));
            this.animationMngr.addAnimation(new MergingTileAnimation(nextTile.row, nextTile.col, nextTile.size, 
              nextTile.val * 2, movingOrder + 1));
            currentTile.merge(nextTile); // merge tiles
            totalMerged += currentTile.val;
          } else {
            this.animationMngr.addAnimation(new MovingTileAnimation(currentTile.val, currentTile.size, currentTile.row, currentTile.col, nextTile.row, nextTile.col, direction, movingOrder));
            currentTile.swap(nextTile); //swap tiles  
          } 
          movingOrder++;
          nextTile = this.getNextTile(direction, currentTile.row, currentTile.col);
        }
      }
      if(changes) {
        this.populate();
        this.animationMngr.runAnimations();
      }
      this.clearMergedTiles();
      return totalMerged;
    }
  }
  