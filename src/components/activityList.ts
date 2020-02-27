import { render, html, TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { unsafeHTML } from "lit-html/directives/unsafe-html";

import { Activity } from "../models/activity";
import { Entity } from "../models/entity";
import { ActivityItem } from "../components/activityItem.js";
import { ReactionType } from "../models/enums";
import { Reaction } from "../models/reaction.js";



export class ActivityList extends HTMLElement {

  _activities: Activity[] = [];
  _reactions: Map<string, ReactionType> = new Map<string, ReactionType>();

  // get activities() {
  //   return this._activities;
  // }
  set activities(newValue) {
    this._activities = newValue;
    console.log("activities set in activityList ", this._activities);
    this._update();
  }

  // get reactions() {
  //   return [...this._reactions];
  // }
  set reactions(newReactions: Reaction[]) {
    newReactions.forEach(r => this._reactions.set(r.activityId, r.type));
    this._update();
  }

  _template(): TemplateResult {
    return html`
      <div>
        <div class="loadingMsg">Loading...</div>
          ${repeat(this._activities, (i) => i.id, (i, index) => {
            console.log("activityList template_repeat() ", this._reactions.get(i.id));
            return html`<activity-item .activity=${i} .reaction=${this._reactions.get(i.id)}></activity-item>`;
          })}
      </div>
    `;
  }

  constructor() {
    super();
    //this.attachShadow({mode:'open'});
    //Object.assign(this, activityData);


  }

  connectedCallback() {
    this._update();
  }

  _update() {
    console.log("ActivityList render() ", this.activities);
    render(this._template(), this);
  }

  static get observedAttributes() {
    return ['is-loading'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue == newValue) return;
    switch (name) {
    }
    this._update();
  }


}