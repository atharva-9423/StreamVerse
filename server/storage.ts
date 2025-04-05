import { 
  users, type User, type InsertUser,
  movies, type Movie, type InsertMovie,
  genres, type Genre, type InsertGenre,
  watchHistory, type WatchHistory, type InsertWatchHistory,
  downloadedContent, type DownloadedContent, type InsertDownloadedContent,
  episodes, type Episode, type InsertEpisode
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, desc, sql, like, or, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWatchlist(userId: number, movieId: number, add: boolean): Promise<User | undefined>;
  
  // Movie operations
  getAllMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  getMoviesByType(type: string): Promise<Movie[]>;
  getMoviesByGenre(genre: string): Promise<Movie[]>;
  getFeaturedMovies(): Promise<Movie[]>;
  getTrendingMovies(): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Episode operations
  getEpisodes(animeId: number): Promise<Episode[]>;
  getEpisode(id: number): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: number, episodeData: Partial<InsertEpisode>): Promise<Episode | undefined>;
  deleteEpisode(id: number): Promise<boolean>;
  
  // Genre operations
  getAllGenres(): Promise<Genre[]>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  
  // Watch history operations
  getWatchHistory(userId: number): Promise<WatchHistory[]>;
  getContinueWatchingList(userId: number): Promise<WatchHistory[]>;
  createOrUpdateWatchHistory(watchHistory: InsertWatchHistory): Promise<WatchHistory>;
  markWatchHistoryComplete(userId: number, contentId: number): Promise<WatchHistory | undefined>;

  // Downloaded content operations
  getDownloadedContent(userId: number): Promise<DownloadedContent[]>;
  getDownloadedContentItem(userId: number, contentId: number): Promise<DownloadedContent | undefined>;
  createDownloadedContent(downloadItem: InsertDownloadedContent): Promise<DownloadedContent>;
  updateDownloadProgress(id: number, downloadProgress: number, downloadStatus: string): Promise<DownloadedContent | undefined>;
  deleteDownloadedContent(id: number): Promise<boolean>;
  
  // Session management
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        watchlist: []
      })
      .returning();
    return user;
  }
  
  async updateUserWatchlist(userId: number, movieId: number, add: boolean): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;
    
    const watchlist = user.watchlist || [];
    let updatedWatchlist: string[];
    
    if (add) {
      // Add to watchlist if not already there
      if (!watchlist.includes(movieId.toString())) {
        updatedWatchlist = [...watchlist, movieId.toString()];
      } else {
        updatedWatchlist = watchlist; // No change needed
      }
    } else {
      // Remove from watchlist
      updatedWatchlist = watchlist.filter(id => id !== movieId.toString());
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ watchlist: updatedWatchlist })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }

  // Movie operations
  async getAllMovies(): Promise<Movie[]> {
    return db.select().from(movies);
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async getMoviesByType(type: string): Promise<Movie[]> {
    return db.select().from(movies).where(eq(movies.type, type));
  }

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    // Find movies that contain the specified genre
    const allMovies = await db.select().from(movies);
    return allMovies.filter(movie => {
      return Array.isArray(movie.genres) && movie.genres.includes(genre);
    });
  }

  async getFeaturedMovies(): Promise<Movie[]> {
    return db.select().from(movies).where(eq(movies.featured, true));
  }

  async getTrendingMovies(): Promise<Movie[]> {
    return db.select().from(movies).where(eq(movies.trending, true));
  }

  async searchMovies(query: string): Promise<Movie[]> {
    // Get all movies
    const allMovies = await db.select().from(movies);
    
    // If query is empty, return empty array
    if (!query.trim()) {
      return [];
    }
    
    // Convert query to lowercase for case-insensitive search
    const lowerQuery = query.toLowerCase();
    
    // Filter movies that match the query in title, overview, or genres
    return allMovies.filter(movie => {
      // Check if query matches title
      if (movie.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Check if query matches overview
      if (movie.overview.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Check if query matches any genre
      if (Array.isArray(movie.genres) && movie.genres.some(genre => 
        genre.toLowerCase().includes(lowerQuery)
      )) {
        return true;
      }
      
      // No match
      return false;
    });
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const [movie] = await db
      .insert(movies)
      .values(insertMovie)
      .returning();
    return movie;
  }

  // Episode operations
  async getEpisodes(animeId: number): Promise<Episode[]> {
    return db
      .select()
      .from(episodes)
      .where(eq(episodes.animeId, animeId))
      .orderBy(asc(episodes.seasonNumber), asc(episodes.episodeNumber));
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    const [episode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, id));
    return episode;
  }

  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const [newEpisode] = await db
      .insert(episodes)
      .values({
        ...episode,
        releaseDate: new Date()
      })
      .returning();
    return newEpisode;
  }

  async updateEpisode(id: number, episodeData: Partial<InsertEpisode>): Promise<Episode | undefined> {
    const [existingEpisode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, id));
      
    if (!existingEpisode) {
      return undefined;
    }
    
    const [updatedEpisode] = await db
      .update(episodes)
      .set(episodeData)
      .where(eq(episodes.id, id))
      .returning();
      
    return updatedEpisode;
  }

  async deleteEpisode(id: number): Promise<boolean> {
    const [existingEpisode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, id));
      
    if (!existingEpisode) {
      return false;
    }
    
    await db
      .delete(episodes)
      .where(eq(episodes.id, id));
      
    return true;
  }

  // Genre operations
  async getAllGenres(): Promise<Genre[]> {
    return db.select().from(genres);
  }

  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const [genre] = await db
      .insert(genres)
      .values(insertGenre)
      .returning();
    return genre;
  }

  // Watch history operations
  async getWatchHistory(userId: number): Promise<WatchHistory[]> {
    return db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId));
  }

  async createOrUpdateWatchHistory(insertWatchHistory: InsertWatchHistory): Promise<WatchHistory> {
    // Look for existing record
    const [existing] = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, insertWatchHistory.userId),
          eq(watchHistory.contentId, insertWatchHistory.contentId)
        )
      );
    
    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(watchHistory)
        .set({
          watchedTime: insertWatchHistory.watchedTime,
          percentComplete: insertWatchHistory.percentComplete,
          lastWatched: new Date(),
          episode: insertWatchHistory.episode,
          season: insertWatchHistory.season
        })
        .where(eq(watchHistory.id, existing.id))
        .returning();
      
      return updated;
    } else {
      // Create new record
      const [newRecord] = await db
        .insert(watchHistory)
        .values({
          ...insertWatchHistory,
          lastWatched: new Date()
        })
        .returning();
      
      return newRecord;
    }
  }

  async getContinueWatchingList(userId: number): Promise<WatchHistory[]> {
    // Get all watch history entries for the user that are not completed and have been watched
    return db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.completed, false),
          sql`${watchHistory.percentComplete} > 0 AND ${watchHistory.percentComplete} < 95`
        )
      )
      .orderBy(desc(watchHistory.lastWatched))
      .limit(10); // Only return the 10 most recent items
  }

  async markWatchHistoryComplete(userId: number, contentId: number): Promise<WatchHistory | undefined> {
    // Find the watch history entry
    const [existing] = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.contentId, contentId)
        )
      );

    if (!existing) {
      return undefined;
    }

    // Mark it as completed
    const [updated] = await db
      .update(watchHistory)
      .set({
        completed: true,
        percentComplete: 100
      })
      .where(eq(watchHistory.id, existing.id))
      .returning();

    return updated;
  }

  // Downloaded content operations
  async getDownloadedContent(userId: number): Promise<DownloadedContent[]> {
    return db
      .select()
      .from(downloadedContent)
      .where(eq(downloadedContent.userId, userId))
      .orderBy(desc(downloadedContent.downloadDate));
  }

  async getDownloadedContentItem(userId: number, contentId: number): Promise<DownloadedContent | undefined> {
    const [item] = await db
      .select()
      .from(downloadedContent)
      .where(
        and(
          eq(downloadedContent.userId, userId),
          eq(downloadedContent.contentId, contentId)
        )
      );
    
    return item;
  }

  async createDownloadedContent(downloadItem: InsertDownloadedContent): Promise<DownloadedContent> {
    const [newItem] = await db
      .insert(downloadedContent)
      .values({
        ...downloadItem,
        downloadDate: new Date()
      })
      .returning();
    
    return newItem;
  }

  async updateDownloadProgress(id: number, downloadProgress: number, downloadStatus: string): Promise<DownloadedContent | undefined> {
    const [updated] = await db
      .update(downloadedContent)
      .set({
        downloadProgress,
        downloadStatus
      })
      .where(eq(downloadedContent.id, id))
      .returning();
    
    return updated;
  }

  async deleteDownloadedContent(id: number): Promise<boolean> {
    // First check if the record exists
    const [existingDownload] = await db
      .select()
      .from(downloadedContent)
      .where(eq(downloadedContent.id, id));
      
    if (!existingDownload) {
      return false;
    }
    
    // Delete the record
    await db
      .delete(downloadedContent)
      .where(eq(downloadedContent.id, id));
    
    return true;
  }
}

