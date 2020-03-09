import { ReactionType } from './models/enums.js';

export interface ActivityRequest {
  content: string,
  restreamOf?: string,
  replyTo?: string
};

export interface ReactionRequest {
  type: ReactionType,
  activityId: string
}

export interface SelectedReactionsResponse {
  activityId: string,
  personId: string,
  type: ReactionType
}

export interface ActivityResponse {
  id: string; // guid
  content: string;
  created: string;
  author: EntityResponse;
  reactions: [];
  restreamOf?: ActivityResponse;
  replies: ActivityResponse[];
  replyTo?: ActivityResponse;
}

export interface EntityResponse {
  id: string;
  alias: string;
  displayName: string;
  email: string;
}

export interface ReactionResponse {
  type: ReactionType;
  count: number;
}

export interface ODataResponse {
  "@odata.context": string;
  value: any;
}

export interface ActivitiesResponse {
  activities: ActivityResponse[];
  entities: EntityResponse[];
}