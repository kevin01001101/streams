import { DataStore } from "../dataStore";
import { ApiClient } from "../apiClient";
import { Activity } from "../models/activity";
import { ActivityInput } from "../components/activityInput";
import { ActivityItem } from "../components/activityItem";
import { Entity } from "../models/entity";
import { Editor } from "../components/editor";

import { html, render, TemplateResult } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { ActivityList } from "../components/activityList";

export class ActivityListPage {

  private static _instance: ActivityListPage;
  private _store: DataStore;
  private _root: HTMLElement;
  private _activities: Activity[] = [];


  _template(): TemplateResult {
    return html`
      <div id="grid" @click=${this.routeClick}>
        <div class="leftNav">
            <heading>
                <h1>STREAMS</h1>
            </heading>
            <div>
                <a href="/somewhere">About</a>
                <h3>@ - Connect</h3>
                <h3># - Discover</h3>
                <h3>P - Me</h3>
                <h3>S - Search</h3>
                <h3>L - Lists</h3>
                <h3>G - Settings</h3>
            </div>
        </div>

        <div class="main">
            <activity-input @publishActivity=${this.publishActivity}></activity-input>
            <h2 style="background-color:lightblue; padding:0.4rem; margin-top:1rem;">Now Showing: <span>Your Feed</span></h2>
            <activity-list class="scrollable" .activities=${this._activities}></activity-list>
        </div>

        <div class="infoCol">
            <form>
                <input class="form-control" type="text" id="searchInput" />
            </form>
        </div>
      </div>`
  };

  private constructor(rootElem, store) {
    this._root = rootElem;
    this._store = store;
  }

  public static async render(container: HTMLElement, store: DataStore) {
    if (this._instance == undefined) {
      this._instance = new this(container, store);
    }

    // turn this to a promise?  then show a loading status message while it's not resolved...
    this._instance._activities = await this._instance._store.loadActivities({});


    //await this._instance.store.getReactions();

    // this._instance.store.addActivities(activities.map(a => Activity.create(a)));
    // this._instance.store.addEntities(entities.map(e => Entity.create(e)));

    // const reactions = await this._instance.client.getReactions();
    // reactions.forEach(r => {
    //   this._instance.store.addReaction(r.activityId, r.type);
    // });

    this._instance._update();
    //return this._instance;
  }

  // public static render(container: HTMLElement, options: any) {
  //   if (this._instance == undefined) { this._instance = new this(container, undefined, undefined); }
  //   // if activities promise has resovled, then set and render..
  //   // if activities promise is not resovled yet, then set loading and render..
  //   console.log("Options for ActivityListPage render() ", options);
  //   (options.activities as Promise<any>).then((val) => {
  //     console.log("Promise has returned: ", val);
  //     this._instance._activityList = val;
  //     this._instance._update();
  //     //let list = this._instance._root.querySelector('activity-list');
  //     //(list as ActivityList).activities = val;

  //   });
  //   console.log("outside of the promise, inside ActivityListPage.render()");
  //   //this._instance._activityList = options.activities;

  //   this._instance._update();
  // }

  _update = () => {
    render(this._template(), this._root);
  }

  // private getActivities() {
  //   let activities = this._store._activities;
  //   let editor = new Editor();

  //   return [...activities.values()].map(a => {
  //     a.author = this._store._entities.get(a.authorId);
  //     a.content = editor.deserialize(a.content);
  //     return a;
  //   });

  //   //return activities;
  // }

  private setupEventHandlers = async () => {

    //this._root.querySelector('activity-input');

    // let activityInputElem = this._root.querySelector('activity-input');
    // activityInputElem?.addEventListener('publishActivity', this.publishActivity);

    // let activityListElem = document.getElementById('activityList');
    // activityListElem?.addEventListener('restreamActivity', this.restreamActivity);
    // activityListElem?.addEventListener('publishActivity', this.publishActivity);
    // activityListElem?.addEventListener('reactionChange', this.updateReaction);
    // activityListElem?.addEventListener('share', this.shareActivity);


    // const { activities, entities } = await this._apiClient.getActivities({});
    // this._dataStore.addActivities(activities.map(a => Activity.create(a)));
    // this._dataStore.addEntities(entities.map(e => Entity.create(e)));

    // const reactions = await this._apiClient.getReactions();
    // reactions.forEach(r => {
    //   this._dataStore.addReaction(r.activityId, r.type);
    // });

    //this._root.addEventListener('click', this.routeClick);
    // this._root.querySelectorAll('a').forEach(a => {
    //   a.addEventListener('click', this.routeClick);
    // });

  }

