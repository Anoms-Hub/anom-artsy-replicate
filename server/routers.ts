import { execSync } from "child_process";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getMissions,
  getMyContributions,
  completeMission,
  getCoinBalance,
  getCoinHistory,
  getProfile,
  updateProfile,
  getFeedPosts,
  createFeedPost,
  getLounges,
  createLounge,
  earnCoins,
  getProfileByUsername,
  getProfileByUserId,
  updateMemberProfile,
  getProfileAwards,
  grantAward,
  toggleProfileLike,
  getProfileLikeCount,
  hasLikedProfile,
  recordProfileVisit,
  getRecentVisitors,
  isUsernameAvailable,
  getDb,
} from "./db";
import { shopItems, userPurchases, siteContent, adminDocuments, adminFiles } from "../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import type { ShopItem } from "../drizzle/schema";
import { invokeLLM, type Message as LLMMessage } from "./_core/llm";

/**
 * Mission Router - Community contribution tasks and rewards
 */
const missionRouter = router({
  getMissions: publicProcedure.query(async () => {
    return getMissions("active");
  }),

  getMyContributions: protectedProcedure.query(async ({ ctx }) => {
    return getMyContributions(ctx.user.id);
  }),

  completeMission: protectedProcedure
    .input(z.object({ missionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return completeMission(ctx.user.id, input.missionId);
    }),
});

/**
 * Games Router - Mini-game coin rewards
 */
const gamesRouter = router({
  earnCoins: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().positive().max(100), // cap per call to prevent abuse
        source: z.string().min(1).max(255),           // e.g. "Game: AO Trivia"
      })
    )
    .mutation(async ({ ctx, input }) => {
      return earnCoins(ctx.user.id, input.amount, input.source);
    }),
});

/**
 * Coin Router - Anom Coin economy and transaction history
 */
const coinRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    return getCoinBalance(ctx.user.id);
  }),

  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return getCoinHistory(ctx.user.id, input?.limit || 50);
    }),
});

/**
 * Profile Router - User profiles, being selection, and member showcase
 */
const profileRouter = router({
  // Legacy: simple profile for Dashboard
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return getProfile(ctx.user.id);
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        photoUrl: z.string().optional(),
        bio: z.string().optional(),
        theme: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return updateProfile(ctx.user.id, input);
    }),

  // Member Profile / Being system
  getMyFullProfile: protectedProcedure.query(async ({ ctx }) => {
    return getProfileByUserId(ctx.user.id);
  }),

  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await getProfileByUsername(input.username);
      if (!profile) return null;
      // Record visit if logged in and not own profile
      if (ctx.user && ctx.user.id !== profile.profile.userId) {
        await recordProfileVisit(profile.profile.userId, ctx.user.id);
      }
      return profile;
    }),

  updateBeing: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/).optional(),
        bio: z.string().max(280).optional(),
        // Allow empty string to clear photo, or a valid URL to set one
        photoUrl: z.union([z.string().url(), z.literal("")]).optional(),
        beingType: z.enum(["clifford", "tater", "x9", "ao-symbol"]).optional(),
        beingName: z.string().min(1).max(64).optional(),
        backgroundId: z.string().optional(),
        theme: z.string().optional(),
        // Giphy GIF URL to display on profile (G-rated only, stored in customizationData)
        gifUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check username availability if changing
      if (input.username) {
        const available = await isUsernameAvailable(input.username, ctx.user.id);
        if (!available) {
          throw new Error("Username is already taken");
        }
      }
      // Server-side bio sanitization: members may only submit plain text.
      // Strip all HTML tags, JS protocol references, and event handler patterns.
      const sanitizedInput = {
        ...input,
        bio: input.bio !== undefined
          ? input.bio
              .replace(/<[^>]*>/g, "")        // strip HTML tags
              .replace(/javascript:/gi, "")    // strip JS protocol
              .replace(/on\w+\s*=/gi, "")      // strip event handlers (onclick= etc.)
              .replace(/[<>]/g, "")            // strip stray angle brackets
              .trim()
              .slice(0, 280)
          : undefined,
      };
      return updateMemberProfile(ctx.user.id, sanitizedInput);
    }),

  checkUsername: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      return { available: await isUsernameAvailable(input.username, ctx.user.id) };
    }),

  getAwards: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return getProfileAwards(input.userId);
    }),

  getMyAwards: protectedProcedure.query(async ({ ctx }) => {
    return getProfileAwards(ctx.user.id);
  }),

  likeProfile: protectedProcedure
    .input(z.object({ toUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.toUserId) throw new Error("Cannot like your own profile");
      return toggleProfileLike(ctx.user.id, input.toUserId);
    }),

  getLikeStatus: protectedProcedure
    .input(z.object({ toUserId: z.number() }))
    .query(async ({ ctx, input }) => {
      const liked = await hasLikedProfile(ctx.user.id, input.toUserId);
      const count = await getProfileLikeCount(input.toUserId);
      return { liked, count };
    }),

  getLikeCount: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return { count: await getProfileLikeCount(input.userId) };
    }),

  getRecentVisitors: protectedProcedure.query(async ({ ctx }) => {
    return getRecentVisitors(ctx.user.id, 10);
  }),
});

