const socket = io('/');
let userInfo;
socket.emit('join-room', ROOM_ID, 10);
// socket.on('user-connected', userId => {
//     console.log('User connected: ' + userId);
// })
socket.on('name room', nameAndRoom => {
    socket.emit('find mate', nameAndRoom);
});

fabric.Object.prototype.centeredScaling = true;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.transparentCorners = false;
fabric.Canvas.prototype.getItemByName = function(name) {
    var object = null,
        objects = this.getObjects();
  
    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].name && objects[i].name === name) {
            object = objects[i];
            break;
        }
    }
    return object;
};
fabric.Canvas.prototype.getItemByPrev = function(prev) {
    var object = null,
        objects = this.getObjects();
  
    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].prev && objects[i].prev === prev) {
            object = objects[i];
            break;
        }
    }
    return object;
};

function changeAction(target) {
    ['select','erase','brush'].forEach(action => {
        const t = document.getElementById(action);
        t.classList.remove('active');
    });
    if(typeof target==='string') target = document.getElementById(target);
    target.classList.add('active');
    switch (target.id) {
        case "select":
            canvas.isDrawingMode = false;
            break;
        case "erase":
            canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
            canvas.freeDrawingBrush.width = 35;
            canvas.isDrawingMode = true;
            break;
        case "brush":
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = 5;
            canvas.isDrawingMode = true;
            break;
        default:
            break;
    }
}
  
const downloadImage = () => {
    const ext = "png";
    const base64 = canvas.toDataURL({
        format: ext,
        enableRetinaScaling: true
    });
    const link = document.createElement("a");
    link.href = base64;
    link.download = `list.${ext}`;
    link.click();
};
const downloadSVG = () => {
    const svg = canvas.toSVG();
    const a = document.createElement("a");
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const blobURL = URL.createObjectURL(blob);
    a.href = blobURL;
    a.download = "list.svg";
    a.click();
    URL.revokeObjectURL(blobURL);
};
  
const canvas = this.__canvas = new fabric.Canvas('c');

// init variables
let div = $("#canvasWrapper");
let $canvas = $("#c");

// width and height of canvas's wrapper
let w, h;
w = div.width();
h = div.height();
$canvas.width(w).height(h);

// set w & h for canvas
canvas.setHeight(h);
canvas.setWidth(w);

changeAction('brush');

// undo redo command history
var lockHistory = false;
var undo_history = [];
var redo_history = [];
undo_history.push(JSON.stringify(canvas));
originalName = "";

canvas.on("object:added", function () {
    if (lockHistory) return;
    // console.log("object:added");
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
    // console.log(undo_history.length);

    var objects = canvas.getObjects();
    let newObject = objects.length - 1;
    objectName = (Math.random()).toString().substring(2, 17);
    objects[newObject].name = objectName;
    originalName = objects[newObject].name;
});
canvas.on("object:modified", function () {
    if (lockHistory) return;
    // console.log("object:modified");
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
    // console.log(undo_history.length);
});

sourceObject = "";
canvas.on("object:moving", function() {
    activeObject = canvas.getActiveObjects();
    sourceObject = activeObject[0].name;
});
canvas.on("object:moved", function() {
    objectName = (Math.random()).toString().substring(2, 17);
    activeObject[0].name = objectName;
    originalName = activeObject[0].name;

    emitModified();
});
canvas.on("object:scaled", function() {
    objectName = (Math.random()).toString().substring(2, 17);
    activeObject[0].name = objectName;
    originalName = activeObject[0].name;

    emitModified();
});
canvas.on("object:rotated", function() {
    objectName = (Math.random()).toString().substring(2, 17);
    activeObject[0].name = objectName;
    originalName = activeObject[0].name;

    emitModified();
});

canvas.on("mouse:up", function() {
    if (canvas.isDrawingMode === true) {
        emitEvent();
    }
});

