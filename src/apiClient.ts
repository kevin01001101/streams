import { ActivityResponse, ActivitiesResponse, ReactionResponse, EntityResponse } from "./interfaces";


export interface ApiClient {

  saveActivity (content:string, restreamId?:string, replyTo?:string): Promise<ActivityResponse>;

  getActivity (activityId: string): Promise<ActivityResponse>;
  getActivities (options): Promise<ActivitiesResponse>;
  getReactions (): Promise<ReactionResponse[]>;
  updateReaction (activityId: string, reaction: string);
  getEntity (entityId: string): Promise<EntityResponse>;
}