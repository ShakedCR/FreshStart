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