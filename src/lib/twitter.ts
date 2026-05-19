export interface TweetItem {
  id: string;
  text: string;
  created_at: string;
  url?: string;
}

// Curated high-fidelity mock tweets representing a chronological list of updates
const MOCK_TWEETS: TweetItem[] = [
  {
    id: "mock-1",
    text: "Configuring serverless telemetry and deploying Next.js 16 build to Firebase App Hosting on macOS. The interface feels solid.",
    created_at: new Date().toISOString(),
    url: "https://x.com/helloivano"
  },
  {
    id: "mock-2",
    text: "Exploring raw concrete geometry, typographic hierarchies, and minimalist Swiss-design layouts for the new digital journal.",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    url: "https://x.com/helloivano"
  },
  {
    id: "mock-3",
    text: "Tactile wabi-sabi details vs stark digital grid systems. Finding peace at the boundary of order and imperfection.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    url: "https://x.com/helloivano"
  }
];

export async function getLatestTweets(): Promise<TweetItem[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  const username = process.env.TWITTER_USERNAME || "helloivano";

  if (!bearerToken || bearerToken.includes("ganti_dengan")) {
    // If no bearer token is configured, return the mock tweets list
    return MOCK_TWEETS;
  }

  try {
    // 1. First lookup user ID by username
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        },
        next: { revalidate: 60 } // Cache user lookup for 1 minute
      }
    );

    if (!userRes.ok) {
      console.warn(`[X API] User lookup failed. Status: ${userRes.status}. Using high-fidelity fallback list.`);
      return MOCK_TWEETS;
    }

    const userData = await userRes.json();
    const userId = userData?.data?.id;

    if (!userId) {
      console.warn("[X API] User ID not found in response. Using high-fidelity fallback list.");
      return MOCK_TWEETS;
    }

    // 2. Fetch the latest 5 tweets for the user ID
    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        },
        next: { revalidate: 300 } // Cache tweets list for 5 minutes
      }
    );

    if (!tweetsRes.ok) {
      console.warn(`[X API] Tweets fetch failed. Status: ${tweetsRes.status}. Using high-fidelity fallback list.`);
      return MOCK_TWEETS;
    }

    const tweetsData = await tweetsRes.json();
    const tweetsList = tweetsData?.data;

    if (!tweetsList || tweetsList.length === 0) {
      console.warn("[X API] No tweets found in API response. Using high-fidelity fallback list.");
      return MOCK_TWEETS;
    }

    return tweetsList.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      url: `https://x.com/${username}/status/${tweet.id}`
    }));
  } catch (error) {
    console.error("[X API] Unexpected error fetching tweets list:", error);
    return MOCK_TWEETS;
  }
}
