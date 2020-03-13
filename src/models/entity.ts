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
            email: entity.email
        } = entityData);
        entity.alias = (entityData.alias ? entityData.alias : entityData.email.substring(0,entityData.email.indexOf('@')));
        //Object.assign(entity, entityData);

        return entity;
    }
}

