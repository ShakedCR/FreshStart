const BASE_URL = import.meta.env.VITE_API_URL;

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      window.location.href = "/login";
      return res;
    }

    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = "/login";
      return res;
    }

    const { accessToken } = await refreshRes.json();
    localStorage.setItem("accessToken", accessToken);

    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${accessToken}` }
    });
  }

  return res;
}

export async function getFeed(cursor?: string) {
  const url = cursor
    ? `${BASE_URL}/posts/feed?cursor=${cursor}&limit=10`
    : `${BASE_URL}/posts/feed?limit=10`;

  const res = await fetchWithAuth(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch feed");
  return data;
}

export async function createPost(text: string, image?: File) {
  const formData = new FormData();
  formData.append("text", text);
  if (image) formData.append("image", image);

  const res = await fetchWithAuth(`${BASE_URL}/posts`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create post");
  return data;
}

export async function editPost(id: string, text: string, image?: File | null) {
  const formData = new FormData();
  formData.append("text", text);
  if (image) formData.append("image", image);
  if (image === null) formData.append("removeImage", "true");

  const res = await fetchWithAuth(`${BASE_URL}/posts/${id}`, {
    method: "PUT",
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to edit post");
  return data;
}

export async function deletePost(id: string) {
  const res = await fetchWithAuth(`${BASE_URL}/posts/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete post");
  return data;
}

export async function likePost(postId: string) {
  const res = await fetchWithAuth(`${BASE_URL}/likes/${postId}`, {
    method: "POST"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to like post");
  return data;
}

export async function unlikePost(postId: string) {
  const res = await fetchWithAuth(`${BASE_URL}/likes/${postId}`, {
    method: "DELETE"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to unlike post");
  return data;
}

export async function getComments(postId: string) {
  const res = await fetchWithAuth(`${BASE_URL}/comments/${postId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get comments");
  return data;
}

export async function addComment(postId: string, text: string) {
  const res = await fetchWithAuth(`${BASE_URL}/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add comment");
  return data;
}

export async function deleteComment(commentId: string) {
  const res = await fetchWithAuth(`${BASE_URL}/comments/${commentId}`, {
    method: "DELETE"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete comment");
  return data;
}

export async function getProfile(username: string) {
  const res = await fetchWithAuth(`${BASE_URL}/users/${username}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get profile");
  return data;
}

export async function updateProfile(username?: string, profileImage?: File) {
  const formData = new FormData();
  if (username) formData.append("username", username);
  if (profileImage) formData.append("profileImage", profileImage);

  const res = await fetchWithAuth(`${BASE_URL}/users/me/update`, {
    method: "PUT",
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
}

export async function getUserPosts(username: string) {
  const res = await fetchWithAuth(`${BASE_URL}/users/${username}/posts`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get user posts");
  return data;
}

export async function searchPosts(query: string) {
  const res = await fetchWithAuth(`${BASE_URL}/ai/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Search failed");
  return data;
}