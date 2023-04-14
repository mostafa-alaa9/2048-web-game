const FONT_FAMILY = "Montserrat";
const EMPTY_BGC = '#EEEEEE';
const BORDER_WIDTH = 10;
const TEXT_COLOR = "#000";

class CanvasHelper {
  static drawTile(tile, ctx) {
    const x = tile.col * tile.size + (tile.col + 1) * BORDER_WIDTH;
    const y = tile.row * tile.size + (tile.row + 1) * BORDER_WIDTH;
    CanvasHelper.draw(x, y, tile.size, tile.val, ctx);
  }
  
  static draw(x, y, size, val, ctx, alpha=1) {
    ctx.fillStyle = CanvasHelper.getFillColor(val, alpha);
    ctx.fillRect(x, y, size, size);
    if(val > 0) {
      ctx.fillStyle = TEXT_COLOR;
      ctx.fillText(
          val,
          x + size / 2,
          y + size / 2
        );
    }
  }

  static clear(x, y, size, ctx) {
    ctx.clearRect(x, y, size, size); 
  }

  static getFillColor(value, alpha = 1) {
    if(value === 0) {
      return EMPTY_BGC;
    }
    
    var h = (1.0 - Math.log2(value)/Math.log2(WIN_VAL)) * 240; 
    return `hsla(${h}, 70%, 60%, ${alpha})`;
  }
  
  static columnToPosition(col, size) {
    return col * size + (col + 1) * BORDER_WIDTH;
  }
}
