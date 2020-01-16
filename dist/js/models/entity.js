export class Entity {
    constructor(data = { displayName: "" }) {
        this.displayName = data.displayName;
    }
    Render() {
        return `<div>${this.displayName}</div>`;
    }
}
