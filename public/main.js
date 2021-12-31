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

let widthOption = 5;
let colorOption = 'black';

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
            canvas.freeDrawingBrush.width = widthOption;
            canvas.freeDrawingBrush.color = colorOption;
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
undo_history.push(JSON.stringify(canvas.toJSON(['name'])));

function story() {
    let newObj = canvas.item(canvas.size() - 1);
    if (lockHistory) return;
    undo_history.push(JSON.stringify(newObj.toJSON(['name'])));
    redo_history.length = 0;
}

canvas.on("object:added", function (e) {
    if (e.target.name === undefined) {
        let objectName = (Math.random()).toString().substring(2, 17);
        e.target.set('name', objectName);
    }
});
canvas.on("path:created", function () {
    story();
    emitEvent();
});
canvas.on("object:modified", function (e) {
    if ((e.target.type === 'activeSelection') || (e.target.type === 'group')) {
        emitGroup();
    } else {
        emitModified();
    }
    story();
});
canvas.on("erasing:end", function () {
    // e.path.globalCompositeOperation = 'destination-out';
    story();
    emitEvent();
    console.log("erasing:end");
});

// canvas.on("mouse:up", function() {
//     if (canvas.isDrawingMode === true) {
//         emitEvent();
//     }
// });

canvas.on("selection:created", function() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
        return;
    }
    canvas.getActiveObject().toGroup();
    canvas.requestRenderAll();
});
// canvas.on("selection:updated", function() {
//     console.log("selecion updated");
// });
// canvas.on("selection:cleared", function() {
//     console.log("selecion cleared");
// });
canvas.on("before:selection:cleared", function() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'group') {
        return;
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
});

function undo() {
    if (undo_history.length > 0) {
        lockHistory = true;
        if (undo_history.length > 1) redo_history.push(undo_history.pop());
        canvas.remove(canvas.item(canvas.size() - 1));
        canvas.renderAll();
        lockHistory = false;
    }
}
function redo() {
    if (redo_history.length > 0) {
        lockHistory = true;
        var content = redo_history.pop();
        undo_history.push(content);
        var content = JSON.parse(undo_history[undo_history.length - 1]);
        fabric.util.enlivenObjects([content], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
        });
        canvas.renderAll();
        lockHistory = false;
    }
}
function clearCanvas() {
    story();
    canvas.clear().renderAll();
}

// duplicate delete buttons
var deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-circle-x' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Ccircle cx='12' cy='12' r='9' /%3E%3Cpath d='M10 10l4 4m0 -4l-4 4' /%3E%3C/svg%3E";
// var cloneIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='icon icon-tabler icon-tabler-copy' width='24' height='24' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Crect x='8' y='8' width='12' height='12' rx='2' /%3E%3Cpath d='M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2' /%3E%3C/svg%3E"

var deleteImg = document.createElement('img');
deleteImg.src = deleteIcon;

// var cloneImg = document.createElement('img');
// cloneImg.src = cloneIcon;

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

// fabric.Object.prototype.controls.clone = new fabric.Control({
//     x: -0.5,
//     y: -0.5,
//     offsetY: -16,
//     offsetX: -16,
//     cursorStyle: 'pointer',
//     mouseUpHandler: cloneObject,
//     render: renderIcon(cloneImg),
//     cornerSize: 24
// });

function deleteObject(eventData, transform) {
    if (canvas.getActiveObject().type === 'group') {
        canvas.getActiveObject().toActiveSelection();
    }
    let activeGroup = canvas.getActiveObjects();

    if (activeGroup) {
        story();
        canvas.discardActiveObject();
        activeGroup.forEach(function (object) {
            goPostman(object.name)
            canvas.remove(object);
        });
        goPostman("deleteEnding");
    }
}

function cloneObject() {
    canvas.getActiveObject().toActiveSelection();
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
            emitEvent();
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
            canvas.setActiveObject(clonedObj).toGroup();
            canvas.requestRenderAll();
            emitGroup();
        });
    }
}

