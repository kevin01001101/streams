import { Activity } from './models/activity.js';
import { Entity } from './models/entity.js';
import { ReactionType } from './models/enums.js';
import { ActivityResponse, EntityResponse, ActivityRequest, ReactionRequest } from './interfaces.js';
import { Reaction } from './models/reaction.js';


export interface DataStore {

  _entities: Map<string, Entity>;
  _activities: Map<string, Activity>;


  //getActivities(): Activity[];
  // queryActivities(filter: string): Activity[];

  saveActivity(request: ActivityRequest): Promise<Activity>;
  saveReaction(request: ReactionRequest): Promise<boolean>;

  // addEntities (entities: Entity[]);
  // addReaction (activityId: string, reaction: Reaction);

  hasActivity(id: string): boolean;
  getActivity(id: string): Activity | undefined;

  hasEntity(id: string): boolean;
  getEntity(id: string): Entity | undefined;

  getActivityInfo(id: string): ActivityResponse | undefined;
  getEntityInfo(id: string): EntityResponse | undefined;

  updateActivity(activity: Activity): void;
  updateEntity(entity: Entity): void;

  loadActivities(options: any):Promise<Activity[]>;
  loadReactions(options: any):Promise<Reaction[]>;
}

