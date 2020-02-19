import { DataStore } from './dataStore.js';
import { Entity } from './models/entity.js';
import { Activity } from './models/activity.js';
import { Reaction } from './models/enums.js';

export class StreamsDataStore implements DataStore {

  _entities: Map<string, Entity>;
  _activities: Map<string, Activity>;

  constructor() {
    this._entities = new Map<string, Entity>();
    this._activities = new Map<string, Activity>();
  }

  addActivities = (activities: Activity[]) => {
    activities.forEach(a => {
      this._activities.set(a.id, a);
    });
  }

  addEntities = (entities: Entity[]) => {
    entities.forEach(e => {
      this._entities.set(e.id, e);
    });
  }

  addReaction = (activityId: string, reaction: Reaction) => {
    let activity = this._activities.get(activityId);
    if (activity == undefined) { return; }
    activity.myReaction = reaction;
  }

  get activities() {

    // but do need to hydrate the activities with the entities?
    return [...this._activities.values()];
  }
}