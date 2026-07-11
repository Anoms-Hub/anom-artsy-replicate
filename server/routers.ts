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
} from "./db";

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
        photoUrl: z.string().url().optional(),
        beingType: z.enum(["clifford", "tater", "x9", "ao-symbol"]).optional(),
        beingName: z.string().min(1).max(64).optional(),
        backgroundId: z.string().optional(),
        theme: z.string().optional(),
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
      return updateMemberProfile(ctx.user.id, input);
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
});

export type AppRouter = typeof appRouter;
