// Story functions

// array.push(JSON.stringify(canvas.item(canvas.size() - 1).toJSON(['name'])));
// array.push(JSON.stringify(canvas.toJSON(['name'])));
// array.push(JSON.stringify(object.toJSON(['name'])));

let actions = [];
let objects = [];
let redo_actions = [];
let redo_objects = [];

function story(action, object) {
    actions.push(action);
    if (action == "group") {

    }
    objects.push(object);
}

function undo() {
    if (actions[actions.length - 1] == "added") {
        canvas.remove(canvas.getItemByName(JSON.parse(objects[objects.length - 1]).name));
        canvas.requestRenderAll();

        redo_actions.push(actions.pop());
        redo_objects.push(objects.pop());
    } else if (actions[actions.length - 1] == "modified") {
        redo_actions.push(actions.pop());
        redo_objects.push(objects.pop());

        let object = JSON.parse(objects[objects.length - 1]);
        canvas.remove(canvas.getItemByName(object.name));
        fabric.util.enlivenObjects([object], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.requestRenderAll();
        });
    } else if (!isNaN(actions[actions.length - 1])) {
        canvas.discardActiveObject();
        let i = true;
        let a = 0;
        while (!isNaN(actions[actions.length - 1]) && i) {
            let object = JSON.parse(objects[objects.length - 1]);
            canvas.remove(canvas.getItemByName(object.name));
            a++;
            canvas.requestRenderAll();
            if (actions[actions.length - 1] == 0) {
                i = false;
            }
            
            redo_actions.push(actions.pop());
            redo_objects.push(objects.pop());
        }
        while (a > 0) {
            object = JSON.parse(objects[objects.length - a]);
            fabric.util.enlivenObjects([object], function (enlivenedObjects) {
                canvas.add(enlivenedObjects[0]);
                a--;
            });
        }
    }
}

function redo() {
    if (redo_actions[redo_actions.length - 1] == "added") {
        let object = JSON.parse(redo_objects[redo_objects.length - 1]);
        canvas.remove(canvas.getItemByName(object.name));
        fabric.util.enlivenObjects([object], function (enlivenedObjects) {
            canvas.add(enlivenedObjects[0]);
            canvas.requestRenderAll();
        });

        actions.push(redo_actions.pop());
        objects.push(redo_objects.pop());
    } else if (redo_actions[redo_actions.length - 1] == "modified") {
        let object = JSON.parse(redo_objects[redo_objects.length - 1]);
        console.log(object);
        canvas.getItemByName(object.name).set(object);
        canvas.requestRenderAll();

        actions.push(redo_actions.pop());
        objects.push(redo_objects.pop());
    } else if (redo_actions[redo_actions.length - 1] == "group") {
        canvas.discardActiveObject();
        
        

        actions.push(redo_actions.pop());
        objects.push(redo_objects.pop());
    }
}

function clearRedo() {
    redo_actions.length = 0;
    redo_objects.length = 0;
}

function pushToStoryStack() {
    actions.push(redo_actions.pop());
    objects.push(redo_objects.pop());
}
function pushToRedoStoryStack() {
    redo_actions.push(actions.pop());
    redo_objects.push(objects.pop());
}