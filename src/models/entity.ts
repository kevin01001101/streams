import { html } from 'lit-html'

interface EntityResponse {
    id: string;
    displayName: string;
}

export class Entity {
    id: string;
    displayName: string;

    constructor(data: EntityResponse = { id: "", displayName: "" }) {
        this.id = data.id;
        this.displayName = data.displayName;
    }

}

