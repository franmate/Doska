function appendPath() {
    const path = scene.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    path.setAttribute("stroke", colorOption)
    path.setAttribute("stroke-width", widthOption)
    return path
}

function pointsToPath(points) {
    return 'M' + points.map(function (p) { return (p.x || p[0] || 0).toFixed(0) + ',' + (p.y || p[1] || 0).toFixed(0) }).join('L')
}

let points
let simplify2Path

board.onpointerdown = function (event) {
    if (event.button == 0) {
        points = [[(event.offsetX - scene.transform.baseVal[0].matrix.e) / scene.transform.baseVal[0].matrix.a, (event.offsetY - scene.transform.baseVal[0].matrix.f) / scene.transform.baseVal[0].matrix.a]]
        simplify2Path = appendPath()
        this.setPointerCapture(event.pointerId)
    }
}

board.onpointermove = function (event) {
    if (this.hasPointerCapture(event.pointerId)) {
        points.push([(event.offsetX - scene.transform.baseVal[0].matrix.e) / scene.transform.baseVal[0].matrix.a, (event.offsetY - scene.transform.baseVal[0].matrix.f) / scene.transform.baseVal[0].matrix.a])
        const simplifyJsApplied = simplify(points.map(function (p) { return { x: p[0], y: p[1] } }, 2.5), true)
        simplify2Path.setAttribute('d', pointsToPath(points))
        // simplify2Path.setAttribute('d', simplifySvgPath(simplifyJsApplied.map(function (p) { return [p.x, p.y] }), { tolerance: 2.5, precision: 0 }))
    }
}

board.onpointerup = function (event) {
    if (event.button == 0) {
        if (this.hasPointerCapture(event.pointerId)) {
            points.push([(event.offsetX - scene.transform.baseVal[0].matrix.e) / scene.transform.baseVal[0].matrix.a, (event.offsetY - scene.transform.baseVal[0].matrix.f) / scene.transform.baseVal[0].matrix.a])
            const simplifyJsApplied = simplify(points.map(function (p) { return { x: p[0], y: p[1] } }, 2.5), true)
            simplify2Path.setAttribute('d', simplifySvgPath(simplifyJsApplied.map(function (p) { return [p.x, p.y] }), { tolerance: 2.5, precision: 0 }))
        }
    }
}