/**
 * Feed Router - Social feed and content sharing
 */
const feedRouter = router({
  getPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return getFeedPosts(input.limit, input.offset);
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        mediaUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createFeedPost(ctx.user.id, input.content, input.mediaUrl);
    }),
});

/**
 * Lounge Router - Community spaces and channels
 */
const loungeRouter = router({
  getLounges: publicProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      return getLounges(input?.limit || 20);
    }),

  createLounge: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        type: z.enum(["family", "friend", "fan", "community"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createLounge(ctx.user.id, input.name, input.type, input.description);
    }),
});

/**
 * Owner Router - Admin-only integrations (Gmail, Calendar, creator notes)
 * Only accessible when ctx.user.role === 'admin'
 */
function runMcp(server: string, tool: string, input: Record<string, unknown>): unknown {
  try {
    const inputJson = JSON.stringify(input);
    const result = execSync(
      `manus-mcp-cli tool call ${tool} --server ${server} --input '${inputJson.replace(/'/g, "'\\''")}' 2>/dev/null`,
      { encoding: "utf-8", timeout: 20000 }
    );
    // manus-mcp-cli writes result to a temp file; the stdout is a path notice
    // The actual data comes from the saved JSON file
    const pathMatch = result.match(/saved to:\s*(\S+\.json)/);
    if (pathMatch) {
      const fileContent = execSync(`cat '${pathMatch[1]}'`, { encoding: "utf-8" });
      return JSON.parse(fileContent);
    }
    return JSON.parse(result);
  } catch {
    return null;
  }
}

const ownerRouter = router({
  getInbox: adminProcedure
    .input(z.object({ q: z.string().default("in:inbox"), maxResults: z.number().default(10) }))
    .query(async ({ input }) => {
      const raw = runMcp("gmail", "gmail_search_messages", {
        q: input.q,
        max_results: input.maxResults,
      }) as { messages?: Array<{ subject: string; from: string; date: string; snippet: string; messageId: string; threadId: string; to?: string }> } | null;
      if (!raw || !Array.isArray((raw as { messages?: unknown[] }).messages)) return [];
      return (raw as { messages: Array<{ subject: string; from: string; date: string; snippet: string; messageId: string; threadId: string; to?: string }> }).messages.map((m) =>
        JSON.parse(JSON.stringify(m))
      );
    }),

  getCalendar: adminProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ input }) => {
      const now = new Date();
      const end = new Date(now.getTime() + input.days * 24 * 60 * 60 * 1000);
      const raw = runMcp("google-calendar", "google_calendar_search_events", {
        time_min: now.toISOString(),
        time_max: end.toISOString(),
        max_results: 20,
      }) as { events?: Array<{ summary: string; description?: string; start: string; end: string; eventId: string; location?: string }> } | null;
      if (!raw || !Array.isArray((raw as { events?: unknown[] }).events)) return [];
      return (raw as { events: Array<{ summary: string; description?: string; start: string; end: string; eventId: string; location?: string }> }).events.map((e) =>
        JSON.parse(JSON.stringify(e))
      );
    }),

  sendEmail: adminProcedure
    .input(z.object({ to: z.string().email(), subject: z.string(), body: z.string() }))
    .mutation(async ({ input }) => {
      runMcp("gmail", "gmail_send_messages", {
        messages: [{ to: input.to, subject: input.subject, body: input.body }],
      });
      return { success: true };
    }),

  createCalendarEvent: adminProcedure
    .input(z.object({
      summary: z.string(),
      description: z.string().optional(),
      startTime: z.string(), // ISO string
      endTime: z.string(),
    }))
    .mutation(async ({ input }) => {
      runMcp("google-calendar", "google_calendar_create_events", {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startTime },
        end: { dateTime: input.endTime },
      });
      return { success: true };
    }),
});

