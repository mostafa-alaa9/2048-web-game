const LEFTKEY = 37;
const RIGHTKEY = 39;
const UPKEY = 38;
const DOWNKEY = 40;
class UserInteractionHandler {
    constructor(touchElement, game) {
        this.gameInstance = game;
        this.element = touchElement;
        this.xDown = null;
        this.yDown = null;
        this.keyCode = null;
    }

    init() {
        document.addEventListener("keydown", this.handleKeyboard.bind(this));
        this.element.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
        this.element.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
        this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    }

    handleKeyboard(evt) {
        if(![LEFTKEY, RIGHTKEY, UPKEY, DOWNKEY].includes(evt.keyCode)) {
            return;
        }
        this.gameInstance.makeMove.call(this.gameInstance, evt.keyCode);
    }

    handleTouchStart(evt) {
        this.xDown = evt.touches[0].clientX;
        this.yDown = evt.touches[0].clientY;
        console.log(`touch start, x: ${this.xDown}, y: ${this.yDown}`);
        this.keyCode = null;
    }

    handleTouchEnd(evt) {
        if(this.keyCode) {
            console.log(`touch end, key code: ${this.keyCode}`);
            this.gameInstance.makeMove.call(this.gameInstance, this.keyCode);
        }
    }
    handleTouchMove(evt) {
        if(!this.xDown || !this.yDown) {
          console.log("touch move but x, y are null")
          return;
        }
        var xDiff = this.xDown - evt.touches[0].clientX;
        var yDiff = this.yDown - evt.touches[0].clientY;
        console.log(`touch move, xDiff: ${xDiff}, yDiff: ${yDiff}`);
        if(Math.abs(xDiff) > Math.abs(yDiff)) {
            if(xDiff > 0) {
                this.keyCode = LEFTKEY;
            } else {
                this.keyCode = RIGHTKEY;
            }
        } else {
            if(yDiff > 0) {
                this.keyCode = UPKEY;
            } else {
                this.keyCode = DOWNKEY;
            }
        }
    }
}
