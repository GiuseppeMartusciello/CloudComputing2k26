import { apiFetch } from "../utility/apiFetch";

export async function fetchComments(postId) {
  return await apiFetch(`/comment/post/${postId}`);
}

export async function postComment(postId, text) {
  return await apiFetch(`/comment/${postId}`, {
    method: "POST",
    body: JSON.stringify({ text: text }),
  });
}

export async function deleteComment(commentId) {
  return await apiFetch(`/comment/${commentId}`, {
    method: "DELETE",
  });
}
