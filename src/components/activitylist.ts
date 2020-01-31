import { ActivityItem } from './activityItem.js';
import { Activity } from '../models/activity.js';
import { render } from 'lit-html';



const _activityItemTemplate = document.createElement('template');
_activityItemTemplate.innerHTML = `
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  <link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />
  <style type="text/css">
    ::shadow {
      margin-top:1rem;
    }
  </style>
`;
export class ActivityList extends HTMLElement {

  _activities: Activity[];


  constructor() {
    super();
    this._activities = [];
    this.attachShadow({mode:'open'});
  }

  connectedCallback() {
    let root = this.shadowRoot;
    this._activities.forEach(activity => {
      root?.appendChild(new ActivityItem());
    });
  }

  get activities() {
    return this._activities;
  }

  set activities(activities)
  {
    this._activities = activities;

    this.render();
  }


  render() {
    let root = this.shadowRoot;
    while (root?.hasChildNodes()) { root.lastChild?.remove(); }
    this._activities.forEach(activity => {
      root?.appendChild(new ActivityItem());
    });
  }

}