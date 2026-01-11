import type { CommentStatus } from "../types";

export const commentStatusColor = (status: CommentStatus) => {
  switch (status) {
    case "visible":
      return "green";
    case "pending":
      return "yellow";
    case "hidden":
      return "red";
    default:
      return "gray";
  }
};

export const commentStatusLabel = (status: CommentStatus) => {
  switch (status) {
    case "visible":
      return "Visible";
    case "pending":
      return "En attente";
    case "hidden":
      return "Masque";
    default:
      return status;
  }
};
