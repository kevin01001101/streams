import { DateTime } from 'luxon';
import { Entity } from './entity';
import { Reaction } from './enums.js';

export class Activity {

    id: string;
    details: string;
    created: DateTime;
    authorId: string;
    reactions: Reaction[];
    replies: Activity[];
    parent: Activity;

    constructor(dataObj)
    {
        ({
            id: this.id,
            details: this.details,
            created: this.created,
            authorId: this.authorId,
            reactions: this.reactions,
            replies: this.replies,
            parent: this.parent
        } = dataObj);

        // explicit const {one,two} = dataObj
        // Object.assign(this, dataObj);

        // this.id = dataObj.id;
        // this.details = dataObj.details;
        // this.created = dataObj.created || DateTime.local();
        // this.authorId = dataObj.authorId || -1;
        // this.reactions = [];
        // this.replies = [];
        // this.parent = dataObj.parentId;
    }
}