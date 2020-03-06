import { Entity } from './models/entity.js';
import { Activity } from './models/activity.js';
import { ReactionType } from './models/enums.js';

import { DataStore } from './dataStore.js';
import { ApiClient } from './apiClient.js';
import { ObjectFactory } from './factories.js';

import { EntityResponse, ActivityResponse, ActivityRequest, ReactionRequest } from './interfaces.js';
import { Reaction } from './models/reaction.js';

const delay = ms => new Promise(res => setTimeout(res, ms));

export class StreamsDataStore implements DataStore {

  _apiClient: ApiClient;
  _factory: ObjectFactory;
  _entities: Map<string, Entity>;
  _activities: Map<string, Activity>;
  _activityResponseMap: Map<string, ActivityResponse>;
  _entityResponseMap: Map<string, EntityResponse>

  constructor(apiClient: ApiClient) {
    this._apiClient = apiClient;
    this._entities = new Map<string, Entity>();
    this._activities = new Map<string, Activity>();
    this._activityResponseMap = new Map<string, ActivityResponse>();
    this._entityResponseMap = new Map<string, EntityResponse>();
    this._factory = new ObjectFactory(this);
  }

  async saveActivity(request: ActivityRequest): Promise<Activity> {

    // REFACTOR opportnity - change /api/activities back and add a lookup for the author entity
    //  if it's not already available in the store... (or maybe even if it is?)
    // we have to ensure that we have the record for the author....

    let { activities: activities, entities: entities } = await this._apiClient.saveActivity(request);

    activities.forEach(ar => {
      this._activityResponseMap.set(ar.id, ar);
    });
    entities.forEach(er => {
      this._entityResponseMap.set(er.id, er);
    });

    let activity = this._factory.createActivity(activities[0]);
    if (activity == undefined) { throw Error ('failed to get activity on save()'); }

    return activity;
  }

  async saveReaction(request: ReactionRequest): Promise<boolean> {
    return await this._apiClient.saveReaction(request);
  }

  // addActivities = (activities: Activity[]) => {
  //   activities.forEach(a => {
  //     this._activities.set(a.id, a);
  //   });
  // }

  // addEntities = (entities: Entity[]) => {
  //   entities.forEach(e => {
  //     this._entities.set(e.id, e);
  //   });
  // }

  // addReaction = (activityId: string, reaction: Reaction) => {
  //   let activity = this._activities.get(activityId);
  //   if (activity == undefined) { return; }
  //   activity.selectedReaction = reaction;
  // }

  get activities() {

    // but do need to hydrate the activities with the entities?
    return [...this._activities.values()];
  }


  hasActivity = (activityId: string): boolean => {
    return this._activities.has(activityId);
  }
  getActivity = (activityId: string): Activity | undefined => {
    return this._activities.get(activityId);
  }
  getActivityInfo = (activityId: string): ActivityResponse | undefined => {
    return this._activityResponseMap.get(activityId);
  }
  updateActivity = (activity: Activity) => {
    this._activities.set(activity.id, activity);
  }

  hasEntity = (entityId: string): boolean => {
    return this._entities.has(entityId);
  }
  getEntity = (entityId: string): Entity | undefined  => {
    return this._entities.get(entityId);
  }
  getEntityInfo = (entityId: string): EntityResponse | undefined => {
    return this._entityResponseMap.get(entityId);
  }
  updateEntity = (entity: Entity) => {
    this._entities.set(entity.id, entity);
  }

  loadActivities = async (options: any): Promise<Activity[]> => {

    // get activities
    // we'll probably have to fetch them from the server...

    let { activities: activities, entities: entities } = await this._apiClient.getActivities(options);
    activities.forEach(ar => {
      this._activityResponseMap.set(ar.id, ar);
    });
    entities.forEach(er => {
      this._entityResponseMap.set(er.id, er);
    });

    let results = activities.map(a => this._factory.createActivity(a));
    return results.filter(r => { return r != undefined }) as Activity[];
  }

  loadReactions = async (options: any): Promise<Reaction[]> => {
    let reactions = await this._apiClient.getSelectedReactions({});
    return reactions.map(r => r as Reaction);
  }

}