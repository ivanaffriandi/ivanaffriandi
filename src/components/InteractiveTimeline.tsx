"use client";

import Link from "next/link";

interface Post {
  id: string;
  title: string;
  published: string;
  content: string;
}

export default function InteractiveTimeline({ posts }: { posts: Post[] }) {
  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Sleek, vertical timeline of all Blogger journal entries */}
      <div className="timeline-container">
        <div className="timeline-line"></div>
        {posts.map((post) => {
          const parts = post.published.substring(0, 10).split("-");
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          const badgeDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
          const fullDate = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }).toUpperCase();

          return (
            <div key={post.id} className="timeline-item">
              <div className="timeline-badge">{badgeDate}</div>
              <div className="timeline-content">
                <Link href={`/blog/${post.id}`} className="timeline-card">
                  <div className="timeline-card-content">
                    <span className="timeline-card-meta">{fullDate}</span>
                    <h2 className="timeline-card-title">{post.title}</h2>
                  </div>
                  <div className="timeline-card-arrow">↗</div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
