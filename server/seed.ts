import { db } from "./db";
import { content, episodes, chapters } from "@shared/schema";

const sampleAnime = [
  {
    type: "anime",
    title: "Атака титанов",
    titleOriginal: "Shingeki no Kyojin",
    description: "Человечество заперто за огромными стенами, защищающими от титанов — гигантских существ, пожирающих людей. Эрен Йегер клянётся уничтожить всех титанов после трагедии, постигшей его семью.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    backdropUrl: "https://images.alphacoders.com/851/851962.jpg",
    year: 2013,
    status: "completed",
    rating: 9.0,
    ratingCount: 15000,
    genres: ["Экшен", "Драма", "Фэнтези", "Триллер"],
    episodeCount: 87,
    duration: 24,
    studio: "Wit Studio / MAPPA",
    isFeatured: true,
    viewCount: 500000,
  },
  {
    type: "anime",
    title: "Магическая битва",
    titleOriginal: "Jujutsu Kaisen",
    description: "Итадори Юдзи — обычный школьник с невероятной физической силой. Его жизнь меняется, когда он съедает палец короля проклятий Сукуны.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    backdropUrl: "https://images.alphacoders.com/115/1153555.png",
    year: 2020,
    status: "ongoing",
    rating: 8.8,
    ratingCount: 12000,
    genres: ["Экшен", "Фэнтези", "Школа"],
    episodeCount: 47,
    duration: 24,
    studio: "MAPPA",
    isFeatured: true,
    viewCount: 450000,
  },
  {
    type: "anime",
    title: "Человек-бензопила",
    titleOriginal: "Chainsaw Man",
    description: "Денджи — молодой охотник на демонов, который объединяется с демоном-бензопилой Почитой. После смерти он возрождается как Человек-бензопила.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    backdropUrl: "https://images.alphacoders.com/128/1287080.jpg",
    year: 2022,
    status: "ongoing",
    rating: 8.7,
    ratingCount: 10000,
    genres: ["Экшен", "Ужасы", "Фэнтези"],
    episodeCount: 12,
    duration: 24,
    studio: "MAPPA",
    isFeatured: true,
    viewCount: 400000,
  },
  {
    type: "anime",
    title: "Клинок, рассекающий демонов",
    titleOriginal: "Kimetsu no Yaiba",
    description: "Танджиро Камадо становится охотником на демонов, чтобы спасти свою сестру, превращённую в демона, и отомстить за семью.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    backdropUrl: "https://images.alphacoders.com/998/998636.jpg",
    year: 2019,
    status: "ongoing",
    rating: 8.9,
    ratingCount: 13000,
    genres: ["Экшен", "Фэнтези", "Приключения"],
    episodeCount: 55,
    duration: 24,
    studio: "ufotable",
    isFeatured: true,
    viewCount: 480000,
  },
  {
    type: "anime",
    title: "Ван Пис",
    titleOriginal: "One Piece",
    description: "Монки Д. Луффи отправляется в путешествие, чтобы найти легендарное сокровище Ван Пис и стать королём пиратов.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    backdropUrl: "https://images.alphacoders.com/711/711991.jpg",
    year: 1999,
    status: "ongoing",
    rating: 8.7,
    ratingCount: 20000,
    genres: ["Экшен", "Приключения", "Комедия"],
    episodeCount: 1100,
    duration: 24,
    studio: "Toei Animation",
    isFeatured: false,
    viewCount: 600000,
  },
  {
    type: "anime",
    title: "Наруто: Ураганные хроники",
    titleOriginal: "Naruto Shippuden",
    description: "Продолжение истории Наруто Узумаки, который возвращается в деревню после двух лет тренировок и готов к новым испытаниям.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1565/111305.jpg",
    backdropUrl: "https://images.alphacoders.com/667/667728.jpg",
    year: 2007,
    status: "completed",
    rating: 8.5,
    ratingCount: 18000,
    genres: ["Экшен", "Приключения", "Фэнтези"],
    episodeCount: 500,
    duration: 24,
    studio: "Pierrot",
    isFeatured: false,
    viewCount: 550000,
  },
  {
    type: "anime",
    title: "Тетрадь смерти",
    titleOriginal: "Death Note",
    description: "Школьник Лайт Ягами находит тетрадь, позволяющую убивать людей, записывая их имена. Начинается игра в кошки-мышки с детективом L.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    backdropUrl: "https://images.alphacoders.com/856/856188.jpg",
    year: 2006,
    status: "completed",
    rating: 9.0,
    ratingCount: 22000,
    genres: ["Триллер", "Драма", "Детектив"],
    episodeCount: 37,
    duration: 23,
    studio: "Madhouse",
    isFeatured: false,
    viewCount: 700000,
  },
  {
    type: "anime",
    title: "Стальной алхимик: Братство",
    titleOriginal: "Fullmetal Alchemist: Brotherhood",
    description: "Братья Элрики пытаются вернуть свои тела, потерянные при попытке воскресить мать с помощью алхимии.",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    backdropUrl: "https://images.alphacoders.com/674/674988.jpg",
    year: 2009,
    status: "completed",
    rating: 9.2,
    ratingCount: 25000,
    genres: ["Экшен", "Приключения", "Драма", "Фэнтези"],
    episodeCount: 64,
    duration: 24,
    studio: "Bones",
    isFeatured: false,
    viewCount: 650000,
  },
];

