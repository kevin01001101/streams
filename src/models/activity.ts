import { DateTime } from 'luxon';
import { Entity } from './entity';
import { Message } from './message';
import { Rating } from './rating';

export class Activity implements Message {

    id: string;
    details: string;
    created: DateTime;
    author: Entity;
    ratings: Rating[];   
    replies: Activity[];
    parent?: Activity;

    constructor()
    {
        this.id = "";
        this.details = "";
        this.created = new DateTime();
        this.author = new Entity();
        this.ratings = [];
        this.replies = [];
        this.parent = undefined;
    }

    
}