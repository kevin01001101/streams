import { ApiClient } from './apiClient.js';
import { ActivityResponse, ActivitiesResponse } from './interfaces.js';

export class StreamsApiClient extends ApiClient {

  constructor(hostname: string) {
    super(hostname);
  }

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
}
