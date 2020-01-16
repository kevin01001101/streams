interface EntityResponse {
    displayName: string;
}

export class Entity {

    displayName: string;

    constructor(data: EntityResponse = { displayName: "" }) {
        this.displayName = data.displayName;

    }

    Render() {
        return `<div>${this.displayName}</div>`;
    }


}

