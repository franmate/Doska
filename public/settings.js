// Default brush settings
let widthOption = 4
let colorOption = '#000'

// Change tool
function changeAction(target) {
    ['select', 'eraser', 'pen'].forEach(action => {
        const t = document.getElementById(action);
        t.classList.remove('active')
    })
    if (typeof target === 'string') target = document.getElementById(target)
    target.classList.add('active')
    switch (target.id) {
        case "select":
            // canvas.isDrawingMode = false
            break
        case "eraser":
            // canvas.freeDrawingBrush.width = widthOption
            // canvas.isDrawingMode = true
            break
        case "pen":
            // canvas.freeDrawingBrush.width = widthOption
            // canvas.freeDrawingBrush.color = colorOption
            // canvas.isDrawingMode = true
            break
        default:
            break
    }
}
// Default tool
changeAction('pen')

// Brush settings
function setBrush(options) {
    // Width settings
    if (options.width !== undefined) {
        widthOption = options.width
        document.querySelector('#sizes button.active').classList.remove('active')
    }
    if (options.width == 3) {
        size.style.backgroundSize = '50%'
        small.classList.add('active')
    }
    if (options.width == 4) {
        size.style.backgroundSize = '76%'
        middle.classList.add('active')
    }
    if (options.width == 5) {
        size.style.backgroundSize = '110%'
        big.classList.add('active')
    }

    // Height settings
    if (options.color !== undefined) {
        let val = options.color
        colorOption = val
        color.style.backgroundColor = val
    }
}
colorInput.onchange = function () {
    setBrush({ color: colorInput.value })
}

// Set canvas pattern
let currentPattern = 'none'
function setPattern(name) {
    background.style.backgroundImage = `url(../assets/patterns/pattern_${name}.svg)`
    pattern.style.backgroundImage = `url(../assets/icons/${name}.svg)`
    document.querySelector('#patterns button.active').classList.remove('active')
    document.getElementById(name).classList.add('active')
    currentPattern = name
};
setPattern('none')

let menuToggle = false
// Brush color panel
color.onclick = function () {
    if (menuToggle === false) {
        fadeIn('#colors', 200)
        setTimeout(() => {
            menuToggle = true
        }, 200)
    } else {
        fadeOut('#colors', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
}
colorInput.onpointerenter = function () {
    menuToggle = false
}
colorInput.onpointerleave = function () {
    menuToggle = true
}

// Brush size panel
size.onclick = function () {
    if (menuToggle === false) {
        fadeIn('#sizes', 200)
        setTimeout(() => {
            menuToggle = true
        }, 200)
    } else {
        fadeOut('#sizes', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
}

// Canvas pattern panel
pattern.onclick = function () {
    if (menuToggle === false) {
        fadeIn('#patterns', 200)
        setTimeout(() => {
            menuToggle = true
        }, 200)
    } else {
        fadeOut('#patterns', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
}

document.getElementsByTagName('body')[0].onclick = function () {
    if (menuToggle === true) {
        fadeOut('#colors', 200)
        fadeOut('#sizes', 200)
        fadeOut('#patterns', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
}