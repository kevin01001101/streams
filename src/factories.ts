import { DataStore } from "./dataStore";
import { Activity } from "./models/activity";
import { Entity } from "./models/entity";
import { ActivityResponse, EntityResponse } from "./interfaces";

export class ObjectFactory {

  _store: DataStore;

  constructor(store: DataStore) {
    this._store = store;
  }


  createActivity = (activityData: ActivityResponse | undefined): Activity | undefined => {
    if (activityData == undefined) return undefined;

    let newActivity = Activity.create(activityData);
    let store = this._store;
    newActivity.author = store.hasEntity(activityData.authorId) ? store.getEntity(activityData.authorId)! : this.createEntity(store.getEntityInfo(activityData.authorId));
    newActivity.restream = store.hasActivity(activityData.restreamId) ? store.getActivity(activityData.restreamId) : this.createActivity(store.getActivityInfo(activityData.restreamId));
    newActivity.parent = store.hasActivity(activityData.restreamId) ? store.getActivity(activityData.restreamId) : this.createActivity(store.getActivityInfo(activityData.restreamId));
    newActivity.replies = activityData.replyIds.map(r => {
      return store.hasActivity(r) ? store.getActivity(r) : this.createActivity(store.getActivityInfo(r));
    }).filter(r => r != undefined) as Activity[];

    return newActivity;
  }

  createEntity = (entityInfo: EntityResponse | undefined): Entity | undefined => {
    if (entityInfo == undefined) return undefined;

    let newEntity = Entity.create(entityInfo);
    return newEntity;
  }
}

