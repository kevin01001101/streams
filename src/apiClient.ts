export abstract class ApiClient {
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

  saveActivity = async (content:string, restreamOf?:string, replyTo?:string) => {

    let result = await this.post('/api/activities', {
      content,
      restreamOf,
      replyTo
    });

    if (result.status != 201) {
      throw new Error("streams api: unexpected response");
    }

    const newActivityUri = result.headers.get("Location");
    if (newActivityUri == null) {
      throw new Error("streams api: response missing location header");
    }

    // we want to reset the ActivityInput form here because we've confirmed that we successfully posted the reponse
    // (evt.target as ActivityInput).reset();
    // trigger a new event?
    // or handle it on the return?
    return newActivityUri;

  }

  abstract async getActivity (activityId: string): Promise<any>;
  abstract async getActivities (options);
  abstract async getReactions ();
  abstract async updateReaction (activityId: string, reaction: string);
  abstract async getEntity (entityId: string);
}