  private publishActivity = async (evt: Event) => {
    //    console.log("New event {0}", evt);
    // let publishEvent = evt as CustomEvent;

    // let restreamId = ((evt.target as ActivityInput).embedded as ActivityItem)?.activityId ?? undefined;

    // // may throw errors
    // const locationUri = await this.client.saveActivity(publishEvent.detail.content, restreamId, publishEvent.detail.replyTo);


    // (publishEvent.detail.inputElem as ActivityInput).reset();

    // const newActivityId = locationUri.substring(locationUri.lastIndexOf('/') + 1);
    // const newActivityResp = await this.client.getActivity(newActivityId);
    // let newActivity = Activity.create(newActivityResp)
    // this.store.addActivities([newActivity]);

    // // we have to ensure that we have the record for the author....
    // if (!this.store._entities.has(newActivity.authorId)) {
    //   const newEntityResp = await this.client.getEntity(newActivity.authorId);
    //   this.store.addEntities([Entity.create(newEntityResp)]);
    // }

    // let activityListElem = document.getElementById('activityList');
    // let activityItem = ActivityItem.create(this.store._activities.get(newActivity.id), this.store._entities.get(newActivity.authorId));

    // let editor = new Editor();
    // activityItem.content = editor.deserialize(activityItem.content);

    // // what if we're adding a new comment?  we need to set it up here...

    // activityListElem?.prepend(activityItem);
  }


  private updateReaction = async (evt: Event) => {
    console.log("Reaction has been updated...");

    // should pass the old value and the new value
    let newReaction = (evt as CustomEvent).detail.newReaction;
    let prevReaction = (evt as CustomEvent).detail.previousReaction;
    let activityElem = <ActivityItem>evt.target;

    if (activityElem.activityId == null) {
      return console.warn("failed to retrieve ActivityId from activity-item element.");
    }

    // FIX
    // let success = await this.client.updateReaction(activityElem.activityId, newReaction);
    // if (!success) {
    //   activityElem.undoReactionChange("API call failed to update reaction");
    // }

  }

  private restreamActivity = (evt: Event) => {
    const restreamEvent = evt as CustomEvent;
    console.log("set the activity input box with the activity item ", restreamEvent.detail);

    // grab the first activity input element on the page (should update to an ID?)
    let activityInput = <ActivityInput>document.getElementsByTagName('activity-input')[0];

    // idea:
    //  get the activity id, get the activity data, build new activityitem from that
    // better to create a new Activity-Input element with values than cloning an existing node ??
    let sourceActivity = restreamEvent.detail.activityElem as ActivityItem;
    let clonedActivity = <ActivityItem>sourceActivity.cloneNode(false);
    clonedActivity.isReplying = false;
    clonedActivity.content = sourceActivity.content;
    clonedActivity.hideControls = true;
    activityInput.embedded = clonedActivity;
    console.log("set embedded property");
  }

  private commentOnActivity = (evt: Event) => {
    console.log(evt);
    console.log("evt.target that's the button....");
    (evt.target as HTMLElement).append(new ActivityInput());
  }

  private shareActivity = (evt: Event) => {
    // generate mailto link and 'click' it.

  }


  private updateActivityList = () => {

    // let editor = new Editor();
    // this._activityList = this._activityList.map(a => {
    //   a.content = editor.deserialize(a.content);
    //   return a;
    // });

    // let activityListElem = document.getElementById('activityList');
    // this._dataStore._activities.forEach(a => {
    //   if (a.parentId != undefined) return;
    //   let activityItem = ActivityItem.create(a, this._dataStore._entities.get(a.authorId));
    //   activityItem.content = editor.deserialize(activityItem.content);
    //   if (a.restream) {
    //     let restreamedActivity = this._dataStore._activities.get(a.restream)!;
    //     if (!restreamedActivity) { throw Error("activity not found in datastore: " + a.restream); }
    //     activityItem.restreamedActivity = ActivityItem.create(restreamedActivity, this._dataStore._entities.get(restreamedActivity?.authorId));
    //     activityItem.restreamedActivity.content = editor.deserialize(activityItem.restreamedActivity.content);
    //     activityItem.restreamedActivity.hideControls = true;
    //   }
    //   activityItem.replies = a.replies.map(r => {
    //     let replyActivity = this._dataStore._activities.get(r);
    //     if (!replyActivity) { throw Error("activity not found in datastore: " + r); }
    //     let aItem = ActivityItem.create(replyActivity, this._dataStore._entities.get(replyActivity?.authorId));
    //     aItem.content = editor.deserialize(aItem.content);
    //     return aItem;
    //   });
    //   activityListElem?.append(activityItem);
    // });
  }


  routeClick = (evt) => {
    let routePath = "";
    const target = evt.target as HTMLElement;
    switch (target.tagName) {
      case "A":
        routePath = (target as HTMLAnchorElement).href;
        evt.preventDefault();
        break;
      case "ACTIVITY-ITEM":
        const originalTarget = evt.originalTarget;
        if (originalTarget.tagName != 'SPAN') return;

        if (originalTarget.classList.contains('prosemirror-mention-node')) {
          routePath = '/e/' + originalTarget.getAttribute('data-mention-email');
        }

        if (originalTarget.classList.contains('prosemirror-tag-node')) {
          routePath = '/t/' + originalTarget.getAttribute('data-tag');
        }
        break;
      default:
        return;
    }

    document.dispatchEvent(new CustomEvent('route', {
      bubbles: true,
      detail: {
        path: routePath
      }
    }));
    return false;
  }

}