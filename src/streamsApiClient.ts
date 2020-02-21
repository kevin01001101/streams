import { ApiClient } from './apiClient.js';
import { ActivityResponse, ActivitiesResponse } from './interfaces.js';

export class StreamsApiClient implements ApiClient {
  _apiHostname: string;

  constructor(hostname) {
    this._apiHostname = hostname || "";
  }

  private prependHostname = (endpoint) => {
    if (this._apiHostname != undefined && endpoint.indexOf(this._apiHostname) == -1) {
      return this._apiHostname + endpoint;
    }
    else {
      return endpoint;
    }
  }

  protected post = async (endpoint:string, data) => {
    const response = await fetch(this.prependHostname(endpoint), {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Expose-Headers': 'Location'
      },
      body: JSON.stringify(data)
    });

    return response;
  };

  protected get = async (endpoint:string) => {
    const response = await fetch(this.prependHostname(endpoint), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return response;
  };

  protected delete = async (endpoint:string) => {
    const response = await fetch(this.prependHostname(endpoint), {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response;
  };

  saveActivity = async (content:string, restreamId?:string, replyTo?:string): Promise<ActivityResponse> => {

    let result = await this.post('/api/activities', {
      content,
      restreamId,
      replyTo
    });

    if (result.status != 201) {
      throw new Error("streams api: unexpected response");
    }

    const newActivityUri = result.headers.get("Location");
    if (newActivityUri == null) {
      throw new Error("streams api: response missing location header");
    }

    // use the newActivityUri to get the ActivityResponse

    return new Promise((resolve, reject) => {
      resolve({
        id:"123",
        content:"content",
        created:"created",
        reactions: [],
        restreamId: "",
        replyIds: [],
        parentId: "",
        authorId:"123"});
    });
    //newActivityUri;
  }

  getActivity = async (activityId: string) => {

    const result = await this.get('/api/activities/' + activityId);

    if (result.status != 200) {
      throw new Error("streams api: unable to get activity");
    }

    const data = await result.json();
    return <ActivityResponse>data;
  };


  getActivities = async (options) => {
    const result = await this.get('/api/activities/');

    if (result.status != 200) {
      throw new Error("streams api: unable to get activities");
    }

    const data = await result.json();
    return <ActivitiesResponse>data;
  }


  getReactions = async () => {
    const result = await this.get('/api/reactions');
    const data = await result.json();
    return data;
  };

  updateReaction = async (activityId: string, reaction: string) => {

    let result;
    if (reaction) {
      result = await this.post('/api/reactions', {
        activityId,
        type: reaction
      });
    } else {
      result  = await this.delete('/api/reactions/' + activityId);
    }

    if (result.ok) {
      return true;
    } else {
      return false;
    }
  }

  getEntity = async (entityId) => {

    const result = await this.get('/api/entities/' + entityId);
    const data = await result.json();
    return data;
  };

}