$(window)
    .on('resize', function () {
        w = div.width();
        h = div.height();
        canvas.setHeight(h);
        canvas.setWidth(w);
        $canvas.width(w).height(h);
    })
    .on('keydown', function (e) {
        if (e.keyCode === 46) { //delete key
            deleteObjects();
        }
    });

function setBrush(options) {
    if (options.width !== undefined) {
        canvas.freeDrawingBrush.width = parseInt(options.width, 10);
        widthOption = parseInt(options.width, 10);
    }

    if (options.color !== undefined) {
        canvas.freeDrawingBrush.color = options.color;
        colorOption = options.color;
    }
}

// Set Brush Size
$(".size-btns button").on('click', function () {
    $(".size-btns button").removeClass('active');
    $(this).addClass('active');
});

// Set brush color
$(".color-btns button").on('click', function () {
    let val = $(this).data('value');
    activeColor = val;
    $("#brushColor").val(val);
    setBrush({color: val});
});

$("#brushColor").on('change', function () {
    let val = $(this).val();
    activeColor = val;
    setBrush({color: val});
});

// Socket
let lastObj = canvas.item(canvas.size() - 1);
function emitEvent() {
    let newObj = canvas.item(canvas.size() - 1);
    if (newObj != lastObj) {
        let json = JSON.stringify(newObj.toJSON(['name']));
        let data = {
            json: json,
            grouped: "false",
            modified: "false"
        };
        socket.emit('drawing', data);
        lastObj = newObj;
        // console.log('new is emited' + ' ' + newObj.name);
    }
}

function emitModified() {
    let newObj = canvas.getActiveObject();
    let json = JSON.stringify(newObj.toJSON(['name']));
    let data = {
        json: json,
        grouped: "false",
        modified: "true"
    };
    socket.emit('drawing', data);
    lastObj = newObj;
    // console.log('modified is emited' + ' ' + newObj.name);
}

function emitGroup() {
    let newObj = canvas.getActiveObject();
    let json = JSON.stringify(newObj.toJSON(['name']));
    let data = {
        json: json,
        grouped: "true",
        modified: "false"
    };
    socket.emit('drawing', data);
    lastObj = newObj;
    // console.log('group is emited' + ' ' + newObj.name);
}

function goPostman(listenCommand) {
    let jsonCommand = JSON.stringify(listenCommand);
    socket.emit('postman', jsonCommand);
}

socket.on('drawing', function (obj) {
    let jsonObj = JSON.parse(obj.json);
    if (obj.modified === "true") {
        canvas.remove(canvas.getItemByName(jsonObj.name));
        canvas.renderAll();
    }
    if (obj.grouped === "false") {
        fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.renderAll();
            // console.log(jsonObj.name + ' ' + obj.modified);
        });
    } else if (obj.grouped === "true") {
        fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.setActiveObject(enlivenedObjects[0]);
            canvas.getActiveObject().toActiveSelection();
            canvas.getActiveObjects().forEach(element => canvas.remove(canvas.getItemByName(element.name)));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            // console.log(jsonObj.name + ' ' + obj.modified);
            // console.log('ungrouped')
        });
    }
    story();
});

socket.on('get canvas', function (obj) {
    canvas.loadFromJSON(obj.data);
    undo_history = obj.undo;
    redo_history = obj.redo;
});

socket.on('get requester', requesterID => {
    let data = {
        data: JSON.stringify(canvas.toJSON(['name'])),
        undo: undo_history,
        redo: redo_history
    };
    socket.emit('send canvas', requesterID, data);
})

