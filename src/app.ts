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
    entities: Entity[];
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
            contentHtml: publishEvent.detail.contentHtml
        };

        fetch('https://localhost:44387/api/activities', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Expose-Headers': 'Location'
            },
            body: JSON.stringify(newActivity)
        })
        .then((response) => {
            console.log(response.ok);
            console.log(response.status);
            // if response is good, then fetch the newly created entry and add it to our list
            if (response.status == 201) {
                let newActivityUri = response.headers.get("Location");
                if (newActivityUri != null) {
                    fetch(newActivityUri, {
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

                        let activityListElem = document.getElementById('activityList');
                        activityListElem?.prepend(...data.activities.map(a => {
                            let item = new ActivityItem();
                            item.authorId = a.authorId;
                            item.authorName = _people.get(a.authorId)?.displayName ?? "";
                            item.content = htmlUnescape(a.htmlContent);
                            item.timestamp = DateTime.fromISO(a.created as string);
                            item.reactions = a.reactions;
                            return item;
                        }));
                    })
                }
            }
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

        data.entities.forEach(p => {
            _people.set(p.id, p);
        });
        //  then display those items in the display area
        let activityListElem = document.getElementById('activityList');
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