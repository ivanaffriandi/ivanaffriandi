import { getAllMoments } from '@/lib/moments';
import MomentsGallery from '@/components/MomentsGallery';

export const revalidate = 60; // Revalidate every minute

export default async function MomentsPage() {
  const moments = await getAllMoments();

  return (
    <div style={{ minHeight: "auto", paddingBottom: "4rem", paddingTop: "0.5rem", backgroundColor: "var(--bg-color)" }}>
      <div style={{ 
        maxWidth: "850px", 
        margin: "0 auto", 
        padding: "0 0.5rem" 
      }}>
        <MomentsGallery initialMoments={moments} />
      </div>
    </div>
  );
}
