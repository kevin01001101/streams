import { Entity } from './models/entity.js';
import { Activity } from './models/activity.js';
import { Reaction } from './models/enums.js';

import { DataStore } from './dataStore.js';
import { ApiClient } from './apiClient.js';
import { ObjectFactory } from './factories.js';

import { EntityResponse, ActivityResponse } from './interfaces.js';

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
    activity.selectedReaction = reaction;
  }

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

  hasEntity = (entityId: string): boolean => {
    return this._entities.has(entityId);
  }
  getEntity = (entityId: string): Entity | undefined  => {
    return this._entities.get(entityId);
  }
  getEntityInfo = (entityId: string): EntityResponse | undefined => {
    return this._entityResponseMap.get(entityId);
  }


  loadActivities = async (options: any): Promise<Activity[]> => {

    // get activities
    // we'll probably have to fetch them from the server...

    let { activities: activities, entities: entities } = await this._apiClient.getActivities({});
    activities.forEach(ar => {
      this._activityResponseMap.set(ar.id, ar);
    });
    entities.forEach(er => {
      this._entityResponseMap.set(er.id, er);
    });

    let results = activities.map(a => this._factory.createActivity(a));
    return results.filter(r => { return r != undefined }) as Activity[];

    // let getActivitiesPromise = new Promise((resolve, reject) => {
    //   Promise.all([apiClient.getActivities({}), apiClient.getReactions()]).then(r => {
    //     console.log("RESULTS: ", r);
    //     let {activities, entities} = r[0];
    //     this.addActivities(activities);
    //     this.addEntities(entities);

    //     let c = r[1];  // reactions
    //   })
    //   .then(async () => {
    //     console.log("delay start");
    //     await delay(5000);
    //     console.log("delay end");
    //   })
    //   .then(() => {
    //     resolve([...this._activities.values()].map(a => {
    //       a.author = this._entities.get(a.authorId);
    //       a.replyObjs = a.replies?.map(r => this._activities.get(r)).filter(a => a != undefined) as Activity[];
    //       //a.content = editor.deserialize(a.content);
    //       return a;
    //     }));
    //   })
    //   .catch((reason) => {
    //     console.warn("Problem fetching values from the server: ", reason);
    //     reject(reason);
    //   });
    // });

    //new Promise((resolve, reject) => { })
    // return [...this._activities.values()].map(a => {
    //   a.author = this._entities.get(a.authorId);
    //   a.replies = a.replyIds.map(r => this._activities.get(r)).filter(a => a != undefined) as Activity[];
    //   //a.content = editor.deserialize(a.content);
    //   return a;
    // });

    console.log("END getActivities()");
    //return getActivitiesPromise;
  }

}