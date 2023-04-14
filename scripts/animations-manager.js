class AnimationsManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.animations = [];
        this.animate = true;
        this.cancelRequested = false;
    }

    set blockAnimations(block) {
        this.animate = !block;
    }    

    addAnimation(animation) {
        this.animations.push(animation);
    }

    clearAnimations() {
        this.animations = [];
    }

    getNextAnimationOrder(currentOrder) {
        const orderSet = new Set(this.animations.map(animation => animation.order));
        const nextOrders = [...orderSet].filter(order => order > currentOrder);
        if(nextOrders.length === 0) {
          return null;
        }
        return nextOrders[0];
    }

    getMaxAnimationOrder() {
        return Math.max(...this.animations.map(animation => animation.order));
    }

    runAnimations(order = -1) {
        if(!this.animate) return;
        var nextOrder = this.getNextAnimationOrder(order);
        if(nextOrder === null) {
            return;
        }
        var orderAnimations = this.animations.filter(animation => animation.order == nextOrder);
        var animationPromises = orderAnimations.map(anim => anim.animate(this.ctx));
        Promise.all(animationPromises).then(() => {
            if(this.cancelRequested) {
                return;
            }
            this.runAnimations(nextOrder);
        });
    }
      
    cancelRunningAnimations() {
        this.cancelRequested = true;
        const notCompletedAnimations = this.animations.filter(anim => anim.status != ANIM_ENDED);
        notCompletedAnimations.forEach(anim => anim.cancelAnimation());
        console.log(`${notCompletedAnimations.length} animations have not completed`)
        this.cancelRequested = false;
    }

    allAnimationsCompleted() {
        return this.animations.every(anim => anim.status === ANIM_ENDED);
    }
}