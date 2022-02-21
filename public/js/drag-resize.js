let paths = document.getElementsByTagName('path')
let activeObject
scene.onpointerdown = function (event) {
    activeObject = event.target
}