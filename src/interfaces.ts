interface ReactionResponse {
  type:string;
}

interface ActivityRequest {
  content: string,
  restreamOf?: string,
  replyTo?: string
};

interface ActivityResponse {
  id: string; // guid
  content: string;
  created: string;
  authorId: string;
  reactions: Map<ReactionResponse,number>;
  restreamOf: string;
  replies: string[];
  parentId: string;
}

interface EntityResponse {
  id: string;
  displayName: string;
  email: string;
}

interface ActivitiesResponse {
    activities: ActivityResponse[];
    entities: EntityResponse[];
}