const sampleManga = [
  {
    type: "manga",
    title: "Берсерк",
    titleOriginal: "Berserk",
    description: "История Гатса, воина-наёмника, который сражается против демонов и собственной судьбы в мрачном средневековом мире.",
    posterUrl: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
    year: 1989,
    status: "hiatus",
    rating: 9.4,
    ratingCount: 15000,
    genres: ["Экшен", "Драма", "Фэнтези", "Ужасы"],
    chapterCount: 374,
    author: "Кэнтаро Миура",
    isFeatured: true,
    viewCount: 300000,
  },
  {
    type: "manga",
    title: "Блич",
    titleOriginal: "Bleach",
    description: "Ичиго Куросаки обретает силы жнеца душ и берёт на себя обязанности по защите людей от злых духов.",
    posterUrl: "https://cdn.myanimelist.net/images/manga/3/180031.jpg",
    year: 2001,
    status: "completed",
    rating: 8.2,
    ratingCount: 12000,
    genres: ["Экшен", "Приключения", "Фэнтези"],
    chapterCount: 686,
    author: "Тайто Кубо",
    isFeatured: false,
    viewCount: 250000,
  },
  {
    type: "manga",
    title: "Токийские мстители",
    titleOriginal: "Tokyo Revengers",
    description: "Такэмити возвращается в прошлое, чтобы спасти свою первую любовь и изменить историю криминальной банды.",
    posterUrl: "https://cdn.myanimelist.net/images/manga/3/230466.jpg",
    year: 2017,
    status: "completed",
    rating: 8.3,
    ratingCount: 8000,
    genres: ["Экшен", "Драма", "Фантастика"],
    chapterCount: 278,
    author: "Кэн Вакуи",
    isFeatured: true,
    viewCount: 200000,
  },
];

const sampleManhwa = [
  {
    type: "manhwa",
    title: "Поднятие уровня в одиночку",
    titleOriginal: "Solo Leveling",
    description: "Сон Джин У — слабейший охотник в мире, который получает уникальную способность повышать свой уровень без ограничений.",
    posterUrl: "https://cdn.myanimelist.net/images/manga/3/222295.jpg",
    year: 2018,
    status: "completed",
    rating: 8.8,
    ratingCount: 20000,
    genres: ["Экшен", "Фэнтези", "Приключения"],
    chapterCount: 179,
    author: "Чугон",
    isFeatured: true,
    viewCount: 400000,
  },
  {
    type: "manhwa",
    title: "Башня Бога",
    titleOriginal: "Tower of God",
    description: "Бам входит в загадочную башню, чтобы найти свою подругу Рэйчел. Каждый этаж башни полон испытаний и тайн.",
    posterUrl: "https://cdn.myanimelist.net/images/manga/1/205223.jpg",
    year: 2010,
    status: "ongoing",
    rating: 8.6,
    ratingCount: 15000,
    genres: ["Экшен", "Приключения", "Фэнтези", "Драма"],
    chapterCount: 600,
    author: "SIU",
    isFeatured: true,
    viewCount: 350000,
  },
  {
    type: "manhwa",
    title: "Бог старшей школы",
    titleOriginal: "The God of High School",
    description: "Мори Джин — мастер боевых искусств, участвующий в турнире, где победитель получает исполнение любого желания.",
    posterUrl: "https://cdn.myanimelist.net/images/manga/1/200021.jpg",
    year: 2011,
    status: "ongoing",
    rating: 8.3,
    ratingCount: 10000,
    genres: ["Экшен", "Боевые искусства", "Комедия"],
    chapterCount: 580,
    author: "Park Yongje",
    isFeatured: false,
    viewCount: 280000,
  },
];

export async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Check if content already exists
    const existingContent = await db.select().from(content).limit(1);
    if (existingContent.length > 0) {
      console.log("Database already has content, skipping seed.");
      return;
    }

    // Insert anime content
    for (const anime of sampleAnime) {
      const [inserted] = await db.insert(content).values(anime as any).returning();
      console.log(`Created anime: ${inserted.title}`);

      // Add sample episodes for anime
      const episodeCount = Math.min(anime.episodeCount || 12, 12);
      for (let i = 1; i <= episodeCount; i++) {
        await db.insert(episodes).values({
          contentId: inserted.id,
          number: i,
          title: `Эпизод ${i}`,
          duration: (anime.duration || 24) * 60,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          openingStart: 0,
          openingEnd: 90,
          endingStart: (anime.duration || 24) * 60 - 90,
          endingEnd: (anime.duration || 24) * 60,
        });
      }
    }

    // Insert manga content
    for (const manga of sampleManga) {
      const [inserted] = await db.insert(content).values(manga as any).returning();
      console.log(`Created manga: ${inserted.title}`);

      // Add sample chapters
      const chapterCount = Math.min(manga.chapterCount || 10, 10);
      for (let i = 1; i <= chapterCount; i++) {
        await db.insert(chapters).values({
          contentId: inserted.id,
          number: i,
          title: `Глава ${i}`,
          pages: [],
        });
      }
    }

    // Insert manhwa content
    for (const manhwa of sampleManhwa) {
      const [inserted] = await db.insert(content).values(manhwa as any).returning();
      console.log(`Created manhwa: ${inserted.title}`);

      // Add sample chapters
      const chapterCount = Math.min(manhwa.chapterCount || 10, 10);
      for (let i = 1; i <= chapterCount; i++) {
        await db.insert(chapters).values({
          contentId: inserted.id,
          number: i,
          title: `Глава ${i}`,
          pages: [],
        });
      }
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
