const ANIM_CREATED = 0;
const ANIM_RUNNING = 1;
const ANIM_ENDED =2;
const ANIM_CANCELED = 3;
const MOV_SPEED = 0.5;
const FADE_STEP = 0.5;
const GROW_STEP = 10;
const GROW_OVER_ANIM_PERC = 1.2;

class TileAnimation {
  constructor(x, y, size, val, order) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.val = val;
    this.order = order;
    this.status = ANIM_CREATED;
  }

  onAnimationStarted() {
    this.status = ANIM_RUNNING;
  }

  onAnimationEnded(resolve) {
    this.status = ANIM_ENDED;
    resolve();
  }

  cancelAnimation() {
    if(this.status === ANIM_RUNNING) {
      cancelAnimationFrame(this.requestId);
      this.finish();
      this.status = ANIM_CANCELED;
    }
  }
}

class MovingTileAnimation extends TileAnimation {
  constructor(val, size, startRow, startCol, endRow, endCol, direction, order) {
    const x = CanvasHelper.columnToPosition(startCol, size);
    const y = CanvasHelper.columnToPosition(startRow, size);
    super(x, y, size, val, order);
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;
    this.direction = direction;
    this.runOnCompletion = null;
  }

  get startX() {
    return CanvasHelper.columnToPosition(this.startCol, this.size);
  }
  
  get startY() {
    return CanvasHelper.columnToPosition(this.startRow, this.size);
  }
  
  get destinationX() {
    return this.endCol * this.size + (this.endCol + 1) * BORDER_WIDTH;
  }
  
  get destinationY() {
    return this.endRow * this.size + (this.endRow + 1) * BORDER_WIDTH;
  }
  
  animate(ctx) {
    this.ctx = ctx;
    return new Promise((resolve, reject) => {
      this.requestId = requestAnimationFrame(this.step.bind(this, resolve));
    });
  }
  
  step(resolve) {
    super.onAnimationStarted();
    if(this.x !== this.destinationX || this.y !== this.destinationY) { // destination not yet reached
      CanvasHelper.clear(this.x, this.y, this.size, this.ctx); // clear tile at current location
      CanvasHelper.draw(this.startX, this.startY, this.size, 0, this.ctx); // draw empty tile at start location
      this.setNextCoordinate(this.size * MOV_SPEED); // increment location in the selected direction
      CanvasHelper.draw(this.x, this.y, this.size, this.val, this.ctx); // draw the tile in the new location
      this.requestId = requestAnimationFrame(this.step.bind(this, resolve));
    } else{
      super.onAnimationEnded(resolve);
    }
  }
    
  setNextCoordinate(delta) {
    switch (this.direction) {
      case LEFTKEY:
        this.x-= delta;
        if(this.x < this.destinationX) this.x = this.destinationX;
        break;
      case RIGHTKEY:
        this.x += delta;
        if(this.x > this.destinationX) this.x = this.destinationX;
        break;
      case UPKEY:
        this.y -= delta;
        if(this.y < this.destinationY) this.y = this.destinationY;
        break;
      case DOWNKEY:
        this.y += delta;
        if(this.y > this.destinationY) this.y = this.destinationY;
        break;
    }
  }

  finish() {
    CanvasHelper.clear(this.x, this.y, this.size, this.ctx); // clear tile at current location
    CanvasHelper.draw(this.startX, this.startY, this.size, 0, this.ctx); // draw empty tile at start location
    CanvasHelper.draw(this.destinationX, this.destinationY, this.size, this.val, this.ctx); // draw the tile in the new location
  }
}

class PopulatedTileAnimation extends TileAnimation {
  constructor(row, col, size, val, order) {
    const x = CanvasHelper.columnToPosition(col, size);
    const y = CanvasHelper.columnToPosition(row, size);
    super(x, y, size, val, order);
    this.alpha = 0;
  }
  
  animate(ctx) {
    this.ctx = ctx;
    return new Promise((resolve, reject) => {
      this.requestId = requestAnimationFrame(this.fadeIn.bind(this, resolve));
    });
  }
  
  fadeIn(resolve) {
    super.onAnimationStarted();
    if(this.alpha <= 1) {
      this.alpha += FADE_STEP;
      CanvasHelper.draw(this.x, this.y, this.size, this.val, this.ctx, this.alpha);
      this.requestId = requestAnimationFrame(this.fadeIn.bind(this, resolve));
    } else{
      this.finish();
      super.onAnimationEnded(resolve);
    }
  }

  finish() {
    CanvasHelper.draw(this.x, this.y, this.size, this.val, this.ctx, 1);
  }
}

class MergingTileAnimation extends TileAnimation {
  constructor(row, col, size, val, order) {
    const x = CanvasHelper.columnToPosition(col, size);
    const y = CanvasHelper.columnToPosition(row, size);
    super(x, y, size, val, order);
    this.currentSize = 0;
    this.maxSize = this.size * GROW_OVER_ANIM_PERC;
    this.reachedMax = false;
  }

  animate(ctx) {
    this.ctx = ctx;
    return new Promise((resolve, reject) => {
      this.requestId = requestAnimationFrame(this.changeSize.bind(this, resolve));
    })
  }

  changeSize(resolve) {
    super.onAnimationStarted();
    if(this.currentSize <= this.size && this.reachedMax) {
      CanvasHelper.clear(this.x + this.size/2 - this.currentSize/2, this.y + this.size/2 - this.currentSize/2, this.currentSize, this.ctx);
      CanvasHelper.draw(this.x, this.y, this.size, this.val, this.ctx);
      super.onAnimationEnded(resolve);
    } else {
      CanvasHelper.clear(this.x + this.size/2 - this.currentSize/2, this.y + this.size/2 - this.currentSize/2, this.currentSize, this.ctx);
      if(this.currentSize < this.maxSize && !this.reachedMax){
        this.currentSize += GROW_STEP;
      } else if(this.currentSize >= this.maxSize) {
        this.reachedMax = true;
        this.currentSize -= GROW_STEP;
      } else {
        this.currentSize -= GROW_STEP;
      }
      CanvasHelper.draw(this.x + this.size/2 - this.currentSize/2, this.y + this.size/2 - this.currentSize/2, this.currentSize, this.val, this.ctx);
      this.requestId = requestAnimationFrame(this.changeSize.bind(this, resolve));
    }
  }

  finish() {
    CanvasHelper.clear(this.x + this.size/2 - this.currentSize/2, this.y + this.size/2 - this.currentSize/2, this.currentSize, this.ctx);
    CanvasHelper.draw(this.x, this.y, this.size, this.val, this.ctx);
  }
}