import { StreamsApiClient } from './streamsApiClient.js';
import { StreamsDataStore } from './streamsDataStore.js';

import { ActivityInput } from './components/activityInput.js';
import { ActivityItem } from './components/activityItem.js';
import { MainPage } from './pages/mainPage.js';

import { Activity } from './models/activity.js';
import { Entity } from './models/entity.js';
import { Editor } from './components/editor.js';
import { Reaction } from './models/enums.js';
import { ActivityList } from './components/activityList.js';

let StreamsData = new StreamsDataStore();
let StreamsClient = new StreamsApiClient("https://localhost:44387");
let currentPage;

window.addEventListener('DOMContentLoaded', async () => {

    console.log("document loaded.");

    // define our custom elements (web components)
    window.customElements.define('activity-input', ActivityInput);
    window.customElements.define('activity-item', ActivityItem);
    window.customElements.define('activity-list', ActivityList);

    // render the default view
    renderRoute(window.location.pathname);

    // ** this will go in the router constructor?
    document.addEventListener('route', routeHandler);
    console.log("done...");
});

window.onpopstate = () => {
    // set page
    console.log("POP ", window.location.pathname);
}


const routeHandler = (evt) => {
    // handle all anchor links with the router
    console.log("Event ", evt);
    const routeEvent = evt as CustomEvent;

    // figure out the new route
    window.history.pushState(
        {},
        routeEvent.detail.path,
        routeEvent.detail.path
    );

    // render route content
    console.log("now rendering: ", window.location.pathname);

    renderRoute(window.location.pathname);
    evt.preventDefault();
}

const renderRoute = async (route) => {
    // if (currentPage == undefined) {
    //     currentPage = await MainPage.create(document.body, StreamsData, StreamsClient);
    // }

    if (route == "" || route == "/index.html") {
        MainPage.render(document.body, {
            activities: StreamsData.getActivities({
                max:100,
                paging: false,
                sort: "created"
            })
        });
    } else if (route == "/") {

    } else if (route.indexOf('/e/') == 0) {
        let entityName = route.substring(route.lastIndexOf('/')+1)
        console.log("Entity feed for " + entityName);
    } else if (route.indexOf('/t/') == 0) {
        let tagName = route.substring(route.lastIndexOf('/')+1)
        console.log("Tag feed for tag " + tagName);

        let { activities, entities } = await StreamsClient.getActivities({});

        // get activities that fit this criteria...
        // then render

    } else if (route.indexOf('/profile') == 0) {
        //ProfilePage.render(document.body, {});
    } else {
        console.log("unrecognized route: ", route);
    }
}