// Function to create a default user with a properly hashed password
async function createDefaultUser() {
  // Create a default user with properly hashed password
  // This is using the same hashing method as in auth.ts
  const salt = randomBytes(16).toString("hex");
  const password = "password123";
  const buf = (await promisify(scrypt)(password, salt, 64)) as Buffer;
  const hashedPassword = `${buf.toString("hex")}.${salt}`;
  
  console.log("Checking if default user 'demouser' exists...");
  
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, "demouser"));
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        username: "demouser",
        password: hashedPassword,
        watchlist: []
      });
      console.log("Created default user 'demouser'");
    } else {
      console.log("Default user 'demouser' already exists");
    }
  } catch (error) {
    console.error("Error creating default user:", error);
  }
}

// Initialize function to set up database with sample data
async function initializeData() {
  // Create default user regardless of other data
  await createDefaultUser();
  
  // Check if content data already exists
  const existingGenres = await db.select().from(genres);
  if (existingGenres.length > 0) {
    console.log("Content data already initialized");
    return;
  }
  
  console.log("Initializing database with sample data...");
  
  // Add base genres
  const genreNames = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
    "Horror", "Romance", "Sci-Fi", "Thriller", "Animation"
  ];
  
  for (const name of genreNames) {
    await db.insert(genres).values({ name });
  }
  
  // Add some sample movies and anime
  const sampleContent = [
    {
      title: "Demon Slayer",
      overview: "Follow Tanjiro Kamado's journey to become a demon slayer after his family is slaughtered and his sister is turned into a demon.",
      posterPath: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2019,
      rating: "TV-14",
      matchPercentage: 95,
      genres: ["Action", "Fantasy", "Animation"],
      type: "anime",
      featured: true,
      trending: true
    },
    {
      title: "Attack on Titan",
      overview: "Humans are nearly extinct due to giant humanoid Titans. Those that remain live inside cities with massive walls.",
      posterPath: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1541562232579-512a21360020?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2013,
      rating: "TV-MA",
      matchPercentage: 97,
      genres: ["Action", "Drama", "Fantasy", "Animation"],
      type: "anime",
      featured: false,
      trending: true
    },
    {
      title: "Jujutsu Kaisen",
      overview: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demon's other body parts and thus exorcise himself.",
      posterPath: "https://images.unsplash.com/photo-1613051884057-32afee7a52a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1613051884057-32afee7a52a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2020,
      rating: "TV-14",
      matchPercentage: 96,
      genres: ["Action", "Fantasy", "Animation"],
      type: "anime",
      featured: true,
      trending: false
    },
    {
      title: "Dune",
      overview: "Feature adaptation of Frank Herbert's science fiction novel, about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
      posterPath: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1595589981301-d6c14c0c2f80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2021,
      rating: "PG-13",
      matchPercentage: 95,
      genres: ["Action", "Adventure", "Sci-Fi", "Drama"],
      type: "movie",
      featured: false,
      trending: true
    },
    {
      title: "Naruto Shippuden",
      overview: "Naruto Uzumaki returns after two and a half years of training and continues his quest to become Hokage.",
      posterPath: "https://images.unsplash.com/photo-1612487528505-d2338264c821?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2007,
      rating: "TV-14",
      matchPercentage: 96,
      genres: ["Action", "Adventure", "Animation"],
      type: "anime",
      featured: false,
      trending: false
    },
    {
      title: "Hunter x Hunter",
      overview: "Gon Freecss aspires to become a Hunter, an exceptional being capable of greatness.",
      posterPath: "https://images.unsplash.com/photo-1553374402-559e8b431161?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2011,
      rating: "TV-14",
      matchPercentage: 94,
      genres: ["Action", "Adventure", "Fantasy", "Animation"],
      type: "anime",
      featured: false,
      trending: false
    },
    {
      title: "Inception",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      posterPath: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2010,
      rating: "PG-13",
      matchPercentage: 95,
      genres: ["Action", "Adventure", "Sci-Fi", "Thriller"],
      type: "movie",
      featured: false,
      trending: true
    },
    {
      title: "The Matrix",
      overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      posterPath: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1506297233079-7c8a2d10a87d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 1999,
      rating: "R",
      matchPercentage: 94,
      genres: ["Action", "Sci-Fi"],
      type: "movie",
      featured: false,
      trending: false
    },
    {
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      posterPath: "https://images.unsplash.com/photo-1601513237233-fd58c938d8b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2014,
      rating: "PG-13",
      matchPercentage: 98,
      genres: ["Adventure", "Drama", "Sci-Fi"],
      type: "movie",
      featured: false,
      trending: false
    },
    {
      title: "Death Note",
      overview: "A high school student discovers a supernatural notebook that has deadly powers.",
      posterPath: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      backdropPath: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      releaseYear: 2006,
      rating: "TV-14",
      matchPercentage: 97,
      genres: ["Animation", "Crime", "Drama", "Fantasy", "Thriller"],
      type: "anime",
      featured: false,
      trending: false
    }
  ];
  
  for (const content of sampleContent) {
    await db.insert(movies).values(content);
  }
  console.log("Sample content added to database");
  
  // Add sample episodes for Demon Slayer
  const demonSlayerContent = await db.select().from(movies).where(eq(movies.title, "Demon Slayer"));
  if (demonSlayerContent.length > 0) {
    const demonSlayerId = demonSlayerContent[0].id;
    
    // Check if episodes already exist
    const existingEpisodes = await db.select().from(episodes).where(eq(episodes.animeId, demonSlayerId));
    
    if (existingEpisodes.length === 0) {
      const demonSlayerEpisodes = [
        {
          animeId: demonSlayerId,
          title: "Cruelty",
          episodeNumber: 1,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/4gH5CJu.jpg",
          duration: 1440, // 24 minutes
          overview: "Tanjiro Kamado is a kind-hearted and intelligent boy who lives with his family in the mountains. He became his family's breadwinner after his father's death, making trips to the nearby village to sell charcoal.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: demonSlayerId,
          title: "Trainer Sakonji Urokodaki",
          episodeNumber: 2,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/sYQWcGE.jpg",
          duration: 1440,
          overview: "Tanjiro finds Giyu Tomioka, a demon slayer who spared his sister Nezuko because of her unusual protective behavior towards Tanjiro. He directs Tanjiro to find Sakonji Urokodaki, a trainer of demon slayers.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: demonSlayerId,
          title: "Sabito and Makomo",
          episodeNumber: 3,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/8lLVBuf.jpg",
          duration: 1440,
          overview: "Tanjiro meets two mysterious children during his training who help him prepare for the Final Selection, the test to become a demon slayer.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: demonSlayerId,
          title: "Final Selection",
          episodeNumber: 4,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/YSgzE71.jpg",
          duration: 1440,
          overview: "Tanjiro enters the Final Selection, a seven-day survival test on a mountain filled with demons where apprentices must prove their worth to join the Demon Slayer Corps.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: demonSlayerId,
          title: "My Own Steel",
          episodeNumber: 5,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/42tAlNO.jpg",
          duration: 1440,
          overview: "After passing the Final Selection, Tanjiro receives his own Nichirin Sword, which changes color based on the owner's breath style and potential.",
          videoUrl: "/videos/anime_video.mp4"
        }
      ];
      
      for (const episode of demonSlayerEpisodes) {
        await db.insert(episodes).values(episode);
      }
      console.log("Added sample episodes for Demon Slayer");
    }
  }
  
  // Add sample episodes for Attack on Titan
  const attackOnTitanContent = await db.select().from(movies).where(eq(movies.title, "Attack on Titan"));
  if (attackOnTitanContent.length > 0) {
    const attackOnTitanId = attackOnTitanContent[0].id;
    
    // Check if episodes already exist
    const existingEpisodes = await db.select().from(episodes).where(eq(episodes.animeId, attackOnTitanId));
    
    if (existingEpisodes.length === 0) {
      const attackOnTitanEpisodes = [
        {
          animeId: attackOnTitanId,
          title: "To You, 2000 Years From Now",
          episodeNumber: 1,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/yFbA99h.jpg",
          duration: 1440,
          overview: "After 100 years of peace, humanity is suddenly reminded of the terror of being at the Titans' mercy when a Colossal Titan breaches the wall protecting the town of Shiganshina.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: attackOnTitanId,
          title: "That Day: The Fall of Shiganshina, Part 1",
          episodeNumber: 2,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/GHzWuHS.jpg",
          duration: 1440,
          overview: "After the Titans break through Wall Maria, Eren and Mikasa witness the death of their mother as she is devoured by a smiling Titan.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: attackOnTitanId,
          title: "A Dim Light Amid Despair: Humanity's Comeback, Part 1",
          episodeNumber: 3,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/KVLOVIl.jpg",
          duration: 1440,
          overview: "Five years after the fall of Wall Maria, Eren, Mikasa, and Armin have enlisted in the military and begin their training in the 104th Training Corps under Commandant Keith Shadis.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: attackOnTitanId,
          title: "The Night of the Closing Ceremony: Humanity's Comeback, Part 2",
          episodeNumber: 4,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/BxqAGy2.jpg",
          duration: 1440,
          overview: "Two years into their training, Annie teaches Eren a fighting technique that will help him compensate for his weaker physique and lack of experience.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: attackOnTitanId,
          title: "First Battle: The Struggle for Trost, Part 1",
          episodeNumber: 5,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/qQJkf7T.jpg",
          duration: 1440,
          overview: "The 104th Training Corps graduates, and its members are assigned to their military positions. A Colossal Titan appears again and breaks the wall, allowing Titans to invade the Trost District.",
          videoUrl: "/videos/anime_video.mp4"
        }
      ];
      
      for (const episode of attackOnTitanEpisodes) {
        await db.insert(episodes).values(episode);
      }
      console.log("Added sample episodes for Attack on Titan");
    }
  }
  
  // Add sample episodes for Jujutsu Kaisen
  const jjkContent = await db.select().from(movies).where(eq(movies.title, "Jujutsu Kaisen"));
  if (jjkContent.length > 0) {
    const jjkId = jjkContent[0].id;
    
    // Check if episodes already exist
    const existingEpisodes = await db.select().from(episodes).where(eq(episodes.animeId, jjkId));
    
    if (existingEpisodes.length === 0) {
      const jjkEpisodes = [
        {
          animeId: jjkId,
          title: "Ryomen Sukuna",
          episodeNumber: 1,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/wOlJEXO.jpg",
          duration: 1440,
          overview: "After learning that his grandfather's friend is hospitalized, Yuji Itadori meets up with Megumi Fushiguro, who is looking for a special talisman.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: jjkId,
          title: "For Myself",
          episodeNumber: 2,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/N9IDMAF.jpg",
          duration: 1440,
          overview: "Yuji forms a binding vow with Sukuna to save his own life. Now a jujutsu sorcerer's execution is suspended as he becomes a vessel for Sukuna.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: jjkId,
          title: "Girl of Steel",
          episodeNumber: 3,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/DFuEbhz.jpg",
          duration: 1440,
          overview: "Satoru Gojo takes Yuji to meet his new classmates at Tokyo Metropolitan Magic Technical College: Megumi and Nobara Kugisaki.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: jjkId,
          title: "Curse Womb Must Die",
          episodeNumber: 4,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/P9Ow5qJ.jpg",
          duration: 1440,
          overview: "Yuji, Megumi, and Nobara must exorcise all cursed spirits in an abandoned detention facility. They discover the spirit is actually a Curse Womb requiring special handling.",
          videoUrl: "/videos/anime_video.mp4"
        },
        {
          animeId: jjkId,
          title: "Curse Womb Must Die II",
          episodeNumber: 5,
          seasonNumber: 1,
          thumbnail: "https://i.imgur.com/ZWoRNvr.jpg",
          duration: 1440,
          overview: "The team continues their battle against the special grade cursed spirit. Just as things get desperate, Yuji reveals he's still alive and disrupts Sukuna's binding vow.",
          videoUrl: "/videos/anime_video.mp4"
        }
      ];
      
      for (const episode of jjkEpisodes) {
        await db.insert(episodes).values(episode);
      }
      console.log("Added sample episodes for Jujutsu Kaisen");
    }
  }
  
  console.log("Database initialization complete");
}

// Initialize the storage with database support
const storage = new DatabaseStorage();

// Run the initialization (only adds data if needed)
initializeData().catch(err => {
  console.error("Error initializing database:", err);
});

export { storage };
