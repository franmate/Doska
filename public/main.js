const svg = document.getElementById('board')

function appendPath() {
    const path = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    path.setAttribute("stroke", colorOption)
    path.setAttribute("stroke-width", widthOption)
    return path
}

function pointsToPath(points) {
    return 'M' + points.map(function (p) { return (p.x || p[0] || 0).toFixed(0) + ',' + (p.y || p[1] || 0).toFixed(0) }).join('L')
}

let points
let simplify2Path

svg.onpointerdown = function (event) {
    points = [[event.offsetX, event.offsetY]]
    simplify2Path = appendPath()
    this.setPointerCapture(event.pointerId)
}

svg.onpointermove = function (event) {
    if (this.hasPointerCapture(event.pointerId)) {
        points.push([event.offsetX, event.offsetY])
        const simplifyJsApplied = simplify(points.map(function (p) { return { x: p[0], y: p[1] } }, 2.5), true)
        simplify2Path.setAttribute('d', pointsToPath(points))
        // simplify2Path.setAttribute('d', simplifySvgPath(simplifyJsApplied.map(function (p) { return [p.x, p.y] }), { tolerance: 2.5, precision: 0 }))
    }
}

svg.onpointerup = function (event) {
    if (this.hasPointerCapture(event.pointerId)) {
        points.push([event.offsetX, event.offsetY])
        const simplifyJsApplied = simplify(points.map(function (p) { return { x: p[0], y: p[1] } }, 2.5), true)
        simplify2Path.setAttribute('d', simplifySvgPath(simplifyJsApplied.map(function (p) { return [p.x, p.y] }), { tolerance: 2.5, precision: 0 }))
    }
}