import { Activity } from './models/activity.js';
import { Entity } from './models/entity.js';


export interface DataStore {

  entities: Map<string, Entity>;
  activities: Map<string, Activity>;

}

