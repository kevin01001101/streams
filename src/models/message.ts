import { DateTime } from "luxon";
import { Entity } from "./entity";
import { Rating } from "./rating";

export interface Message {
    id: string;
    details: string;
    created: DateTime;
    author: Entity;
    ratings: Rating[];
}