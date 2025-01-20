class CursorEffects {
    constructor() {
        this.initMouseEffects();
    }

    initMouseEffects() {
        let timeout;
        $(document).mousemove((e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                $('.light-cursor').css({
                    left: e.pageX,
                    top: e.pageY,
                    opacity: 1
                });
            }, 10);
        });

        $(document).mouseleave(() => {
            $('.light-cursor').css('opacity', 0);
        });
    }
}

window.cursorEffects = new CursorEffects(); 