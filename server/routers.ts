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
 * Profile Router - User profiles and customization
 */
const profileRouter = router({
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
  profiles: profileRouter,
  feed: feedRouter,
  lounges: loungeRouter,
});

export type AppRouter = typeof appRouter;
