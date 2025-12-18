"use client";
import DeleteChatHistoryButton from "./delete-chat-history-button";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isFrozen: boolean;
}

export default function ProfileClient({ user }: { user: User }) {
  // ...existing UI code from ProfilePage, but use user prop instead of fetching
  return (
    <div>
      {/* ...existing profile UI... */}
      <DeleteChatHistoryButton userId={user.id} />
      {/* ...rest of profile UI... */}
    </div>
  );
}