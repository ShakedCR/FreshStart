import OpenAI from "openai";

const openai = process.env.NODE_ENV !== "test" 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function searchPostsWithAI(query: string, posts: any[]) {
  if (posts.length === 0) return [];

  if (process.env.NODE_ENV === "test" || !openai) {
    return posts.slice(0, 5);
  }

  const limitedPosts = posts.slice(0, 50);
  const postsText = limitedPosts.map((p, i) => 
    `[${i}] ID:${p._id} | Author:${p.authorId?.username} | Text: ${p.text}`
  ).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.3,
    max_tokens: 500,
    messages: [
      {
        role: "system",
       content: `You are a helpful search assistant for a smoking cessation social network called FreshStart.
Given a search query and a list of posts, find posts that are relevant to the query.

Rules:
- Return posts that are related to the query topic, even if not an exact match
- Think about synonyms and related concepts (e.g. "cravings" relates to "urge to smoke", "hard day" etc.)
- Only exclude posts that are completely unrelated to the query
- If no posts match at all, return an empty array []
- Return ONLY a JSON array of IDs, nothing else. Example: ["id1","id2","id3"]`
      },
      {
        role: "user",
        content: `Query: "${query}"\n\nPosts:\n${postsText}`
      }
    ]
  });

  const content = response.choices[0]?.message?.content || "[]";
  const ids: string[] = JSON.parse(content);
  return posts.filter(p => ids.includes(p._id.toString()));
}