/**
 * Shop Router - Cosmetic items store (admin upload + member purchase)
 */
const shopRouter = router({
  // Admin: create a new shop item
  createItem: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      description: z.string().optional(),
      type: z.enum(["sticker", "background", "emote", "profile_build", "gif_pack", "color_theme", "decoration"]),
      tier: z.enum(["free", "coin", "starter", "creator", "elite"]).default("coin"),
      coinPrice: z.number().int().min(0).default(0),
      realPrice: z.number().min(0).optional(),
      imageUrl: z.string().url().optional(),
      previewUrl: z.string().url().optional(),
      sortOrder: z.number().int().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [item] = await db.insert(shopItems).values({
        name: input.name,
        description: input.description,
        type: input.type,
        tier: input.tier,
        coinPrice: input.coinPrice,
        realPrice: input.realPrice?.toString(),
        imageUrl: input.imageUrl,
        previewUrl: input.previewUrl,
        sortOrder: input.sortOrder,
        isActive: true,
      }).$returningId();
      return { id: item.id };
    }),

  // Admin: update a shop item
  updateItem: adminProcedure
    .input(z.object({
      id: z.number().int(),
      name: z.string().min(1).max(128).optional(),
      description: z.string().optional(),
      type: z.enum(["sticker", "background", "emote", "profile_build", "gif_pack", "color_theme", "decoration"]).optional(),
      tier: z.enum(["free", "coin", "starter", "creator", "elite"]).optional(),
      coinPrice: z.number().int().min(0).optional(),
      realPrice: z.number().min(0).optional(),
      imageUrl: z.string().url().optional(),
      previewUrl: z.string().url().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, realPrice, ...rest } = input;
      await db.update(shopItems)
        .set({ ...rest, ...(realPrice !== undefined ? { realPrice: realPrice.toString() } : {}) })
        .where(eq(shopItems.id, id));
      return { success: true };
    }),

  // Admin: delete a shop item
  deleteItem: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(shopItems).set({ isActive: false }).where(eq(shopItems.id, input.id));
      return { success: true };
    }),

  // Admin: get all items (including inactive)
  getAllItems: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(shopItems).orderBy(desc(shopItems.sortOrder), desc(shopItems.createdAt));
  }),

  // Member: browse active shop items
  getItems: publicProcedure
    .input(z.object({
      type: z.enum(["sticker", "background", "emote", "profile_build", "gif_pack", "color_theme", "decoration"]).optional(),
      tier: z.enum(["free", "coin", "starter", "creator", "elite"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const items = await db.select().from(shopItems)
        .where(eq(shopItems.isActive, true))
        .orderBy(shopItems.sortOrder, desc(shopItems.createdAt));
      if (input?.type) return items.filter((i: ShopItem) => i.type === input.type);
      if (input?.tier) return items.filter((i: ShopItem) => i.tier === input.tier);
      return items;
    }),

  // Member: get my purchased items
  getMyPurchases: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select({ purchase: userPurchases, item: shopItems })
      .from(userPurchases)
      .innerJoin(shopItems, eq(userPurchases.shopItemId, shopItems.id))
      .where(eq(userPurchases.userId, ctx.user.id))
      .orderBy(desc(userPurchases.createdAt));
  }),

  // Member: purchase with coins
  purchaseWithCoins: protectedProcedure
    .input(z.object({ shopItemId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Get item
      const [item] = await db.select().from(shopItems)
        .where(and(eq(shopItems.id, input.shopItemId), eq(shopItems.isActive, true)));
      if (!item) throw new Error("Item not found");
      if (!item.coinPrice || item.coinPrice <= 0) throw new Error("This item cannot be purchased with coins");

      // Check if already purchased
      const existing = await db.select().from(userPurchases)
        .where(and(eq(userPurchases.userId, ctx.user.id), eq(userPurchases.shopItemId, input.shopItemId)));
      if (existing.length > 0) throw new Error("You already own this item");

      // Record the purchase
      await db.insert(userPurchases).values({
        userId: ctx.user.id,
        shopItemId: input.shopItemId,
        purchaseType: "coins",
        coinSpent: item.coinPrice,
      });
      return { success: true, item };
    }),
});

/**
 * Anomaly Router - AI Guide Chatbot for Sanctuary
 */
