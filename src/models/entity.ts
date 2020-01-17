import { html } from 'lit-html'

interface EntityResponse {
    displayName: string;
}

export class Entity {

    displayName: string;

    constructor(data: EntityResponse = { displayName: "" }) {
        this.displayName = data.displayName;

    }

    BuildTemplate() {
        return html`<div>${this.displayName}</div>`;
    }

}

