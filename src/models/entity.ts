import { EntityResponse } from '../interfaces.js';


export class Entity {
    id: string = "";
    displayName: string | undefined;
    email: string | undefined;
    alias: string | undefined;

    constructor() {

    }

    static create(entityData: EntityResponse) {
        let entity = new Entity();
        ({
            id: entity.id,
            displayName: entity.displayName,
            email: entity.email,
            alias: entity.alias
        } = entityData);
        Object.assign(entity, entityData);

        return entity;
    }
}

