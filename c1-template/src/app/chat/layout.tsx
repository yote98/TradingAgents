// Force dynamic rendering for chat page - NO CACHING
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
