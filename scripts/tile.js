class Tile{
    constructor(row, col, val, size) {
      this.val = val;
      this.size = size;
      this.row = row;
      this.col = col;
      this.isMerged = false;
    }
    
    merge(destinationTile) {
      this.isMerged = true;
      this.val *= 2;
      destinationTile.val = 0;
      this.swap(destinationTile);
    };
    
    // swipe row and col of this tile with the destination tile
    swap(destinationTile) {
      const {row, col} = this;
      this.row = destinationTile.row;
      this.col = destinationTile.col;
      destinationTile.row = row;
      destinationTile.col = col;
    }
  }