import { DataStore } from './datastore.js';
import { Entity } from './models/entity.js';
import { Activity } from './models/activity.js';

export class StreamsDataStore implements DataStore {

  people = new Map<string, Entity>();
  activities =  new Map<string, Activity>();

}