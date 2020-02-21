import { render, html, TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { unsafeHTML } from "lit-html/directives/unsafe-html";

import { Activity } from "../models/activity";
import { Entity } from "../models/entity";



export class ActivityList extends HTMLElement {

  _activities: Activity[] = [];
  get activities() {
    return this._activities;
  }
  set activities(newValue) {
    this._activities = newValue;
    this._update();
  }
  //Activity[] = [];
  entities: Entity[] = [];

  _template(): TemplateResult {
    return html`
      <div>
          ${repeat(this.activities, (i) => i.id, (i, index) => html`
          <activity-item .activity=${i} activity-id=${i.id} author-id=${i.author?.id} author-name=${i.author?.displayName}
            author-email=${i.author?.email} author-alias=${i.author?.alias} timestamp=${i.created} }
            .reactions=${i.reactionTotals} .replies=${i.replies}>
          <span slot="content">${unsafeHTML(i.content)}</span>
         </activity-item>`)
        }
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
    console.log("ActivityList render() ");
    render(this._template(), this);
  }



}