import { apiFetch } from "../utility/apiFetch";

export async function createOrUpdateVote(postId, voteType) {
  return await apiFetch(`/vote/${postId}`, {
    method: "POST",
    body: JSON.stringify({ type: voteType }),
  });
}
