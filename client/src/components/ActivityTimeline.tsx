import { useQuery } from "@tanstack/react-query";
import { Play, Star, Heart, MessageCircle, Clock, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ActivityWithContent } from "@shared/schema";

interface ActivityTimelineProps {
  userId?: string;
  showPrivate?: boolean;
  limit?: number;
}

export function ActivityTimeline({ userId, showPrivate = false, limit = 20 }: ActivityTimelineProps) {
  const { data: activities = [], isLoading } = useQuery<ActivityWithContent[]>({
    queryKey: ["/api/user/activity"],
  });

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} д. назад`;
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "watched":
        return <Play className="h-4 w-4 text-neon-purple" />;
      case "rated":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "favorited":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "commented":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "started_watching":
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityWithContent) => {
    const contentTitle = activity.content?.title || "контент";
    
    switch (activity.type) {
      case "watched":
        const episodeNum = activity.episode?.number;
        return episodeNum 
          ? `Посмотрел(а) ${episodeNum} эпизод "${contentTitle}"`
          : `Посмотрел(а) "${contentTitle}"`;
      case "rated":
        const score = (activity.metadata as any)?.score;
        return `Оценил(а) "${contentTitle}" на ${score}/10`;
      case "favorited":
        return `Добавил(а) "${contentTitle}" в избранное`;
      case "commented":
        return `Прокомментировал(а) "${contentTitle}"`;
      case "started_watching":
        return `Начал(а) смотреть "${contentTitle}"`;
      default:
        return `Активность с "${contentTitle}"`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Активность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Активность
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>Нет активности</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "relative flex gap-4 pl-10",
                      activity.isPrivate && "opacity-60"
                    )}
                  >
                    <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        {activity.content?.posterUrl && (
                          <Link href={`/anime/${activity.content.id}`}>
                            <img
                              src={activity.content.posterUrl}
                              alt=""
                              className="h-12 w-9 rounded object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
                            />
                          </Link>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {getActivityText(activity)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                            {activity.isPrivate && (
                              <Badge variant="outline" className="text-xs h-5">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Скрыто
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