function undo() {
    if (undo_history.length > 0) {
        lockHistory = true;
        if (undo_history.length > 1) redo_history.push(undo_history.pop());
        var content = undo_history[undo_history.length - 1];
        canvas.loadFromJSON(content, function () {
            canvas.renderAll();
            lockHistory = false;
        });
        goPostman("undo");
    }
}
function redo() {
    if (redo_history.length > 0) {
        lockHistory = true;
        var content = redo_history.pop();
        undo_history.push(content);
        canvas.loadFromJSON(content, function () {
            canvas.renderAll();
            lockHistory = false;
        });
        goPostman("redo");
    }
}
function clearCanvas() {
    canvas.clear().renderAll();
    newleft = 0;
    goPostman("clear");
}

// duplicate delete buttons
var deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-circle-x' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Ccircle cx='12' cy='12' r='9' /%3E%3Cpath d='M10 10l4 4m0 -4l-4 4' /%3E%3C/svg%3E";
var cloneIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-copy' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Crect x='8' y='8' width='12' height='12' rx='2' /%3E%3Cpath d='M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2' /%3E%3C/svg%3E"

var deleteImg = document.createElement('img');
deleteImg.src = deleteIcon;

var cloneImg = document.createElement('img');
cloneImg.src = cloneIcon;

function renderIcon(icon) {
    return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        var size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(icon, -size/2, -size/2, size, size);
        ctx.restore();
    }
}

fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon(deleteImg),
    cornerSize: 24
});

fabric.Object.prototype.controls.clone = new fabric.Control({
    x: -0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: -16,
    cursorStyle: 'pointer',
    mouseUpHandler: cloneObject,
    render: renderIcon(cloneImg),
    cornerSize: 24
});

function deleteObject(eventData, transform) {
    let activeGroup = canvas.getActiveObjects();

    if (activeGroup) {
        canvas.discardActiveObject();
        activeGroup.forEach(function (object) {
            canvas.remove(object);
        });
    }
}

function cloneObject() {
    if(canvas.getActiveObject().get('type')==="image") {
        var copyData = canvas.getActiveObject().toObject();
        fabric.util.enlivenObjects([copyData], function(objects) {
            objects.forEach(function(clonedImg) {
                clonedImg.set('top', clonedImg.top - 20);
                clonedImg.set('left', clonedImg.left + 20);
                canvas.add(clonedImg);
                canvas.setActiveObject(clonedImg);
            });
            canvas.renderAll();
        });
    } else {
        canvas.getActiveObject().clone(function(cloned) {
            _clipboard = cloned;
        });
        _clipboard.clone(function(clonedObj) {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top - 20,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // Active selection needs a reference to the canvas
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function(obj) {
                    canvas.add(obj);
                });
                // This should solve the unselectability
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }
            _clipboard.top -= 20;
            _clipboard.left += 20;
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
        });
    }
}

// socket
let lastObj = canvas.item(canvas.size() - 1);
function emitEvent() {
    let newObj = canvas.item(canvas.size() - 1);
    if (newObj != lastObj) {
        let json = JSON.stringify(newObj);
        let data = {
            name: originalName,
            json: json,
            modified: "false"
        };
        socket.emit('drawing', data);
        lastObj = newObj;
    }
}

function emitModified() {
    let newObj = canvas.getActiveObject();
    let json = JSON.stringify(newObj);
    let data = {
        name: originalName,
        json: json,
        modified: "true",
        prev: sourceObject
    };
    socket.emit('drawing', data);
    lastObj = newObj;
}

function getPrevious() {
    let data = {
        data: JSON.stringify(canvas.toDatalessJSON())
    };
    socket.emit('previous', data);
}

function goPostman(listenCommand) {
    let jsonCommand = JSON.stringify(listenCommand);
    socket.emit('postman', jsonCommand);
}

socket.on('drawing', function (obj) {
    let jsonObj = JSON.parse(obj.json);
    fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
        enlivenedObjects[0].prev = obj.name
        canvas.add(enlivenedObjects[0]);
        canvas.renderAll();
    });
    let modified = obj.modified;
    let previousName = obj.prev;
    if (modified === "true") {
        canvas.remove(canvas.getItemByPrev(previousName));
    }
});

socket.on('get canvas', function (obj) {
    canvas.loadFromJSON(obj.data);
});

socket.on('get requester', requesterID => {
    let data = {
        data: JSON.stringify(canvas.toDatalessJSON())
    };
    socket.emit('send canvas', requesterID, data);
})

