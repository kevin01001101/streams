import { ActivityResponse, ActivitiesResponse, ReactionResponse, EntityResponse, ActivityRequest } from "./interfaces";


export interface ApiClient {

  saveActivity (request: ActivityRequest): Promise<ActivitiesResponse>;

  getActivity (activityId: string): Promise<ActivitiesResponse>;
  getActivities (options): Promise<ActivitiesResponse>;
  getReactions (): Promise<ReactionResponse[]>;
  updateReaction (activityId: string, reaction: string);
  getEntity (entityId: string): Promise<EntityResponse>;
}