let instance = panzoom(scene, {
    maxZoom: 1.6,
    minZoom: 0.1,
    zoomSpeed: 0.08,
    beforeMouseDown: function (e) {
        let shouldIgnore = !e.button
        return shouldIgnore
    }
})

instance.on('transform', function () {
    background.style.backgroundPositionX = `${scene.transform.baseVal[0].matrix.e}px`
    background.style.backgroundPositionY = `${scene.transform.baseVal[0].matrix.f}px`
    background.style.backgroundSize = `${55 * scene.transform.baseVal[0].matrix.a}px`
})