socket.on('postman', function (cmd) {
    let newCommand = JSON.parse(cmd);
    if (newCommand == "undo") {
        if (undo_history.length > 0) {
            lockHistory = true;
            if (undo_history.length > 1) redo_history.push(undo_history.pop());
            var content = undo_history[undo_history.length - 1];
            canvas.loadFromJSON(content, function () {
                canvas.renderAll();
                lockHistory = false;
            });
        }
    } else if (newCommand == "redo") {
        if (redo_history.length > 0) {
            lockHistory = true;
            var content = redo_history.pop();
            undo_history.push(content);
            canvas.loadFromJSON(content, function () {
                canvas.renderAll();
                lockHistory = false;
            });
        }
    } else if (newCommand == "clear") {
        canvas.clear().renderAll();
        newleft = 0;
    } else if (newCommand == "none") {
        $('#c').css('background-image','url(../assets/patterns/pattern_none.svg)');
        $('.paper').css('background-image','url(../assets/icons/rect.svg)');
    } else if (newCommand == "sq") {
        $('#c').css('background-image','url(../assets/patterns/pattern_sq.svg)');
        $('.paper').css('background-image','url(../assets/icons/sq.svg)');
    } else if (newCommand == "line") {
        $('#c').css('background-image','url(../assets/patterns/pattern_line.svg)');
        $('.paper').css('background-image','url(../assets/icons/line.svg)');
    } else if (newCommand == "dot") {
        $('#c').css('background-image','url(../assets/patterns/pattern_dot.svg)');
        $('.paper').css('background-image','url(../assets/icons/dot.svg)');
    }
});

// dock panel
let menuToggle = false;

$('.shapes').click(function(){
    if (menuToggle === false) {
        $(".addShape").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".addShape").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});

$('.colors').click(function(){
    if (menuToggle === false) {
        $(".brushColors").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".brushColors").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
$('.color-input').hover(function(){
    menuToggle = false;
}, function(){
    menuToggle = true;
});
$('.black').click(function(){
    $('.colors, .pen, .shapes, .rectangle, .circle').css('background-color','#7a7a7a44');
});
$('.red').click(function(){
    $('.colors, .pen, .shapes, .rectangle, .circle').css('background-color','#ff6a6444');
});
$('.yellow').click(function(){
    $('.colors, .pen, .shapes, .rectangle, .circle').css('background-color','#ffde4b44');
});
$('.green').click(function(){
    $('.colors, .pen, .shapes, .rectangle, .circle').css('background-color','#2dff6144');
});
$('.blue').click(function(){
    $('.colors, .pen, .shapes, .rectangle, .circle').css('background-color','#50a2ff44');
});

$('.size').click(function(){
    if (menuToggle === false) {
        $(".brushSize").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".brushSize").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
$('.small').click(function(){
    $('.size').css('background-size','50%');
});
$('.middle').click(function(){
    $('.size').css('background-size','70%');
});
$('.big').click(function(){
    $('.size').css('background-size','110%');
});

$('.paper').click(function(){
    if (menuToggle === false) {
        $(".canvasBackground").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".canvasBackground").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
$('.none').click(function(){
    $('#c').css('background-image','url(../assets/patterns/pattern_none.svg)');
    $('.paper').css('background-image','url(../assets/icons/rect.svg)');
    goPostman("none");
});
$('.sq').click(function(){
    $('#c').css('background-image','url(../assets/patterns/pattern_sq.svg)');
    $('.paper').css('background-image','url(../assets/icons/sq.svg)');
    goPostman("sq");
});
$('.line').click(function(){
    $('#c').css('background-image','url(../assets/patterns/pattern_line.svg)');
    $('.paper').css('background-image','url(../assets/icons/line.svg)');
    goPostman("line");
});
$('.dot').click(function(){
    $('#c').css('background-image','url(../assets/patterns/pattern_dot.svg)');
    $('.paper').css('background-image','url(../assets/icons/dot.svg)');
    goPostman("dot");
});

$('body').click(function(){
    if (menuToggle === true) {
        $(".addShape").fadeOut(100);
        $(".brushColors").fadeOut(100);
        $(".brushSize").fadeOut(100);
        $(".canvasBackground").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});