import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "games_db.json");
const DEFAULT_GAMES_FILE = path.join(process.cwd(), "src", "games.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".mp4" && ext !== ".webm" && ext !== ".mov") {
      return cb(new Error("Only MP4, WebM and MOV video formats are supported."));
    }
    cb(null, true);
  },
});

interface Game {
  id: string;
  title: string;
  description?: string;
  category: string;
  iframeUrl?: string;
  iframe?: string;
  controls?: string;
  banner: string;
  logo?: string;
  legacy?: string;
  icon?: string;
  previewVid?: string;
  cardStyle?: "square" | "rectangular" | "vertical"; // CrazyGames style
}

interface DBStructure {
  customGames: Game[];
  defaultGamesOverrides: Record<string, Partial<Game>>;
  deletedDefaultIds: string[];
}

// Ensure DB file exists
function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading db file, resetting to defaults:", err);
  }
  return {
    customGames: [],
    defaultGamesOverrides: {},
    deletedDefaultIds: []
  };
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db file:", err);
  }
}

// Get raw system games
function readDefaultGames(): Game[] {
  try {
    if (fs.existsSync(DEFAULT_GAMES_FILE)) {
      const data = fs.readFileSync(DEFAULT_GAMES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading default games file:", err);
  }
  return [];
}

// Merge and build cache-friendly list of games
function getMergedGames(): Game[] {
  const db = readDB();
  const defaults = readDefaultGames();

  const activeDefaults = defaults
    .filter((g) => !db.deletedDefaultIds.includes(g.id))
    .map((g) => {
      const override = db.defaultGamesOverrides[g.id];
      return override ? { ...g, ...override } : g;
    });

  return [...db.customGames, ...activeDefaults];
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Serve uploaded files statically under /uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Endpoint to upload a preview video
  app.post("/api/upload-preview", (req, res) => {
    upload.single("video")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No video file was uploaded." });
      }
      const videoUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, videoUrl });
    });
  });

  // API Endpoints
  app.get("/api/games", (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      const games = getMergedGames();
      res.json(games);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/games/add", (req, res) => {
    try {
      const newGame = req.body;
      if (!newGame || !newGame.id || !newGame.title) {
        res.status(400).json({ error: "Invalid game data" });
        return;
      }

      const db = readDB();
      db.customGames.unshift(newGame);
      writeDB(db);

      res.json({ success: true, game: newGame });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/games/update", (req, res) => {
    try {
      const updatedGame = req.body;
      if (!updatedGame || !updatedGame.id) {
        res.status(400).json({ error: "Invalid game id" });
        return;
      }

      const db = readDB();
      const isCustom = db.customGames.some((g) => g.id === updatedGame.id);

      if (isCustom) {
        db.customGames = db.customGames.map((g) => (g.id === updatedGame.id ? updatedGame : g));
      } else {
        db.defaultGamesOverrides[updatedGame.id] = updatedGame;
      }
      writeDB(db);

      res.json({ success: true, game: updatedGame });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/games/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: "Missing game id" });
        return;
      }

      const db = readDB();
      const isCustom = db.customGames.some((g) => g.id === id);

      if (isCustom) {
        db.customGames = db.customGames.filter((g) => g.id !== id);
      } else {
        if (!db.deletedDefaultIds.includes(id)) {
          db.deletedDefaultIds.push(id);
        }
      }
      writeDB(db);

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[kira.game] Full-stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
