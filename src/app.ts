import { Entity } from './models/entity.js';
import { render } from 'lit-html';
import { ActivityInput } from './components/activityInput.js';
import { ActivityItem } from './components/activityItem.js';
import { ActivityApiResponse } from './models/activity.js';
import { ActivityList } from './components/activityList.js';
import { DateTime } from 'luxon';
import { htmlEscape, htmlUnescape } from './utilities.js';


interface ActivityResponse {
    activities: ActivityApiResponse[];
    people: Entity[];
}


window.addEventListener('DOMContentLoaded', () => {
    console.log("document loaded.");
    let _people: Map<string, Entity> = new Map<string, Entity>();

    // render the new activity control (text editor w/ buttons)
    window.customElements.define('activity-input', ActivityInput);
    window.customElements.define('activity-item', ActivityItem);
    window.customElements.define('activity-list', ActivityList);


    document.querySelector('activity-input')?.addEventListener('publish', (evt) => {
        console.log("New event {0}", evt);
        let publishEvent = evt as CustomEvent;
        // publish the activity to the server
        let newActivity = {
            contentHtml: htmlEscape(publishEvent.detail.contentHtml),
            contentText: publishEvent.detail.contentText
        };

        fetch('https://localhost:44387/api/activities', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newActivity)
        })
        .then((response) => {
            console.log(response.ok);
            console.log(response.status);
        })
    });

    // fetch the items from the current feed
    fetch('https://localhost:44387/api/activities', {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
        return response.json();
    })
    .then((data: ActivityResponse) => {
        console.log(JSON.stringify(data));

        data.people.forEach(p => {
            _people.set(p.id, p);
        });
        //  then display those items in the display area
        let activityListElem = document.querySelector('#activityList');
        activityListElem?.append(...data.activities.map(a => {
            let item = new ActivityItem();
            item.authorId = a.authorId;
            item.authorName = _people.get(a.authorId)?.displayName ?? "";
            item.content = htmlUnescape(a.htmlContent);
            item.timestamp = DateTime.fromISO(a.created as string);
            item.reactions = a.reactions;
            return item;
        }));
        //activityListElem.activities = data.activities;
    });



    //(document.querySelector('activity-list') as ActivityList).activities = [testActivity, testActivity];
    console.log("done...");
});