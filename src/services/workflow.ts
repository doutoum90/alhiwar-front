
export type WorkflowStatus =
  | "draft"
  | "in_review"
  | "rejected"
  | "published"
  | "archived";

export type ReviewRejectDto = { comment?: string | null };
