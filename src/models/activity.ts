import { DateTime } from 'luxon';
import { Reaction } from './enums.js';
import { ActivityResponse } from '../interfaces';

export class Activity {

    id: string = "";
    content: string = "";
    created: DateTime | undefined;
    authorId: string = "";
    myReaction: Reaction | undefined;
    reactions: Map<Reaction,number> = new Map<Reaction,number>();
    restream: string | undefined;
    replies: string[] = [];
    parentId: string | undefined;

    constructor()
    {
        // ({
        //     id: this.id,
        //     content: this.details,
        //     created: this.created,
        //     authorId: this.authorId,
        //     reactions: this.reactions,
        //     replies: this.replies,
        //     parent: this.parent
        // } = dataObj);
    }

    static create(dataObj: ActivityResponse) {
        if (dataObj.authorId == undefined) { throw Error("activity must have a valid author"); }
        let activity = new Activity();
        ({
            id: activity.id,
            authorId: activity.authorId,
            restreamOf: activity.restream,
            replies: activity.replies,
            parentId: activity.parentId
        } = dataObj);
        dataObj.reactions?.forEach(r => {
            activity.reactions.set(r.type, r.count);
        });
        activity.content = JSON.parse(dataObj.content);
        activity.created = DateTime.fromISO(dataObj.created);
        return activity;
    }
}

    // explicit const {one,two} = dataObj
    // -- or --
    // Object.assign(this, dataObj);