import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertWatchHistorySchema, 
  insertDownloadedContentSchema, 
  insertEpisodeSchema,
  Episode,
  Movie
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Serve video files statically
  app.use('/videos', express.static(path.join(process.cwd(), 'public/videos')));
  
  // Route for downloading video files
  app.get('/videos/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(process.cwd(), 'public/videos', fileName);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'video/mp4');
    
    // Send file
    res.sendFile(filePath);
  });
  // Get all genres
  app.get("/api/genres", async (req, res) => {
    const genres = await storage.getAllGenres();
    res.json(genres);
  });

  // Get all movies/anime
  app.get("/api/content", async (req, res) => {
    const { type, genre, query } = req.query;
    
    if (query) {
      const results = await storage.searchMovies(query as string);
      res.json(results);
    } else if (type) {
      const movies = await storage.getMoviesByType(type as string);
      res.json(movies);
    } else if (genre) {
      const movies = await storage.getMoviesByGenre(genre as string);
      res.json(movies);
    } else {
      const movies = await storage.getAllMovies();
      res.json(movies);
    }
  });

  // Get trending content
  app.get("/api/content/trending", async (req, res) => {
    const trending = await storage.getTrendingMovies();
    res.json(trending);
  });

  // Get featured content
  app.get("/api/content/featured", async (req, res) => {
    const featured = await storage.getFeaturedMovies();
    res.json(featured);
  });

  // Get single movie/anime
  app.get("/api/content/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const movie = await storage.getMovie(id);
    if (!movie) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    res.json(movie);
  });
  
  // Get streaming URL for movie/anime
  app.get("/api/content/:id/video", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const movie = await storage.getMovie(id);
    if (!movie) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    // Select appropriate video based on genre
    let videoUrl = "/videos/action_video.mp4"; // Default
    
    if (movie.genres && movie.genres.length > 0) {
      if (movie.genres.includes("Action")) {
        videoUrl = "/videos/action_video.mp4";
      } else if (movie.genres.includes("Anime")) {
        videoUrl = "/videos/anime_video.mp4";
      } else if (movie.genres.includes("Sci-Fi")) {
        videoUrl = "/videos/sci_fi_video.mp4";
      } else {
        videoUrl = "/videos/adventure_video.mp4";
      }
    }
    
    res.json({ 
      videoUrl, 
      title: movie.title,
      thumbnailUrl: movie.posterPath
    });
  });

  // Get watch history for user
  app.get("/api/user/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    
    const history = await storage.getWatchHistory(userId);
    
    // Fetch movie details for each history item
    const historyWithDetails = await Promise.all(
      history.map(async (item) => {
        const movie = await storage.getMovie(item.contentId);
        return { ...item, content: movie };
      })
    );
    
    res.json(historyWithDetails);
  });

  // Get user's watchlist with movie details
  app.get("/api/user/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    
    // Get the movie details for each ID in the watchlist
    const watchlistWithDetails = await Promise.all(
      (req.user.watchlist || []).map(async (movieId) => {
        const movie = await storage.getMovie(parseInt(movieId));
        return movie;
      })
    );
    
    // Filter out any undefined (deleted movies)
    const validWatchlistItems = watchlistWithDetails.filter(Boolean);
    
    res.json(validWatchlistItems);
  });

  // Update watch history
  app.post("/api/user/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Get data from request but override userId with authenticated user
      const data = {
        ...req.body,
        userId: req.user.id
      };
      
      // Validate request body
      const validatedData = insertWatchHistorySchema.parse(data);
      
      // Create or update watch history
      const history = await storage.createOrUpdateWatchHistory(validatedData);
      
      res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add/remove from watchlist
  app.post("/api/user/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Validate request body
      const schema = z.object({
        contentId: z.number(),
        add: z.boolean()
      });
      
      const { contentId, add } = schema.parse(req.body);
      const userId = req.user.id;
      
      // Update watchlist
      const user = await storage.updateUserWatchlist(userId, contentId, add);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ watchlist: user.watchlist });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get continue watching list for user
  app.get("/api/user/continue-watching", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    
    const continueWatching = await storage.getContinueWatchingList(userId);
    
    // Fetch movie details for each item
    const continueWatchingWithDetails = await Promise.all(
      continueWatching.map(async (item) => {
        const movie = await storage.getMovie(item.contentId);
        return { ...item, content: movie };
      })
    );
    
    res.json(continueWatchingWithDetails);
  });

  // Mark a movie/episode as completed
  app.post("/api/user/history/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Validate request body
      const schema = z.object({
        contentId: z.number()
      });
      
      const { contentId } = schema.parse(req.body);
      const userId = req.user.id;
      
      // Mark the watch history as completed
      const history = await storage.markWatchHistoryComplete(userId, contentId);
      
      if (!history) {
        return res.status(404).json({ message: "Watch history not found" });
      }
      
      res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get downloaded content for user
  app.get("/api/user/downloads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    
    const downloads = await storage.getDownloadedContent(userId);
    
    // Fetch movie details for each download
    const downloadsWithDetails = await Promise.all(
      downloads.map(async (item) => {
        const movie = await storage.getMovie(item.contentId);
        return { ...item, content: movie };
      })
    );
    
    res.json(downloadsWithDetails);
  });

  // Start a new download
  app.post("/api/user/downloads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get data from request but override userId with authenticated user
      const data = {
        ...req.body,
        userId: req.user.id
      };
      
      // Validate request body
      const validatedData = insertDownloadedContentSchema.parse(data);
      
      // Check if content already exists in downloads
      const existingDownload = await storage.getDownloadedContentItem(
        req.user.id, 
        validatedData.contentId
      );
      
      if (existingDownload) {
        return res.status(400).json({ 
          message: "Content already downloaded or download in progress",
          downloadId: existingDownload.id 
        });
      }
      
      // Create new download entry
      const download = await storage.createDownloadedContent(validatedData);
      
      res.status(201).json(download);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update download progress
  app.patch("/api/user/downloads/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const downloadId = parseInt(req.params.id);
      if (isNaN(downloadId)) {
        return res.status(400).json({ message: "Invalid download ID" });
      }
      
      // Validate request body
      const schema = z.object({
        downloadProgress: z.number().min(0).max(100),
        downloadStatus: z.enum(["in_progress", "complete", "error", "paused"])
      });
      
      const { downloadProgress, downloadStatus } = schema.parse(req.body);
      
      // Update the download progress
      const download = await storage.updateDownloadProgress(downloadId, downloadProgress, downloadStatus);
      
      if (!download) {
        return res.status(404).json({ message: "Download not found" });
      }
      
      res.json(download);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete a download
  app.delete("/api/user/downloads/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const downloadId = parseInt(req.params.id);
      if (isNaN(downloadId)) {
        return res.status(400).json({ message: "Invalid download ID" });
      }
      
      // Delete the download
      const success = await storage.deleteDownloadedContent(downloadId);
      
      if (!success) {
        return res.status(404).json({ message: "Download not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Episode Routes
  // Get all episodes (regardless of anime)
  app.get("/api/episodes", async (req, res) => {
    try {
      // If animeId is provided as a query parameter, filter by it
      const animeIdParam = req.query.animeId;
      let animeId: number | undefined = undefined;
      
      if (animeIdParam) {
        animeId = parseInt(animeIdParam as string);
        if (isNaN(animeId)) {
          return res.status(400).json({ message: "Invalid anime ID in query parameter" });
        }
      }
      
      let episodesList: Episode[] = [];
      let anime: Movie | undefined = undefined;
      
      if (animeId) {
        // If animeId is provided, fetch episodes for that specific anime
        episodesList = await storage.getEpisodes(animeId);
        anime = await storage.getMovie(animeId);
        
        if (!anime) {
          return res.status(404).json({ message: "Anime not found" });
        }
      } else {
        // Get the first anime ID from anime content
        const animeContent = await storage.getMoviesByType('anime');
        if (animeContent.length > 0) {
          animeId = animeContent[0].id;
          episodesList = await storage.getEpisodes(animeId);
          anime = animeContent[0];
        }
      }
      
      if (!anime) {
        return res.json({ anime: null, episodes: [], seasonCount: 0 });
      }
      
      // Add extra metadata for the frontend
      const response = {
        anime: {
          id: anime.id,
          title: anime.title,
          overview: anime.overview,
          posterPath: anime.posterPath,
          backdropPath: anime.backdropPath,
          releaseYear: anime.releaseYear,
          rating: anime.rating,
          type: anime.type
        },
        episodes: episodesList,
        seasonCount: episodesList.length > 0 ? Math.max(...episodesList.map(ep => ep.seasonNumber), 0) : 0
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all episodes for a specific anime
  app.get("/api/episodes/:animeId", async (req, res) => {
    try {
      const animeId = parseInt(req.params.animeId);
      
      if (isNaN(animeId)) {
        return res.status(400).json({ message: "Invalid anime ID" });
      }
      
      const episodesList = await storage.getEpisodes(animeId);
      
      // Get the anime details to include in the response
      const anime = await storage.getMovie(animeId);
      
      if (!anime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      
      // Add extra metadata for the frontend
      const response = {
        anime: {
          id: anime.id,
          title: anime.title,
          overview: anime.overview,
          posterPath: anime.posterPath,
          backdropPath: anime.backdropPath,
          releaseYear: anime.releaseYear,
          rating: anime.rating,
          type: anime.type
        },
        episodes: episodesList,
        seasonCount: Math.max(...episodesList.map(ep => ep.seasonNumber), 0)
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific episode
  app.get("/api/episodes/:animeId/:episodeId", async (req, res) => {
    try {
      const episodeId = parseInt(req.params.episodeId);
      
      if (isNaN(episodeId)) {
        return res.status(400).json({ message: "Invalid episode ID" });
      }
      
      const episode = await storage.getEpisode(episodeId);
      
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.json(episode);
    } catch (error) {
      console.error("Error fetching episode:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a new episode
  app.post("/api/episodes/:animeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const animeId = parseInt(req.params.animeId);
      
      if (isNaN(animeId)) {
        return res.status(400).json({ message: "Invalid anime ID" });
      }
      
      // Verify the anime exists
      const anime = await storage.getMovie(animeId);
      
      if (!anime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      
      // Combine request body with animeId from URL
      const data = {
        ...req.body,
        animeId
      };
      
      // Validate data
      const validatedData = insertEpisodeSchema.parse(data);
      
      // Create the episode
      const episode = await storage.createEpisode(validatedData);
      
      res.status(201).json(episode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating episode:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update an episode
  app.patch("/api/episodes/:episodeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const episodeId = parseInt(req.params.episodeId);
      
      if (isNaN(episodeId)) {
        return res.status(400).json({ message: "Invalid episode ID" });
      }
      
      // Verify the episode exists
      const existingEpisode = await storage.getEpisode(episodeId);
      
      if (!existingEpisode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      // Validate only the fields that are being updated
      const schema = z.object({
        title: z.string().optional(),
        episodeNumber: z.number().optional(),
        seasonNumber: z.number().optional(),
        thumbnail: z.string().optional(),
        duration: z.number().optional(),
        overview: z.string().optional(),
        videoUrl: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Update the episode
      const updatedEpisode = await storage.updateEpisode(episodeId, validatedData);
      
      res.json(updatedEpisode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating episode:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete an episode
  app.delete("/api/episodes/:episodeId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const episodeId = parseInt(req.params.episodeId);
      
      if (isNaN(episodeId)) {
        return res.status(400).json({ message: "Invalid episode ID" });
      }
      
      // Delete the episode
      const success = await storage.deleteEpisode(episodeId);
      
      if (!success) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting episode:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
