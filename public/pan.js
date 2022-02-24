var panZoom = window.panZoom = svgPanZoom('#board', {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: 1,
    center: 1
});

$(window).resize(function () {
    panZoom.resize();
    panZoom.fit();
    panZoom.center();
})