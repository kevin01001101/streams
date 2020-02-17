import { DataStore } from './datastore.js';
import { Entity } from './models/entity.js';
import { Activity } from './models/activity.js';

export class StreamsDataStore implements DataStore {

  entities:Map<string, Entity> = new Map<string, Entity>();
  activities:Map<string, Activity> = new Map<string, Activity>();

  constructor() {

  }

  addActivities = (activities: Activity[]) => {
    activities.forEach(a => {
      this.activities.set(a.id, a);
    });
  }

  addEntities = (entities: Entity[]) => {
    entities.forEach(e => {
      this.entities.set(e.id, e);
    });
  }


}