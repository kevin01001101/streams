import { ActivityResponse,
  ActivitiesResponse,
  ReactionResponse,
  EntityResponse,
  ActivityRequest,
  ReactionRequest,
  SelectedReactionsResponse} from "./interfaces";


export interface ApiClient {

  saveActivity (request: ActivityRequest): Promise<ActivitiesResponse>;
  saveReaction (request: ReactionRequest): Promise<boolean>;

  getActivity (activityId: string): Promise<ActivitiesResponse>;
  getActivities (options): Promise<ActivityResponse[]>;
  getSelectedReactions (options): Promise<SelectedReactionsResponse[]>;
  updateReaction (activityId: string, reaction: string);
  getEntity (entityId: string): Promise<EntityResponse>;
}