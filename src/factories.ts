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

    let store = this._store;
    let newActivity = store.getActivity(activityData.id);
    if (newActivity == undefined) {
      newActivity = Activity.create(activityData);
      store.updateActivity(newActivity);
    }

    newActivity.author = store.hasEntity(activityData.author.id) ? store.getEntity(activityData.author.id)! : this.createEntity(activityData.author);
    if (activityData.restreamOf) {
      newActivity.restream = store.hasActivity(activityData.restreamOf.id) ? store.getActivity(activityData.restreamOf.id) : this.createActivity(store.getActivityInfo(activityData.restreamOf.id));
    }
    if (activityData.replyTo) {
      newActivity.parent = store.hasActivity(activityData.replyTo.id) ? store.getActivity(activityData.replyTo.id) : this.createActivity(store.getActivityInfo(activityData.replyTo.id));
      if (newActivity.parent) { newActivity.parent?.replies.push(newActivity); store.updateActivity(newActivity.parent); }
    }
    // newActivity.replies = activityData.replyIds.map(r => {
    //   return store.hasActivity(r) ? store.getActivity(r) : this.createActivity(store.getActivityInfo(r));
    // }).filter(r => r != undefined) as Activity[];
    return newActivity;
  }

  createEntity = (entityInfo: EntityResponse | undefined): Entity | undefined => {
    if (entityInfo == undefined) return undefined;

    let newEntity = Entity.create(entityInfo);
    this._store.updateEntity(newEntity);
    return newEntity;
  }
}

