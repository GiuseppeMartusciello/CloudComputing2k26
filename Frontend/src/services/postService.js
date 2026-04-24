import { apiFetch } from "../utility/apiFetch";


export async function fetchPosts(limit = 10, offset = 0) {
  const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  return await apiFetch(`/post?${query.toString()}`);
}


export async function getTodayPosts(limit = 10, offset = 0) {
  const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  return await apiFetch(`/post/today?${query.toString()}`);
}

export async function getMyUpvotedPosts(limit = 10, offset = 0) {
  const query = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  console.log("Ris: ",await apiFetch(`/post/my-upvoted-posts?${query.toString()}`));
  return await apiFetch(`/post/my-upvoted-posts?${query.toString()}`);
}

export async function getMyPosts() {
  return await apiFetch(`/post/mine`);
}

export async function getPostById(postId) {
  return await apiFetch(`/post/${postId}`);
}

export async function createPost({ title, tags, imageFile }) {
  const formData = new FormData();

  formData.append("title", title);
  tags.forEach((tag) => formData.append("tags", tag));
  formData.append("file", imageFile);

  return await apiFetch(`/post`, {
    method: "POST",
    body: formData,
  });
}

export async function searchPost({ title, date, tags, sortBy }, limit = 10, offset = 0) {
  const query = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  return await apiFetch(`/post/search?${query.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title ?? "",
      date: date ?? null,
      tags: Array.isArray(tags) ? tags : [],
      sortBy: sortBy ?? "date",
    }),
  });
}


export async function deletePost(postId) {
  return await apiFetch(`/post/${postId}`, {
    method: "DELETE",
  });
}
