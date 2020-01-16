import { Entity } from "./models/entity";
window.addEventListener('DOMContentLoaded', () => {
    console.log("document loaded.");
    let outputElem = document.getElementById('output');
    let entity = new Entity();
    if (outputElem) {
        outputElem.innerHTML = entity.Render();
    }
});
