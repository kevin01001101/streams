import { StreamsApiClient } from './streamsApiClient.js';
import { StreamsDataStore } from './streamsDataStore.js';

import { Entity } from './models/entity.js';
import { Editor } from './components/editor.js';
import { ActivityInput } from './components/activityInput.js';
import { ActivityItem } from './components/activityItem.js';
import { Activity } from './models/activity.js';

import { Reaction } from './models/enums.js';

let StreamsData = new StreamsDataStore();
let StreamsClient = new StreamsApiClient("https://localhost:44387/");

const publishActivity = async (evt:Event) => {
    console.log("New event {0}", evt);
    let publishEvent = evt as CustomEvent;
    let restreamOf = ((evt.target as ActivityInput).embedded as ActivityItem)?.activityId ?? undefined;

    // may throw errors
    const locationUri = await StreamsClient.saveActivity(publishEvent.detail.content, restreamOf, publishEvent.detail.replyTo);

    (evt.target as ActivityInput).reset();

    const newActivityId = locationUri.substring(locationUri.lastIndexOf('/')+1);
    const newActivity = await StreamsClient.getActivity(newActivityId);

    let activityListElem = document.getElementById('activityList');
    activityListElem?.prepend(ActivityItem.Create(newActivity));

}

//                 .then((data: ActivityResponse) => {

//                     // if this is a REPLY-TO, then we don't add it to the activities list....
//                     //  it would either be added to the ActivityItem or to

//                     console.log(JSON.stringify(data));
//                     let editor = new Editor();

//                     let activityListElem = document.getElementById('activityList');
//                     activityListElem?.prepend(...data.activities.map(a => {
//                         let item = new ActivityItem();
//                         item.authorId = a.authorId;
//                         item.authorName = _people.get(a.authorId)?.displayName ?? "";
//                         item.content = editor.Deserialize(JSON.parse(a.content));
//                         item.timestamp = DateTime.fromISO(a.created as string);
//                         item.reactions = a.reactions;
//                         return item;
//                     }));
//                 })
//             }
//         }
//     })
// }

const reactionChanged = (evt:Event) =>{
    console.log("Reaction has been updated...");
    // should pass the old value and the new value
    let newReaction = (evt as CustomEvent).detail.currentReaction;
    let prevReaction = (evt as CustomEvent).detail.previousReaction;
    let activityElem = <ActivityItem>evt.target;

    if (newReaction != undefined) {

        fetch('https://localhost:44387/api/reactions', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Expose-Headers': 'Location'
            },
            body: JSON.stringify({
                activityId: (evt.target as ActivityItem).activityId,
                type: newReaction
            })
        })
        .then((response) => {
            console.log("POST REACTION:");
            console.log(response.ok);
            console.log(response.status);
        })
        .catch((reason) => {
            // undo the reaction change, since it didn't stick.
            activityElem.undoReactionChange(reason);
        });
    }
}

const restreamActivity = (evt:Event) => {
    console.log("set the activity input box with the activity item ", (evt as CustomEvent).detail);
    let activityInput = <ActivityInput>document.getElementsByTagName('activity-input')[0];

    // idea:
    //  get the activity id, get the activity data, build new activityitem from that

    // really better off to create a new Activity-Input element with values than cloning an existing node
    let sourceActivity = evt.target as ActivityItem;
    let clonedActivity = <ActivityItem>sourceActivity.cloneNode(false);
    clonedActivity.isReplying = false;
    clonedActivity.content = sourceActivity.content;
    clonedActivity.hideControls = true;
    activityInput.embedded = clonedActivity;
    console.log("set embedded property");
}

const commentOnActivity = (evt: Event) => {
    console.log(evt);
    console.log("evt.target that's the button....");
    (evt.target as HTMLElement).append(new ActivityInput());
}

const shareActivity = (evt: Event) => {
    // generate mailto link and 'click' it.

}


const updateActivityList = () => {

    let activityListElem = document.getElementById('activityList');
    StreamsData.activities.forEach(a => {
        if (a.parent == undefined) return;
        let activityItem =ActivityItem.Create(a);
        activityListElem?.append(activityItem);
    });

        //         //  then display those items in the display area
        // //let activityListElem = document.getElementById('activityList');
        // activities.forEach(a => {
        //     if (a.parentId) { return; }
        //     let item = new ActivityItem();
        //     item.activityId = a.id;
        //     item.authorId = a.authorId;
        //     item.authorName = _people.get(a.authorId)?.displayName ?? "";
        //     item.content = editor.Deserialize(JSON.parse(a.content));
        //     item.timestamp = DateTime.fromISO(a.created);
        //     item.reactions = a.reactions;
        //     item.replies = a.replies.map(rId => { return new ActivityItem() });
        //     //_activities.get(rId) });

        //     if (a.restreamOf) {
        //         let restreamData = _activities.get(a.restreamOf);
        //         if (restreamData != undefined) {
        //             let restream = new ActivityItem();
        //             restream.activityId = restreamData.id;
        //             restream.authorId = restreamData.authorId;
        //             restream.authorName = restream.authorId ? _people.get(restream.authorId)?.displayName ?? "" : "";
        //             restream.content = editor.Deserialize(JSON.parse(restreamData.content));
        //             restream.timestamp = DateTime.fromISO(restreamData.created);
        //             restream.reactions = restreamData.reactions;
        //             restream.hideControls = true;
        //             item.restreamedActivity = restream;
        //         }
        //     }

        // });
        //activityListElem.activities = data.activities;
    // });
}

window.addEventListener('DOMContentLoaded', async () => {
    console.log("document loaded.");

    // render the new activity control (text editor w/ buttons)
    window.customElements.define('activity-input', ActivityInput);
    window.customElements.define('activity-item', ActivityItem);
    //window.customElements.define('activity-list', ActivityList);

    let activityInputElem = document.querySelector('activity-input');
    activityInputElem?.addEventListener('publishActivity', publishActivity);

    let activityListElem = document.getElementById('activityList');
    activityListElem?.addEventListener('restreamActivity', restreamActivity);
    activityListElem?.addEventListener('replyToActivity', publishActivity);
    activityListElem?.addEventListener('reactionChange', reactionChanged);
    activityListElem?.addEventListener('share', shareActivity);

    StreamsData.activities = (await StreamsClient.getActivities({})).reduce((map, activity) => {
        return map.set(activity.id, activity);
    }, new Map<string, Activity>());

    // I think this needs to just be Editor.Deserialize() instead of instantiation of a new editor..
    let editor = new Editor();

    updateActivityList();


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