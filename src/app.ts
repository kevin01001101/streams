import { StreamsApiClient } from './streamsApiClient.js';
import { StreamsDataStore } from './streamsDataStore.js';

import { Entity } from './models/entity.js';
import { Editor } from './components/editor.js';
import { ActivityInput } from './components/activityInput.js';
import { ActivityItem } from './components/activityItem.js';
import { Activity } from './models/activity.js';

import { Reaction } from './models/enums.js';

let StreamsData = new StreamsDataStore();
let StreamsClient = new StreamsApiClient("https://localhost:44387");

const publishActivity = async (evt:Event) => {
//    console.log("New event {0}", evt);
    let publishEvent = evt as CustomEvent;

    let restreamOf = ((evt.target as ActivityInput).embedded as ActivityItem)?.activityId ?? undefined;

    // may throw errors
    const locationUri = await StreamsClient.saveActivity(publishEvent.detail.content, restreamOf, publishEvent.detail.replyTo);

    (publishEvent.detail.inputElem as ActivityInput).reset();

    const newActivityId = locationUri.substring(locationUri.lastIndexOf('/')+1);
    const newActivityResp = await StreamsClient.getActivity(newActivityId);
    let newActivity = Activity.create(newActivityResp)
    StreamsData.addActivities([newActivity]);

    // we have to ensure that we have the record for the author....
    if (!StreamsData.entities.has(newActivity.authorId)) {
        const newEntityResp = await StreamsClient.getEntity(newActivity.authorId);
        StreamsData.addEntities([Entity.create(newEntityResp)]);
    }

    let activityListElem = document.getElementById('activityList');
    let activityItem = ActivityItem.create(StreamsData.activities.get(newActivity.id), StreamsData.entities.get(newActivity.authorId));

    let editor = new Editor();
    activityItem.content = editor.deserialize(activityItem.content);

    // what if we're adding a new comment?  we need to set it up here...

    activityListElem?.prepend(activityItem);
}


const updateReaction = async (evt:Event) =>{
    console.log("Reaction has been updated...");

    // should pass the old value and the new value
    let newReaction = (evt as CustomEvent).detail.newReaction;
    let prevReaction = (evt as CustomEvent).detail.previousReaction;
    let activityElem = <ActivityItem>evt.target;

    if (activityElem.activityId == null) {
        return console.warn("failed to retrieve ActivityId from activity-item element.");
    }

    let success = await StreamsClient.updateReaction(activityElem.activityId, newReaction);
    if (!success) {
        activityElem.undoReactionChange("API call failed to update reaction");
    }
}

const restreamActivity = (evt:Event) => {
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

const commentOnActivity = (evt: Event) => {
    console.log(evt);
    console.log("evt.target that's the button....");
    (evt.target as HTMLElement).append(new ActivityInput());
}

const shareActivity = (evt: Event) => {
    // generate mailto link and 'click' it.

}


const updateActivityList = () => {

    let editor = new Editor();
    let activityListElem = document.getElementById('activityList');
    StreamsData.activities.forEach(a => {
        if (a.parentId != undefined) return;
        let activityItem = ActivityItem.create(a, StreamsData.entities.get(a.authorId));
        activityItem.content = editor.deserialize(activityItem.content);
        if (a.restream) {
            let restreamedActivity = StreamsData.activities.get(a.restream)!;
            if (!restreamedActivity) { throw Error("activity not found in datastore: " + a.restream); }
            activityItem.restreamedActivity = ActivityItem.create(restreamedActivity, StreamsData.entities.get(restreamedActivity?.authorId));
            activityItem.restreamedActivity.content = editor.deserialize(activityItem.restreamedActivity.content);
            activityItem.restreamedActivity.hideControls = true;
        }
        activityItem.replies = a.replies.map(r => {
            let replyActivity = StreamsData.activities.get(r);
            if (!replyActivity) { throw Error("activity not found in datastore: " + r); }
            let aItem = ActivityItem.create(replyActivity, StreamsData.entities.get(replyActivity?.authorId));
            aItem.content = editor.deserialize(aItem.content);
            return aItem;
        });
        activityListElem?.append(activityItem);
    });
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
    activityListElem?.addEventListener('publishActivity', publishActivity);
    activityListElem?.addEventListener('reactionChange', updateReaction);
    activityListElem?.addEventListener('share', shareActivity);


    const { activities, entities } = await StreamsClient.getActivities({});
    StreamsData.addActivities(activities.map(a => Activity.create(a)));
    StreamsData.addEntities(entities.map(e => Entity.create(e)));

    const reactions = await StreamsClient.getReactions();
    reactions.forEach(r => {
        StreamsData.addReaction(r.activityId, r.type);
    });

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