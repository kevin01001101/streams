import { Entity } from './models/entity.js';
import { render } from 'lit-html';
import { ActivityInput } from './components/activityInput.js';

window.addEventListener('DOMContentLoaded', () => {
    console.log("document loaded.");

    window.customElements.define('activity-input', ActivityInput);

    // render the new activity control (text editor w/ buttons)
    // fetch the items from the current feed
    //  then display those items in the display area

    let outputElem = document.getElementById('output');
    let entity = new Entity({displayName: "My Name"});
    if (outputElem) {
        render(entity.BuildTemplate(), outputElem);        
    }
    console.log("done...");
});