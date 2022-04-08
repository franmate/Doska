function clearBoard() {
    board.style.transform = `scale(0.8)`
    board.style.opacity = 0
    setTimeout(() => {
        scene.innerHTML = ''
        board.style.opacity = 1
        board.style.transform = `scale(1)`
    }, 150)
}

function addImage(event) {
    let image = document.createElement("img")
    console.log(image)
    scene.append(image)
    image.src = URL.createObjectURL(event.target.files[0]);
}

const fadeIn = (cl, timeout) => {
    let element = document.querySelector(cl)
    element.style.opacity = 0
    element.style.display = 'flex'
    element.style.transition = `opacity ${timeout}ms`
    setTimeout(() => {
        element.style.opacity = 1
    }, 10)
}

const fadeOut = (cl, timeout) => {
    let element = document.querySelector(cl)
    element.style.opacity = 1
    element.style.transition = `opacity ${timeout}ms`
    element.style.opacity = 0

    setTimeout(() => {
        element.style.display = 'none'
    }, timeout)
}