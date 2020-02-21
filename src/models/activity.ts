import { DateTime } from 'luxon';
import { Reaction } from './enums.js';
//import { ActivityResponse } from '../interfaces';
import { Entity } from './entity.js';
import { Editor } from '../components/editor.js';

interface ActivityInfo {
    id: string;
    content: string;
    created: string;
    authorId: string;
    reactions?: any;
    restreamId?: string;
    replyIds?: string[];
    parentId?: string;
}

export class Activity {

    static editor: Editor = new Editor();

    id: string = "";
    content: string = "";
    created: DateTime | undefined;
    author: Entity | undefined;
    selectedReaction: Reaction | undefined;
    reactionTotals: Map<Reaction,number> = new Map<Reaction,number>();
    restream?: Activity;
    replies: Activity[] = [];
    parent?: Activity;

    static create(dataObj: ActivityInfo) {
        if (dataObj.authorId == undefined) { throw Error("activity must have a valid author"); }

        let activity = new Activity();
        activity.id = dataObj.id;
        dataObj.reactions?.forEach(r => activity.reactionTotals.set(r.type, r.count));
        activity.content = Activity.editor.deserialize(JSON.parse(dataObj.content));
        activity.created = DateTime.fromISO(dataObj.created);
        return activity;
    }
}

    // explicit const {one,two} = dataObj
    // -- or --
    // Object.assign(this, dataObj);