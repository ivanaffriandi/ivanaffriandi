import { getPosts } from "@/lib/blogger";
import { getAllMoments } from "@/lib/moments";
import { getFallbackBooks } from "@/lib/books";
import DailyJournalFeed from "@/components/DailyJournalFeed";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all Blogger posts, Firebase Moments, and local books database simultaneously for maximum performance
  const [posts, moments] = await Promise.all([
    getPosts(),
    getAllMoments()
  ]);

  // Read books dynamically on the server to prevent Next.js caching / hydration mismatch
  let books = [];
  try {
    const booksFilePath = path.join(process.cwd(), "src/data/books.json");
    if (fs.existsSync(booksFilePath)) {
      const raw = fs.readFileSync(booksFilePath, "utf8");
      books = JSON.parse(raw);
    } else {
      books = getFallbackBooks();
    }
  } catch (err) {
    books = getFallbackBooks();
  }

  // Render the interactive daily journal interface with server-side parsed books!
  return (
    <div style={{ minHeight: "auto", paddingBottom: "0rem", backgroundColor: "var(--bg-color)" }}>
      <DailyJournalFeed posts={posts} moments={moments} initialBooks={books} />
    </div>
  );
}

