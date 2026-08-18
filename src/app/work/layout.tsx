import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace · Ivan Affriandi',
  description: 'Executive Workspace OS for SHŪ / EN Studio and KVR Objects.',
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
