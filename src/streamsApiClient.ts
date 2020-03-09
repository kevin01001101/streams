import { ApiClient } from './apiClient.js';
import { ActivityResponse, ActivitiesResponse, ActivityRequest, ReactionRequest, ReactionResponse, SelectedReactionsResponse, ODataResponse } from './interfaces.js';

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





  saveActivity = async (request: ActivityRequest): Promise<ActivitiesResponse> => {

    let result = await this.post('/api/activities', request);

    if (result.status != 201) {
      throw new Error("streams api: unexpected response");
    }

    const newActivityUri = result.headers.get("Location");
    if (newActivityUri == null) {
      throw new Error("streams api: response missing location header");
    }

    // use the newActivityUri to get the ActivityResponse
    const activityId = newActivityUri.substring(newActivityUri.lastIndexOf('/')+1);
    return await this.getActivity(activityId);
  }

  saveReaction = async (request: ReactionRequest): Promise<boolean> => {
    let result = await this.post('/api/reactions', request);

    if (result.status != 200) {
      return false;
    }
    return true;
  }

  getActivity = async (activityId: string) => {

    const result = await this.get('/api/activities/' + activityId);

    if (result.status != 200) {
      throw new Error("streams api: unable to get activity");
    }

    const data = await result.json();
    return <ActivitiesResponse>data;
  };

  private buildFilterString = (filterOptions) => {
    let filterParts: string[] = [];

    if (filterOptions.tags) {
      filterParts.push("tags/any(t:t/Text eq '" + filterOptions.tags[0] + "')");
    }

    // by guid of person mentioned....
    if (filterOptions.mentions) {
      filterParts.push("mentions/any(m:m/Email eq '" + filterOptions.mentions[0] + "')")
    }

    return filterParts.join(' and ');
  }

  private buildOdataQuery = (options) => {
    let queryParts:string[] = [];

    if (options.expand) {
      queryParts.push("$expand=" + options.expand);
    }
    if (options.filter) {
      queryParts.push("$filter=" + this.buildFilterString(options.filter));
    }
    if (options.orderby) {
      queryParts.push("$orderby=" + options.orderby);
    }

    if (queryParts.length == 0) return "";
    return queryParts.join('&');
  }


  getActivities = async (options) => {
    const result = await this.get('/odata/streams?' + this.buildOdataQuery(options));
    if (result.status != 200) {
      throw new Error("streams api: unable to get activities");
    }

    const data = await result.json();
    return <ActivityResponse[]>(data as ODataResponse).value;
  }


  getSelectedReactions = async (options) => {
    const result = await this.get('/api/reactions');
    const data = await result.json();
    return <SelectedReactionsResponse[]>data;
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
