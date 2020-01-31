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

let _people: Map<string, Entity> = new Map<string, Entity>();


const publishActivity = (evt:Event) => {
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
                (evt.target as ActivityInput).reset();
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
}

const reactionChanged = (evt:Event) =>{
    console.log("Reaction has been updated...");
}

const replyToActivity = (evt:Event) => {

}

const commentOnActivity = (evt: Event) => {
    console.log(evt);
    console.log("evt.target that's the button....");
    (evt.target as HTMLElement).append(new ActivityInput());
}

const shareActivity = (evt: Event) => {
    // generate mailto link and 'click' it.

}

window.addEventListener('DOMContentLoaded', () => {
    console.log("document loaded.");

    // render the new activity control (text editor w/ buttons)
    window.customElements.define('activity-input', ActivityInput);
    window.customElements.define('activity-item', ActivityItem);
    window.customElements.define('activity-list', ActivityList);

    let activityInputElem = document.querySelector('activity-input');
    activityInputElem?.addEventListener('publish', publishActivity);

    let activityListElem = document.getElementById('activityList');
    activityListElem?.addEventListener('reaction', reactionChanged);
    activityListElem?.addEventListener('reply', replyToActivity);
    activityListElem?.addEventListener('comment', commentOnActivity);
    activityListElem?.addEventListener('share', shareActivity);

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
    })
    .catch((reason) => {
        console.log("Something went wrong with fetching the activities....");
    });

    // handle all anchor links with the router
    document.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', evt => {
            console.log("Event ", evt);
            const newRoute = (evt.target as HTMLAnchorElement).href;
            window.history.pushState(
                {},
                newRoute,
                newRoute
            );
            // render route content
            console.log("now rendering: ", window.location.pathname);

            //renderRoute(window.location.pathname);
            evt.preventDefault();
        })
    });
    console.log("done...");
});


window.onpopstate = () => {
    // set page
    console.log("POP ", window.location.pathname);
}

const renderRoute = (route) => {
    // starts with a @, standard feed filtered by @{entityName}
    if (route[0] == '@') {
        console.log("Mention feed");
    }
    else if (route[0] == '#') {
        console.log("Tag feed");
    }
    else {
        console.log("default feed");
    }
    // starts with a #, standard feed filtered by #{tag}
}

renderRoute(window.location.pathname);