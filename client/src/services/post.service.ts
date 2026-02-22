const BASE_URL = "http://localhost:3000";

export async function getFeed(cursor?: string) {
  const url = cursor
    ? `${BASE_URL}/posts/feed?cursor=${cursor}&limit=10`
    : `${BASE_URL}/posts/feed?limit=10`;

  const token = localStorage.getItem("accessToken");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch feed");
  return data;
}

export async function createPost(text: string, image?: File) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("text", text);
  if (image) formData.append("image", image);

  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create post");
  return data;
}

export async function editPost(id: string, text: string, image?: File) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("text", text);
  if (image) formData.append("image", image);

  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to edit post");
  return data;
}

export async function deletePost(id: string) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete post");
  return data;
}

export async function likePost(postId: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/likes/${postId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to like post");
  return data;
}

export async function unlikePost(postId: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/likes/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to unlike post");
  return data;
}

export async function getComments(postId: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/comments/${postId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get comments");
  return data;
}

export async function addComment(postId: string, text: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/comments/${postId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add comment");
  return data;
}

export async function deleteComment(commentId: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete comment");
  return data;
}

export async function getProfile(username: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/users/${username}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get profile");
  return data;
}

export async function updateProfile(username?: string, profileImage?: File) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  if (username) formData.append("username", username);
  if (profileImage) formData.append("profileImage", profileImage);

  const res = await fetch(`http://localhost:3000/users/me/update`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
}

export async function getUserPosts(username: string) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`http://localhost:3000/users/${username}/posts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get user posts");
  return data;
}