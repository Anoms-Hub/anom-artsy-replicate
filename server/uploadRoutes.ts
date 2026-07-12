/**
 * Shop asset upload endpoint
 * POST /api/upload/shop-asset
 * Accepts: multipart/form-data with field "file"
 * Returns: { url: string, key: string }
 * Auth: admin only (checks JWT session cookie)
 */
import { Router } from "express";
import type { Express } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (PNG, JPEG, GIF, WEBP, SVG)"));
    }
  },
});

export function registerUploadRoutes(app: Express) {
  const uploadRouter = Router();

  // Profile photo upload — any authenticated member, 5MB limit
  const profileUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error("Only PNG, JPEG, GIF, or WEBP images are allowed"));
    },
  });

  uploadRouter.post("/profile-photo", profileUpload.single("file"), async (req, res) => {
    try {
      let user: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
      try { user = await sdk.authenticateRequest(req as any); } catch {
        res.status(401).json({ error: "Unauthorized" }); return;
      }
      if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
      if (!req.file) { res.status(400).json({ error: "No file provided" }); return; }
      const { originalname, mimetype, buffer } = req.file;
      const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `profile-photos/${user.id}/${Date.now()}_${safeName}`;
      const { url } = await storagePut(key, buffer, mimetype);
      res.json({ url, key });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed" });
    }
  });

  uploadRouter.post(
    "/shop-asset",
    upload.single("file"),
    async (req, res) => {
      try {
        // Verify admin session
        let user: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
        try {
          user = await sdk.authenticateRequest(req as any);
        } catch {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        if (!user) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        if (user.role !== "admin") {
          res.status(403).json({ error: "Admin access required" });
          return;
        }

        if (!req.file) {
          res.status(400).json({ error: "No file provided" });
          return;
        }

        const { originalname, mimetype, buffer } = req.file;
        // Sanitize filename — keep extension, strip path traversal
        const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `shop-assets/${Date.now()}_${safeName}`;

        const { url } = await storagePut(key, buffer, mimetype);

        res.json({ url, key });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        res.status(500).json({ error: message });
      }
    }
  );

  app.use("/api/upload", uploadRouter);
}
