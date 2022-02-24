function clearBoard() {
    let el = document.getElementById('board')
    board.style.opacity = 1;
    board.style.transform = `scale(0.8)`;
    board.style.transition = `all ${150}ms`;
    board.style.opacity = 0;
    setTimeout(() => {
        document.getElementsByTagName('svg')[0].innerHTML=''
        board.style.opacity = 1;
        board.style.transform = `scale(1)`;
    }, 150);
}

const fadeIn = (cl, timeout) => {
    let el = document.querySelector(cl)
    el.style.opacity = 0;
    el.style.display = 'flex'
    el.style.transition = `opacity ${timeout}ms`;
    setTimeout(() => {
        el.style.opacity = 1;
    }, 10);
}

const fadeOut = (cl, timeout) => {
    let el = document.querySelector(cl)
    el.style.opacity = 1;
    el.style.transition = `opacity ${timeout}ms`;
    el.style.opacity = 0;

    setTimeout(() => {
        el.style.display = 'none';
    }, timeout);
}