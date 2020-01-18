import { Entity } from './models/entity.js';
import { render } from 'lit-html';
import { ActivityEditor } from './components/activityEditor.js';
import { ActivityInput } from './components/activityInput.js';





window.addEventListener('DOMContentLoaded', () => {
    console.log("document loaded.");

    // render the new activity control (text editor w/ buttons)
    window.customElements.define('activity-input', ActivityInput);

    let editor = new ActivityEditor(document.getElementById('activityEditor'));


    // fetch the items from the current feed
    //  then display those items in the display area

    let outputElem = document.getElementById('output');
    let entity = new Entity({displayName: "My Name"});
    if (outputElem) {
        render(entity.BuildTemplate(), outputElem);        
    }
    console.log("done...");
});