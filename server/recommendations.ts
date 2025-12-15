import OpenAI from "openai";
import { db } from "./db";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import {
  content,
  watchHistory,
  ratings,
  favorites,
  recommendations,
  userPreferences,
  type Content,
  type RecommendationWithContent,
} from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateRecommendations(userId: string): Promise<RecommendationWithContent[]> {
  try {
    const history = await db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.updatedAt))
      .limit(20);

    const userRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId));

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));

    const watchedContentIds = Array.from(new Set(history.map(h => h.contentId)));
    const ratedContentIds = userRatings.map(r => r.contentId);
    const favoriteContentIds = userFavorites.map(f => f.contentId);

    const allRelevantIds = Array.from(new Set([...watchedContentIds, ...ratedContentIds, ...favoriteContentIds]));

    if (allRelevantIds.length === 0) {
      const popular = await db
        .select()
        .from(content)
        .orderBy(desc(content.rating))
        .limit(10);

      return popular.map(c => ({
        id: `rec-${c.id}`,
        userId,
        contentId: c.id,
        score: c.rating || 0,
        reason: "Популярное среди зрителей",
        createdAt: new Date(),
        content: c,
      }));
    }

    const watchedContent = await db
      .select()
      .from(content)
      .where(inArray(content.id, allRelevantIds));

    const genres = watchedContent.flatMap(c => c.genres || []);
    const genreCounts = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    const types = watchedContent.map(c => c.type);
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topType = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "anime";

    const highRatedIds = userRatings
      .filter(r => r.score >= 7)
      .map(r => r.contentId);

    const allContent = await db
      .select()
      .from(content)
      .where(sql`${content.id} NOT IN (${sql.join(allRelevantIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(content.rating))
      .limit(100);

    const scoredContent = allContent.map(c => {
      let score = c.rating || 0;
      
      const matchingGenres = (c.genres || []).filter(g => topGenres.includes(g));
      score += matchingGenres.length * 1.5;
      
      if (c.type === topType) {
        score += 2;
      }
      
      if (c.status === "ongoing") {
        score += 0.5;
      }

      return { content: c, score };
    });

    scoredContent.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredContent.slice(0, 10);

    if (openai && topRecommendations.length > 0) {
      try {
        const userProfile = {
          topGenres,
          preferredType: topType,
          recentTitles: watchedContent.slice(0, 5).map(c => c.title),
          highRatedTitles: watchedContent
            .filter(c => highRatedIds.includes(c.id))
            .slice(0, 3)
            .map(c => c.title),
        };

        const response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            {
              role: "system",
              content: `You are an anime recommendation expert. Generate personalized recommendation reasons in Russian based on the user's viewing preferences. Respond with JSON array of objects with "contentId" and "reason" fields.`,
            },
            {
              role: "user",
              content: `User profile: ${JSON.stringify(userProfile)}
              
Recommendations to explain: ${JSON.stringify(topRecommendations.map(r => ({
  id: r.content.id,
  title: r.content.title,
  genres: r.content.genres,
  type: r.content.type,
})))}

Generate a short, personalized reason (1 sentence in Russian) for each recommendation explaining why this user would enjoy it.`,
            },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 1024,
        });

        const aiReasons = JSON.parse(response.choices[0].message.content || "{}");
        const reasonsArray = aiReasons.recommendations || aiReasons.reasons || [];

        return topRecommendations.map((rec, index) => {
          const aiReason = reasonsArray.find((r: any) => r.contentId === rec.content.id);
          return {
            id: `rec-${rec.content.id}`,
            userId,
            contentId: rec.content.id,
            score: rec.score,
            reason: aiReason?.reason || getDefaultReason(rec.content, topGenres, topType),
            createdAt: new Date(),
            content: rec.content,
          };
        });
      } catch (aiError) {
        console.error("AI recommendation failed, using fallback:", aiError);
      }
    }

    return topRecommendations.map(rec => ({
      id: `rec-${rec.content.id}`,
      userId,
      contentId: rec.content.id,
      score: rec.score,
      reason: getDefaultReason(rec.content, topGenres, topType),
      createdAt: new Date(),
      content: rec.content,
    }));

  } catch (error) {
    console.error("Error generating recommendations:", error);
    const popular = await db
      .select()
      .from(content)
      .orderBy(desc(content.rating))
      .limit(10);

    return popular.map(c => ({
      id: `rec-${c.id}`,
      userId,
      contentId: c.id,
      score: c.rating || 0,
      reason: "Популярное среди зрителей",
      createdAt: new Date(),
      content: c,
    }));
  }
}

function getDefaultReason(c: Content, topGenres: string[], topType: string): string {
  const matchingGenres = (c.genres || []).filter(g => topGenres.includes(g));
  
  if (matchingGenres.length > 0) {
    return `Вам понравится — ${matchingGenres.slice(0, 2).join(", ")}`;
  }
  
  if (c.type === topType) {
    const typeLabel = c.type === "anime" ? "аниме" : c.type === "manga" ? "манга" : "манхва";
    return `Отличное ${typeLabel} с высоким рейтингом`;
  }
  
  if (c.rating && c.rating >= 8) {
    return "Высоко оценено зрителями";
  }
  
  return "Рекомендуем к просмотру";
}
