describe("searchPostsWithAI", () => {
  const samplePosts = (n = 10) =>
    Array.from({ length: n }, (_, i) => ({
      _id: `${i + 1}`,
      authorId: { username: `u${i + 1}` },
      text: `post ${i + 1}`
    }));

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    process.env.NODE_ENV = "test";
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns [] when posts is empty", async () => {
    const mod = await import("../../services/ai.service");
    const res = await mod.searchPostsWithAI("anything", []);
    expect(res).toEqual([]);
  });

  it("returns first 5 posts in test mode", async () => {
    const mod = await import("../../services/ai.service");
    const posts = samplePosts(10);
    const res = await mod.searchPostsWithAI("cravings", posts);
    expect(res).toHaveLength(5);
    expect(res.map((p) => p._id)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("does not call OpenAI in test mode even when API key exists", async () => {
    process.env.OPENAI_API_KEY = "fake";
    const createSpy = jest.fn();

    jest.doMock("openai", () => ({
      __esModule: true,
      default: class OpenAI {
        chat = { completions: { create: createSpy } };
      }
    }));

    const mod = await import("../../services/ai.service");
    const posts = samplePosts(10);
    const res = await mod.searchPostsWithAI("anything", posts);

    expect(createSpy).not.toHaveBeenCalled();
    expect(res).toHaveLength(5);
  });

  it("limits to 50 posts when building prompt and uses mocked OpenAI (no real API calls)", async () => {
    process.env.NODE_ENV = "development";
    process.env.OPENAI_API_KEY = "fake";

    const createSpy = jest.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(["1"]) } }]
    });

    jest.doMock("openai", () => ({
      __esModule: true,
      default: class OpenAI {
        chat = { completions: { create: createSpy } };
      }
    }));

    const mod = await import("../../services/ai.service");
    const posts = samplePosts(120);
    const res = await mod.searchPostsWithAI("test", posts);

    expect(createSpy).toHaveBeenCalledTimes(1);

    const args = createSpy.mock.calls[0][0];
    const userMsg = args.messages.find((m: any) => m.role === "user")?.content as string;

    expect(userMsg).toContain("[0]");
    expect(userMsg).toContain("[49]");
    expect(userMsg).not.toContain("[50]");

    expect(res.map((p) => p._id)).toEqual(["1"]);
  });
});