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
  reactions: Map<Reaction,number>;
  restreamOf: string;
  replies: string[];
  parentId: string;
}

export interface EntityResponse {
  id: string;
  displayName: string;
  email: string;
}

export interface ActivitiesResponse {
    activities: ActivityResponse[];
    entities: EntityResponse[];
}