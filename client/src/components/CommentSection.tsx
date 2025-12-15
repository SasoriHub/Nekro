import { useState } from "react";
import { MessageSquare, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import type { CommentWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface CommentSectionProps {
  comments: CommentWithUser[];
  onAddComment: (text: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  isLoading?: boolean;
}

export function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  isLoading,
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleReply = (parentId: string) => {
    if (replyText.trim()) {
      onAddComment(replyText.trim(), parentId);
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-6" data-testid="comment-section">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          Комментарии ({comments.length})
        </h3>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border-2 border-neon-purple/30">
              <AvatarImage
                src={user?.profileImageUrl || undefined}
                alt={user?.firstName || "User"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="min-h-[80px] resize-none bg-secondary/50"
                data-testid="textarea-new-comment"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!newComment.trim()}
                  size="sm"
                  data-testid="button-submit-comment"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Отправить
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-lg bg-secondary/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/api/login" className="text-neon-purple hover:underline">
              Войдите
            </a>
            , чтобы оставить комментарий
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                <div className="h-16 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="rounded-lg bg-secondary/30 py-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Пока нет комментариев. Будьте первым!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              currentUserId={user?.id}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyClick={() => setReplyingTo(comment.id)}
              onReplyTextChange={setReplyText}
              onReplySubmit={() => handleReply(comment.id)}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              onDelete={onDeleteComment}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: CommentWithUser;
  replies: CommentWithUser[];
  currentUserId?: string;
  replyingTo: string | null;
  replyText: string;
  onReplyClick: () => void;
  onReplyTextChange: (text: string) => void;
  onReplySubmit: () => void;
  onCancelReply: () => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  replyingTo,
  replyText,
  onReplyClick,
  onReplyTextChange,
  onReplySubmit,
  onCancelReply,
  onDelete,
  isAuthenticated,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.userId;

  return (
    <div className="space-y-3" data-testid={`comment-${comment.id}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border-2 border-border">
          <AvatarImage
            src={comment.user.profileImageUrl || undefined}
            alt={comment.user.firstName || "User"}
            className="object-cover"
          />
          <AvatarFallback className="bg-secondary text-foreground">
            {comment.user.firstName?.[0] ||
              comment.user.email?.[0]?.toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {comment.user.firstName || comment.user.email?.split("@")[0] || "Пользователь"}
            </span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt &&
                formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
            </span>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="mt-1 text-sm text-foreground/90">{comment.text}</p>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReplyClick}
              className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Ответить
            </Button>
          )}

          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder="Написать ответ..."
                className="min-h-[60px] resize-none bg-secondary/50"
                data-testid="textarea-reply"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onReplySubmit}
                  disabled={!replyText.trim()}
                >
                  Ответить
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelReply}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-12 space-y-3 border-l-2 border-border pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3" data-testid={`reply-${reply.id}`}>
              <Avatar className="h-8 w-8 border-2 border-border">
                <AvatarImage
                  src={reply.user.profileImageUrl || undefined}
                  alt={reply.user.firstName || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-secondary text-foreground text-xs">
                  {reply.user.firstName?.[0] ||
                    reply.user.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {reply.user.firstName || reply.user.email?.split("@")[0] || "Пользователь"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {reply.createdAt &&
                      formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                  </span>
                  {currentUserId === reply.userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDelete(reply.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground/90">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
