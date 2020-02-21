import { Activity } from './models/activity.js';
import { Entity } from './models/entity.js';
import { Reaction } from './models/enums.js';
import { ActivityResponse, EntityResponse } from './interfaces.js';


export interface DataStore {

  _entities: Map<string, Entity>;
  _activities: Map<string, Activity>;


  //getActivities(): Activity[];
  // queryActivities(filter: string): Activity[];

  addActivities (activities: Activity[]);
  addEntities (entities: Entity[]);
  addReaction (activityId: string, reaction: Reaction);

  hasActivity(id: string): boolean;
  getActivity(id: string): Activity | undefined;

  hasEntity(id: string): boolean;
  getEntity(id: string): Entity | undefined;

  getActivityInfo(id: string): ActivityResponse | undefined;
  getEntityInfo(id: string): EntityResponse | undefined;

  loadActivities(options: any):Promise<any>;
}

