// Default brush settings
let widthOption = 4
let colorOption = '#000'

// Change tool
function changeAction(target) {
    ['select', 'erase', 'brush'].forEach(action => {
        const t = document.getElementById(action);
        t.classList.remove('active')
    })
    if (typeof target === 'string') target = document.getElementById(target)
    target.classList.add('active')
    switch (target.id) {
        case "select":
            // canvas.isDrawingMode = false
            break
        case "erase":
            // canvas.freeDrawingBrush = new fabric.EraserBrush(canvas)
            // canvas.freeDrawingBrush.width = widthOption
            // canvas.isDrawingMode = true
            break
        case "brush":
            // canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
            // canvas.freeDrawingBrush.width = widthOption
            // canvas.freeDrawingBrush.color = colorOption
            // canvas.isDrawingMode = true
            break
        default:
            break
    }
}
// Default tool
changeAction('brush')

// Brush settings
function setBrush(options) {
    if (options.width !== undefined) {
        // canvas.freeDrawingBrush.width = parseInt(options.width, 10)
        widthOption = parseInt(options.width, 10)
    }

    if (options.color !== undefined) {
        // canvas.freeDrawingBrush.color = options.color
        colorOption = options.color
    }
}

// Set brush size
$(".brushSizes button").on('click', function () {
    $(".brushSizes button").removeClass('active')
    $(this).addClass('active')
})

// Set brush color
$(".brushColors button").on('click', function () {
    let val = $(this).data('value')
    activeColor = val
    $("#brushColors").val(val)
    setBrush({ color: val })
    $('.colors').css('background-color', val)
})
$(".color-input").on('change', function () {
    let val = $(this).val()
    activeColor = val
    setBrush({ color: val })
    $('.colors').css('background-color', val)
})

// Set canvas pattern
let background = document.getElementById('background')
let currentPattern = 'none'
function setPattern(name) {
    background.style.backgroundImage = `url(../assets/patterns/pattern_${name}.svg)`
    $('.patterns').css('background-image', `url(../assets/icons/${name}.svg)`)
    $(".canvasPatterns button").removeClass('active')
    $(`.${name}`).addClass('active')
    currentPattern = name
};

// Default canvas pattern
setTimeout(() => {
    setPattern('none')
}, 300)

// Hide panels on drawing/panning
// let animationLock = false
board.addEventListener('pointerdown', () => {
    fadeOut('.dockPanel', 200)
    fadeOut('.topPanel', 200)
    // animationLock = true
})
board.addEventListener('pointerup', () => {
    // let lTor = 0
    // let checkLockAnimation = setInterval(() => {
    //     interval
    // }, interval);
    setTimeout(() => {
        fadeIn('.dockPanel', 250)
        fadeIn('.topPanel', 250)
    }, 450)
})

let menuToggle = false

// Brush color panel
$('.colors').click(function () {
    if (menuToggle === false) {
        fadeIn('.brushColors', 200)
        setTimeout(() => {
            menuToggle = true
        }, 200)
    } else {
        fadeOut('.brushColors', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
})
$('.color-input').hover(function () {
    menuToggle = false
}, function () {
    menuToggle = true
})

// Brush size panel
$('.sizes').click(function () {
    if (menuToggle === false) {
        fadeIn('.brushSizes', 200)
        setTimeout(() => {
            menuToggle = true
        }, 200)
    } else {
        fadeOut('.brushSizes', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
})
$('.small').click(function () {
    $('.sizes').css('background-size', '50%')
})
$('.middle').click(function () {
    $('.sizes').css('background-size', '76%')
})
$('.big').click(function () {
    $('.sizes').css('background-size', '110%')
})

// Canvas pattern panel
$('.patterns').click(function () {
    if (menuToggle === false) {
        fadeIn('.canvasPatterns', 200)
        setTimeout(() => {
            menuToggle = true
        }, 200)
    } else {
        fadeOut('.canvasPatterns', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
})

$('body').click(function () {
    if (menuToggle === true) {
        fadeOut('.brushColors', 200)
        fadeOut('.brushSizes', 200)
        fadeOut('.canvasPatterns', 200)
        setTimeout(() => {
            menuToggle = false
        }, 200)
    }
})