socket.on('postman', function (cmd) {
    let newCommand = JSON.parse(cmd);
    if (newCommand == "undo") {
        undo();
    } else if (newCommand == "redo") {
        redo();
    } else if (newCommand == "clear") {
        clearCanvas();
    } else if (newCommand == "none") {
        canvas.setBackgroundColor({source: '/assets/patterns/pattern_none.svg', repeat: 'repeat'}, function () {
            canvas.renderAll();
        });
        $('.paper').css('background-image','url(../assets/icons/rect.svg)');
        $(".bcgr-btns button").removeClass('active');
        $(this).addClass('active');
    } else if (newCommand == "sq") {
        canvas.setBackgroundColor({source: '/assets/patterns/pattern_sq.svg', repeat: 'repeat'}, function () {
            canvas.renderAll();
        });
        $('.paper').css('background-image','url(../assets/icons/sq.svg)');
        $(".bcgr-btns button").removeClass('active');
        $(this).addClass('active');
    } else if (newCommand == "line") {
        canvas.setBackgroundColor({source: '/assets/patterns/pattern_line.svg', repeat: 'repeat'}, function () {
            canvas.renderAll();
        });
        $('.paper').css('background-image','url(../assets/icons/line.svg)');
        $(".bcgr-btns button").removeClass('active');
        $(this).addClass('active');
    } else if (newCommand == "dot") {
        canvas.setBackgroundColor({source: '/assets/patterns/pattern_dot.svg', repeat: 'repeat'}, function () {
            canvas.renderAll();
        });
        $('.paper').css('background-image','url(../assets/icons/dot.svg)');
        $(".bcgr-btns button").removeClass('active');
        $(this).addClass('active');
    } else if (newCommand == "deleteEnding") {
        story();
    } else {
        canvas.remove(canvas.getItemByName(newCommand));
    }
});

// Dock panel
let menuToggle = false;

// $('.shapes').click(function(){
//     if (menuToggle === false) {
//         $(".addShape").fadeIn(100);
//         setTimeout(() => {
//             menuToggle = true;
//         }, 200);
//     } else {
//         $(".addShape").fadeOut(100);
//         setTimeout(() => {
//             menuToggle = false;
//         }, 200);
//     }
// });

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
    $('.colors').css('background-color','#b8b8b8');
});
$('.red').click(function(){
    $('.colors').css('background-color','#ff4b4b');
});
$('.yellow').click(function(){
    $('.colors').css('background-color','#ffab2c');
});
$('.green').click(function(){
    $('.colors').css('background-color','#1dcf46');
});
$('.blue').click(function(){
    $('.colors').css('background-color','#25a1ff');
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
    canvas.setBackgroundColor({source: '/assets/patterns/pattern_none.svg', repeat: 'repeat'}, function () {
        canvas.renderAll();
    });
    $('.paper').css('background-image','url(../assets/icons/rect.svg)');
    $(".bcgr-btns button").removeClass('active');
    $(this).addClass('active');
    goPostman("none");
});
$('.sq').click(function(){
    canvas.setBackgroundColor({source: '/assets/patterns/pattern_sq.svg', repeat: 'repeat'}, function () {
        canvas.renderAll();
    });
    $('.paper').css('background-image','url(../assets/icons/sq.svg)');
    $(".bcgr-btns button").removeClass('active');
    $(this).addClass('active');
    goPostman("sq");
});
$('.line').click(function(){
    canvas.setBackgroundColor({source: '/assets/patterns/pattern_line.svg', repeat: 'repeat'}, function () {
        canvas.renderAll();
    });
    $('.paper').css('background-image','url(../assets/icons/line.svg)');
    $(".bcgr-btns button").removeClass('active');
    $(this).addClass('active');
    goPostman("line");
});
$('.dot').click(function(){
    canvas.setBackgroundColor({source: '/assets/patterns/pattern_dot.svg', repeat: 'repeat'}, function () {
        canvas.renderAll();
    });
    $('.paper').css('background-image','url(../assets/icons/dot.svg)');
    $(".bcgr-btns button").removeClass('active');
    $(this).addClass('active');
    goPostman("dot");
});

$('body').click(function(){
    if (menuToggle === true) {
        // $(".addShape").fadeOut(100);
        $(".brushColors").fadeOut(100);
        $(".brushSize").fadeOut(100);
        $(".canvasBackground").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});