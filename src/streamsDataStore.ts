import { Entity } from './models/entity.js';
import { Activity } from './models/activity.js';
import { Reaction } from './models/enums.js';
import { DataStore } from './dataStore.js';
import { StreamsApiClient } from './streamsApiClient.js';



const delay = ms => new Promise(res => setTimeout(res, ms));


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

  
  getActivities = (options: any) => {

    // get activities
    // we'll probably have to fetch them from the server...
    let apiClient = new StreamsApiClient("https://localhost:44387");

    let getActivitiesPromise = new Promise((resolve, reject) => {
      Promise.all([apiClient.getActivities({}), apiClient.getReactions()]).then(r => {      
        console.log("RESULTS: ", r);
        let {activities, entities} = r[0];
        this.addActivities(activities);
        this.addEntities(entities);
        
        let c = r[1];  // reactions
      })
      .then(async () => {
        console.log("delay start");
        await delay(5000);
        console.log("delay end");
      })
      .then(() => {
        resolve([...this._activities.values()].map(a => {
          a.author = this._entities.get(a.authorId);
          a.replyObjs = a.replies.map(r => this._activities.get(r)).filter(a => a != undefined) as Activity[];
          //a.content = editor.deserialize(a.content);
          return a;
        }));
      })
      .catch((reason) => {
        console.warn("Problem fetching values from the server: ", reason);
        reject(reason);
      });
    });

    //new Promise((resolve, reject) => { })
    // return [...this._activities.values()].map(a => {
    //   a.author = this._entities.get(a.authorId);
    //   a.replies = a.replyIds.map(r => this._activities.get(r)).filter(a => a != undefined) as Activity[];
    //   //a.content = editor.deserialize(a.content);
    //   return a;
    // });

    console.log("END getActivities()");
    return getActivitiesPromise;
  }

}