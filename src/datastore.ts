import { Activity } from './models/activity.js';
import { Entity } from './models/entity.js';
import { Reaction } from './models/enums.js';


export interface DataStore {

  _entities: Map<string, Entity>;
  _activities: Map<string, Activity>;

  addActivities (activities: Activity[]);
  addEntities (entities: Entity[]);
  addReaction (activityId: string, reaction: Reaction);
}

