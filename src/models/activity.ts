import { DateTime } from 'luxon';
import { Entity } from './entity';
import { Reaction } from './enums.js';


export interface ActivityApiResponse {
    id: string; // guid
    content: string;
    created: string;
    authorId: string;
    reactions: Map<Reaction,number>;
    restreamOf: string;
    replies: string[];
    parentId: string;
}

export class Activity {

    id: string;
    details: string;
    created: DateTime;
    authorId: number;
    reactions: Reaction[];
    replies: Activity[];
    parent?: Activity;

    constructor()
    {
        this.id = "";
        this.details = "";
        this.created = DateTime.local();
        this.authorId = -1;
        this.reactions = [];
        this.replies = [];
        this.parent = undefined;
    }
}