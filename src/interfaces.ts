import { Reaction } from './models/enums.js';

export interface ActivityRequest {
  content: string,
  restreamOf?: string,
  replyTo?: string
};

export interface ActivityResponse {
  id: string; // guid
  content: string;
  created: string;
  authorId: string;
  reactions: ReactionResponse[];
  restreamOf: string;
  replies: string[];
  parentId: string;
}

export interface EntityResponse {
  id: string;
  displayName: string;
  email: string;
}

export interface ReactionResponse {
  type: Reaction;
  count: number;
}

export interface ActivitiesResponse {
  activities: ActivityResponse[];
  entities: EntityResponse[];
}