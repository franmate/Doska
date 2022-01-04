const socket = io('/');
let userInfo;
socket.emit('join-room', ROOM_ID, 10);
// socket.on('user-connected', userId => {
//     console.log('User connected: ' + userId);
// })
socket.on('name room', nameAndRoom => {
    socket.emit('find mate', nameAndRoom);
});

const canvas = this.__canvas = new fabric.Canvas('c');

fabric.Object.prototype.objectCaching = false;
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

changeAction('brush');

// Init variables
let div = $("#canvasWrapper");
let $canvas = $("#c");

// Width & height of canvas's wrapper
let w, h;
w = div.width();
h = div.height();
$canvas.width(w).height(h);

// Set width & height for canvas
canvas.setHeight(h);
canvas.setWidth(w);

// Undo / Redo history
var lockHistory = false;
var undo_history = [];
var redo_history = [];
undo_history.push(JSON.stringify(canvas.toJSON(['name'])));

function story() {
    if (lockHistory) return;
    let newObj = canvas.item(canvas.size() - 1);
    undo_history.push(JSON.stringify(newObj.toJSON(['name'])));
    redo_history.length = 0;
}
function undo() {
    if (undo_history.length > 0) {
        lockHistory = true;
        if (undo_history.length > 1) redo_history.push(undo_history.pop());
        canvas.remove(canvas.item(canvas.size() - 1));
        canvas.requestRenderAll();
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
        canvas.requestRenderAll();
        lockHistory = false;
    }
}

canvas.on("object:added", function (e) {
    if (e.target.name === undefined) {
        let objectName = (Math.random()).toString().substring(2, 17);
        e.target.set('name', objectName);
    }
    story();
});
canvas.on("path:created", function () {
    emitObject();
});
canvas.on("object:modified", function (e) {
    if (e.target.type === 'activeSelection') {
        canvas.getActiveObject().toGroup();
        emitGroup();
        canvas.getActiveObject().toActiveSelection();
    } else {
        emitModified();
    }
    story();
});
canvas.on("erasing:end", function () {
    // e.path.globalCompositeOperation = 'destination-out';
    story();
    emitObject();
    console.log("erasing:end");
});

// canvas.on("selection:created", function() {
//     console.log("selecion created");
// });
// canvas.on("selection:updated", function() {
//     console.log("selecion updated");
// });
// canvas.on("selection:cleared", function() {
//     console.log("selecion cleared");
// });
// canvas.on("before:selection:cleared", function() {
//     console.log("before selecion cleared");
// });

// let rendrd = 0;
// canvas.on("after:render", function() {
//     console.log("rendered " + rendrd + " times");
//     rendrd++;
// });

function clearCanvas() {
    story();
    let objects = canvas.getObjects();
    objects.forEach(function (object) {
        sendCommand(object.name)
        canvas.remove(object);
    });
    sendCommand("deleteDone");
}

// Duplicate / Delete buttons
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
            sendCommand(object.name)
            canvas.remove(object);
        });
        sendCommand("deleteDone");
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
            canvas.requestRenderAll();
            emitObject();
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
        if (e.keyCode === 46) { // Delete key
            deleteObject();
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

// Set brush size
$(".brushSizes button").on('click', function () {
    $(".brushSizes button").removeClass('active');
    $(this).addClass('active');
});

// Set brush color
$(".brushColors button").on('click', function () {
    let val = $(this).data('value');
    activeColor = val;
    $("#brushColors").val(val);
    setBrush({color: val});
    $('.colors').css('background-color', val);
});
$(".color-input").on('change', function () {
    let val = $(this).val();
    activeColor = val;
    setBrush({color: val});
    $('.colors').css('background-color', val);
});

// Socket emit
let lastObj = canvas.item(canvas.size() - 1);
function emitObject() {
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
}

function sendCommand(command) {
    let jsonCommand = JSON.stringify(command);
    socket.emit('send command', jsonCommand);
}

// Socket on
socket.on('drawing', function (obj) {
    let jsonObj = JSON.parse(obj.json);
    if (obj.modified === "true") {
        canvas.remove(canvas.getItemByName(jsonObj.name));
        canvas.requestRenderAll();
    }
    if (obj.grouped === "false") {
        fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.requestRenderAll();
        });
    } else if (obj.grouped === "true") {
        fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.setActiveObject(enlivenedObjects[0]);
            canvas.getActiveObject().toActiveSelection();
            canvas.getActiveObjects().forEach(element => canvas.remove(canvas.getItemByName(element.name)));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        });
    }
    story();
});

socket.on('get canvas', function (obj) {
    canvas.loadFromJSON(obj.data);
    undo_history = obj.undo;
    redo_history = obj.redo;
    $('.patterns').css('background-image',`url(../assets/icons/${obj.pattern}.svg)`);
    $(".canvasPatterns button").removeClass('active');
    $(`.${obj.pattern}`).addClass('active');
    currentPattern = obj.pattern;
});

socket.on('get requester', requesterID => {
    let data = {
        data: JSON.stringify(canvas.toJSON(['name'])),
        undo: undo_history,
        redo: redo_history,
        pattern: currentPattern
    };
    socket.emit('send canvas', requesterID, data);
})

socket.on('get command', function (cmd) {
    let command = JSON.parse(cmd);
    if (command == "undo") {
        undo();
    } else if (command == "redo") {
        redo();
    } else if (command == "clear") {
        clearCanvas();
    } else if (command == "none") {
        setPattern(command);
    } else if (command == "sq") {
        setPattern(command);
    } else if (command == "line") {
        setPattern(command);
    } else if (command == "dot") {
        setPattern(command);
    } else if (command == "deleteDone") {
        story();
    } else {
        canvas.remove(canvas.getItemByName(command));
    }
});

// Dock panel
let menuToggle = false;

// $('.shapes').click(function(){
//     if (menuToggle === false) {
//         $(".addShapes").fadeIn(100);
//         setTimeout(() => {
//             menuToggle = true;
//         }, 200);
//     } else {
//         $(".addShapes").fadeOut(100);
//         setTimeout(() => {
//             menuToggle = false;
//         }, 200);
//     }
// });

// Brush color settings
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

// Brush size settings
$('.sizes').click(function(){
    if (menuToggle === false) {
        $(".brushSizes").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".brushSizes").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
$('.small').click(function(){
    $('.sizes').css('background-size','50%');
});
$('.middle').click(function(){
    $('.sizes').css('background-size','70%');
});
$('.big').click(function(){
    $('.sizes').css('background-size','110%');
});

// Canvas pattern settings
$('.patterns').click(function(){
    if (menuToggle === false) {
        $(".canvasPatterns").fadeIn(100);
        setTimeout(() => {
            menuToggle = true;
        }, 200);
    } else {
        $(".canvasPatterns").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});
let currentPattern = 'none';
function setPattern(name) {
    canvas.setBackgroundColor({source: `/assets/patterns/pattern_${name}.svg`, repeat: 'repeat'}, function () {
        canvas.requestRenderAll();
    });
    $('.patterns').css('background-image',`url(../assets/icons/${name}.svg)`);
    $(".canvasPatterns button").removeClass('active');
    $(`.${name}`).addClass('active');
    currentPattern = name;
};

$('body').click(function(){
    if (menuToggle === true) {
        // $(".addShape").fadeOut(100);
        $(".brushColors").fadeOut(100);
        $(".brushSizes").fadeOut(100);
        $(".canvasPatterns").fadeOut(100);
        setTimeout(() => {
            menuToggle = false;
        }, 200);
    }
});