const ANOMALY_SYSTEM_PROMPT = `You are Anomaly, an AI guide character for Sanctuary — the community platform built by Anom Originals (AO).

Your personality:
- Friendly, enthusiastic, and knowledgeable about the AO Universe
- You speak in a warm, slightly playful tone — like a helpful friend who knows everything about Sanctuary
- You use occasional emojis to keep things lively, but not excessively
- You are proud of Anom's creative work and the AO Universe

You know everything about:
- Sanctuary: the community platform at anomarsty.lol, built by Anom (Eliza Wood) of Anom Originals
- The 12 AO Divisions: Mission Hub, Financial District, Creator Worlds, Lounges, Games Hub, Anom's Corner, Work Gallery, Custom Services, Merch, Anomaly Division, Universe Map, and more
- Beings: the 6 character types members choose (Neon Phantom, Pixel Sage, Cyber Sprite, Data Wraith, Circuit Muse, Void Walker)
- Coins: Anom Coins (AC) earned through missions, games, and achievements — spent in the Coin Shop
- Missions: onboarding tasks that guide new members through Sanctuary features
- Pixel & Dot: Anom's animated kids series in development
- Tater Nugget: Anom's miniature pinscher and personal brand mascot
- The Pack Shop: premium cosmetic packs featuring Anom's custom art (stickers, backgrounds, bling icons, profile builds)
- SGS (Sanctuary Grade Score): member reputation score
- Privilege Tiers: Newcomer → Citizen → Member → Contributor → Guardian

When you don't know something specific, say so honestly and suggest the member explore that section of Sanctuary directly.
Keep responses concise — 2-4 sentences for simple questions, up to a short paragraph for complex ones.
Never break character. You are Anomaly, not an AI assistant.`;

const anomalyRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().max(2000),
          })
        ).min(1).max(50),
      })
    )
    .mutation(async ({ input }) => {
      const llmMessages: LLMMessage[] = [
        { role: "system", content: ANOMALY_SYSTEM_PROMPT },
        ...input.messages.map((m): LLMMessage => ({ role: m.role, content: m.content })),
      ];
      const response = await invokeLLM({ messages: llmMessages });
      const reply = response.choices?.[0]?.message?.content ?? "I hit a glitch — try again! 🌀";
      return { reply };
    }),
});

/**
 * Admin Router — content editing, documents (admin only)
 */
const adminRouter = router({
  content: router({
    getAll: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(siteContent).orderBy(asc(siteContent.page), asc(siteContent.label));
    }),
    set: adminProcedure
      .input(z.object({
        contentKey: z.string().min(1).max(256),
        label: z.string().min(1).max(256),
        page: z.string().min(1).max(128),
        value: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(siteContent).values({
          contentKey: input.contentKey,
          label: input.label,
          page: input.page,
          value: input.value,
          updatedBy: ctx.user.id,
        }).onDuplicateKeyUpdate({
          set: { value: input.value, updatedBy: ctx.user.id },
        });
        return { success: true };
      }),
    getByKey: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const rows = await db.select().from(siteContent).where(eq(siteContent.contentKey, input.key)).limit(1);
        return rows[0] ?? null;
      }),
  }),
  adminFiles: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(adminFiles).orderBy(desc(adminFiles.uploadedAt));
    }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.delete(adminFiles).where(eq(adminFiles.id, input.id));
        return { success: true };
      }),
  }),
  docs: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(adminDocuments).orderBy(desc(adminDocuments.updatedAt));
    }),
    get: adminProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const rows = await db.select().from(adminDocuments).where(eq(adminDocuments.slug, input.slug)).limit(1);
        return rows[0] ?? null;
      }),
    upsert: adminProcedure
      .input(z.object({
        slug: z.string().min(1).max(256),
        title: z.string().min(1).max(256),
        content: z.string(),
        category: z.string().max(128).default("general"),
        tags: z.array(z.string().max(64)).max(20).default([]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const tagsJson = JSON.stringify(input.tags);
        await db.insert(adminDocuments).values({ ...input, tags: tagsJson }).onDuplicateKeyUpdate({
          set: { title: input.title, content: input.content, category: input.category, tags: tagsJson },
        });
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.delete(adminDocuments).where(eq(adminDocuments.slug, input.slug));
        return { success: true };
      }),
  }),
});

/**
 * Main App Router - Combines all feature routers
 */
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Sanctuary Features
  missions: missionRouter,
  coins: coinRouter,
  games: gamesRouter,
  profiles: profileRouter,
  feed: feedRouter,
  lounges: loungeRouter,
  owner: ownerRouter,
  shop: shopRouter,
  anomaly: anomalyRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
