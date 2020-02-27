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
  authorId: string;
  reactions: [];
  restreamId?: string;
  replyIds: string[];
  parentId?: string;
}

export interface EntityResponse {
  id: string;
  displayName: string;
  email: string;
  alias: string;
}

export interface ReactionResponse {
  type: ReactionType;
  count: number;
}

export interface ActivitiesResponse {
  activities: ActivityResponse[];
  entities: EntityResponse[];
}