import { StreamsApiClient } from './streamsApiClient.js';
import { StreamsDataStore } from './streamsDataStore.js';

import { ActivityInput } from './components/activityInput.js';
import { ActivityItem } from './components/activityItem.js';
import { ActivityList } from './components/activityList.js';

import { ActivityListPage } from './pages/activityListPage.js';


let streamsClient = new StreamsApiClient("https://localhost:44387");
let streamsData = new StreamsDataStore(streamsClient);

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

        currentPage = ActivityListPage.initialize(document.body, streamsData, {
            showing: "Your Feed",
            dataQuery: {
                expand: "Reactions($select=Type),Author,Replies($count=true),ReplyTo($expand=Author),RestreamOf($expand=Author)",
                orderby: "Created desc"
            }
        }, (activities) => {
            return activities.filter(a => a.parent == undefined);
        });

        //https://localhost:44387/odata/streams?$expand=Reactions($select=Type),Author($select=Id),Replies($select=Id;$count=true),ReplyTo($expand=Author($select=Id)),RestreamOf($expand=Author($select=Id))&$orderby=Created desc
/*
?$expand=
Reactions($select=Type),
Author,
Replies($count=true),
ReplyTo($expand=Author),
RestreamOf($expand=Author)&$orderby=Created desc
*/

    } else if (route == "/") {

    } else if (route.indexOf('/e/') == 0) {
        let entityName = route.substring(route.lastIndexOf('/')+1)
        console.log("Entity feed for " + entityName);
        currentPage = ActivityListPage.initialize(document.body, streamsData, {
            showing: "@" + entityName,
            dataQuery: {
                expand: "Reactions($select=Type),Author,Replies($count=true),ReplyTo($expand=Author),RestreamOf($expand=Author)",
                orderby: "Created desc",
                filter: {
                    mentions: [entityName]
                }
            }
        }, (activities) => {
            return activities
        });

    } else if (route.indexOf('/t/') == 0) {
        let tagName = route.substring(route.lastIndexOf('/')+1)
        console.log("Tag feed for tag " + tagName);

        currentPage = ActivityListPage.initialize(document.body, streamsData, {
            showing: "#" + tagName,
            dataQuery: {
                expand: "Reactions($select=Type),Author,Replies($count=true),ReplyTo($expand=Author),RestreamOf($expand=Author)",
                orderby: "Created desc",
                filter: {
                    tags: [tagName]
                }
            }
        }, (activities) => {
            return activities
        });

    } else if (route.indexOf('/profile') == 0) {
        //ProfilePage.render(document.body, {});
    } else {
        console.log("unrecognized route: ", route);
    }
}

