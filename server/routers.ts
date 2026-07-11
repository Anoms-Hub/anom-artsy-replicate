import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
});

export type AppRouter = typeof appRouter;
