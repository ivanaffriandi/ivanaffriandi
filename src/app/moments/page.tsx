import { getAllMoments, getInstagramStories } from '@/lib/moments';
import MomentsGallery from '@/components/MomentsGallery';

export const revalidate = 60;

export interface IGProfile {
  name?: string;
  username?: string;
  biography?: string;
  followers_count?: number;
  profile_picture_url?: string;
}

async function getInstagramProfile(): Promise<IGProfile | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://graph.instagram.com/me?fields=name,username,biography,followers_count,profile_picture_url&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function MomentsPage() {
  const [moments, profile, stories] = await Promise.all([
    getAllMoments(),
    getInstagramProfile(),
    getInstagramStories(),
  ]);

  return (
    <div style={{ position: "relative" }}>
      <MomentsGallery 
        initialMoments={moments} 
        profile={profile || undefined} 
        initialStories={stories} 
      />
    </div>
  );
}
