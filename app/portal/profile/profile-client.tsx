"use client";
import DeleteChatHistoryButton from "./delete-chat-history-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfileClient({ user }: { user: any }) {
  // ...existing UI code from ProfilePage, but use user prop instead of fetching
  return (
    <div>
      {/* ...existing profile UI... */}
      <DeleteChatHistoryButton userId={user.id} />
      {/* ...rest of profile UI... */}
    </div>
  );
}