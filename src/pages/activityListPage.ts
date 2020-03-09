import { DataStore } from "../dataStore";
import { Activity } from "../models/activity";
import { ActivityInput } from "../components/activityInput";
import { ActivityItem } from "../components/activityItem";

import { html, render, TemplateResult } from 'lit-html';
import { classMap } from "lit-html/directives/class-map";
import { ReactionType } from "../models/enums";
import { Reaction } from '../models/reaction.js';

export class ActivityListPage {

  private static _instance: ActivityListPage;
  private _store: DataStore;
  private _root: HTMLElement;
  private _activities: Activity[] = [];
  private _reactions: Reaction[] = [];
  private _isLoading: boolean = false;
  private _showing: string = "";

  get nowShowing(): string {
    return this._showing;
  }
  set nowShowing(newValue) {
    this._showing = newValue;
  }

  _template(): TemplateResult {
    return html`
    <style type="text/css">
      activity-list .loadingMsg {
        display:none;
      }
      activity-list.loading .loadingMsg {
        display:block;
      }

    </style>

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

        <div class="main" @publishActivity=${this.publishActivity}>
            <activity-input></activity-input>
            <h2 style="background-color:lightblue; padding:0.4rem; margin-top:1rem;">Now Showing: <span>${this._showing}</span></h2>
            <activity-list class="scrollable ${classMap({loading: this._isLoading})}"
                .activities=${this._activities}
                .reactions=${this._reactions}
                @restreamActivity=${this.restreamActivity}
                @reactionChange=${this.updateReaction}></activity-list>
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

  public static async initialize(container: HTMLElement, store: DataStore, options, activitiesFilter) {
    if (this._instance == undefined) {
      this._instance = new this(container, store);
    }

    this._instance._isLoading = true;
    this._instance._showing = options.showing;
    Promise.all([
      this._instance._store.loadActivities(options.dataQuery),
      this._instance._store.loadReactions(options.dataQuery)
    ]).then(([activities, reactions]) => {


      this._instance._activities = activitiesFilter(activities);
      this._instance._reactions = reactions;
      this._instance._isLoading = false;
      console.log("B", this._instance._isLoading);
      this._instance._update();
    });
    this._instance._update();
    return this._instance;
  }

  _update = () => {
    render(this._template(), this._root);
  }

  private publishActivity = async (evt: Event) => {

    console.log("New event {0}", evt);
    let publishEvent = evt as CustomEvent;
    let restreamId = ((evt.target as ActivityInput).embedded as ActivityItem)?.activityId ?? undefined;

    // may throw errors..
    let newActivity = await this._store.saveActivity({
      content: publishEvent.detail.content,
      restreamOf: restreamId,
      replyTo: publishEvent.detail.replyTo
    });

    //console.log("save activity to data store is complete... ", newActivity.parent?.replies.length);

    this._activities = [...this._store._activities.values()].filter(a => a.parent == undefined).sort((a,b) => {
      if (a.created < b.created) return 1;
      if (a.created < b.created) return -1;
      return 0;
    });

    //console.log("activities for ActivitiesList updated, update not yet called.");
    (publishEvent.detail.inputElem as ActivityInput).reset();
    this._update();
  }

  private updateReaction = async (evt: Event) => {
    console.log("Reaction has been updated...");

    // should pass the old value and the new value
    let newReaction = (evt as CustomEvent).detail.newReaction;
    let prevReaction = (evt as CustomEvent).detail.previousReaction;
    let activityElem = <ActivityItem>evt.target;

    if (activityElem.id == null) {
      return console.warn("failed to retrieve ActivityId from activity-item element.");
    }

    // FIX
    let success = await this._store.saveReaction({activityId: activityElem.activityId, type: newReaction});
    if (!success) {
      activityElem.undoReactionChange("API call failed to update reaction");
    }

  }

  private restreamActivity = (evt: Event) => {

    const restreamEvent = evt as CustomEvent;
    console.log("set the activity input box with the activity item ", restreamEvent.detail);

    // grab the first activity input element on the page (should update to an ID?)
    let activityInput = <ActivityInput>this._root.querySelector('div.main activity-input');

    // idea:
    //  get the activity id, get the activity data, build new activityitem from that
    // better to create a new Activity-Input element with values than cloning an existing node ??
    let sourceActivity = restreamEvent.detail.activityElem as ActivityItem;
    activityInput.embedded = (sourceActivity as ActivityItem).clone();
    console.log("set embedded property");
    evt.stopPropagation();
  }

  private shareActivity = (evt: Event) => {
    // generate mailto link and 'click' it.
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
        const originalTarget = evt.originalTarget as HTMLElement;
        if (originalTarget.tagName != 'SPAN') { return; }
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

    if (routePath.length == 0) return;

    document.dispatchEvent(new CustomEvent('route', {
      bubbles: true,
      detail: {
        path: routePath
      }
    }));
    return false;
  }

}