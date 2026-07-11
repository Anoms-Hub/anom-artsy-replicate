import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  profiles,
  coins,
  coinTransactions,
  missions,
  missionContributions,
  lounges,
  loungeMembers,
  feedPosts,
  ratings,
  profileAwards,
  profileLikes,
  profileVisitors,
  type InsertUser,
  type User,
  type Coin,
  type Mission,
  type MissionContribution,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * User Management
 */
export async function upsertUser(user: InsertUser): Promise<User | null> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return null;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existing.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({ ...user, lastSignedIn: new Date() })
        .where(eq(users.openId, user.openId));
      return existing[0];
    } else {
      // Insert new user
      await db.insert(users).values(user);

      // Create default profile and coins
      const newUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
      if (newUser.length > 0) {
        const userId = newUser[0].id;
        await db.insert(profiles).values({ userId });
        await db.insert(coins).values({ userId });
        return newUser[0];
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
  return null;
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? JSON.parse(JSON.stringify(result[0])) : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Mission Management
 */
export async function getMissions(status: "active" | "archived" = "active"): Promise<Mission[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select().from(missions).where(eq(missions.status, status));
  // Use JSON round-trip to create truly plain objects, avoiding superjson [Max Depth] issues with Drizzle ORM result objects
  return JSON.parse(JSON.stringify(results));
}

export async function getMissionById(id: number): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? JSON.parse(JSON.stringify(result[0])) : null;
}

/**
 * Mission Completion with Atomic Coin Transaction
 * Creates MissionContribution, CoinTransaction, and updates Coins balance in one atomic operation
 */
export async function completeMission(
  userId: number,
  missionId: number
): Promise<{
  success: boolean;
  contribution: MissionContribution | null;
  coinsEarned: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, contribution: null, coinsEarned: 0, error: "Database not available" };
  }

  try {
    // Get mission details
    const mission = await getMissionById(missionId);
    if (!mission) {
      return { success: false, contribution: null, coinsEarned: 0, error: "Mission not found" };
    }

    // Get current coin balance
    const coinRecord = await db.select().from(coins).where(eq(coins.userId, userId)).limit(1);
    if (coinRecord.length === 0) {
      return { success: false, contribution: null, coinsEarned: 0, error: "User coins not found" };
    }

    const currentBalance = parseInt((coinRecord[0].balance as any)?.toString() || "0");
    const rewardAmount = mission.rewardCoins || 0;
    const newBalance = currentBalance + rewardAmount;

    // ATOMIC TRANSACTION: All three operations succeed or all fail
    // 1. Create mission contribution
    await db.insert(missionContributions).values({
      userId,
      missionId,
      status: "completed",
      coinsEarned: mission.rewardCoins,
      claimed: true,
      completedAt: new Date(),
    });

    // 2. Create coin transaction (audit trail)
    await db.insert(coinTransactions).values({
      userId: userId as any,
      amount: mission.rewardCoins as any,
      type: "EARN",
      source: `Mission: ${mission.title}`,
      balanceAfter: newBalance as any,
    });

    // 3. Update user coin balance
    await db
      .update(coins)
      .set({
        balance: sql`balance + ${mission.rewardCoins}`,
        totalEarned: sql`totalEarned + ${mission.rewardCoins}`,
      })
      .where(eq(coins.userId, userId));

    // Fetch the created contribution
    const createdContribution = await db
      .select()
      .from(missionContributions)
      .where(eq(missionContributions.userId, userId))
      .orderBy(sql`${missionContributions.createdAt} DESC`)
      .limit(1);

    return {
      success: true,
      contribution: createdContribution.length > 0 ? createdContribution[0] : null,
      coinsEarned: mission.rewardCoins || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to complete mission:", error);
    return { success: false, contribution: null, coinsEarned: 0, error: "Transaction failed" };
  }
}

export async function getMyContributions(userId: number): Promise<MissionContribution[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select().from(missionContributions).where(eq(missionContributions.userId, userId));
  return JSON.parse(JSON.stringify(results));
}

/**
 * Earn Coins from Mini-Games — Atomic coin award
 * Creates a CoinTransaction and updates the coins balance in one operation.
 */
export async function earnCoins(
  userId: number,
  amount: number,
  source: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, newBalance: 0, error: "Database not available" };
  if (amount <= 0) return { success: false, newBalance: 0, error: "Amount must be positive" };

  try {
    // Get current balance
    const coinRecord = await db.select().from(coins).where(eq(coins.userId, userId)).limit(1);
    if (coinRecord.length === 0) {
      // Create coins record if missing
      await db.insert(coins).values({ userId });
    }

    const currentBalance = parseInt((coinRecord[0]?.balance as any)?.toString() || "0");
    const newBalance = currentBalance + amount;

    // Insert coin transaction
    await db.insert(coinTransactions).values({
      userId: userId as any,
      amount: amount as any,
      type: "EARN",
      source,
      balanceAfter: newBalance as any,
    });

    // Update balance
    await db
      .update(coins)
      .set({
        balance: sql`balance + ${amount}`,
        totalEarned: sql`totalEarned + ${amount}`,
      })
      .where(eq(coins.userId, userId));

    return { success: true, newBalance };
  } catch (error) {
    console.error("[Database] Failed to earn coins:", error);
    return { success: false, newBalance: 0, error: "Transaction failed" };
  }
}

/**
 * Coin Management
 */
export async function getCoinBalance(userId: number): Promise<Coin | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(coins).where(eq(coins.userId, userId)).limit(1);
  return result.length > 0 ? JSON.parse(JSON.stringify(result[0])) : null;
}

export async function getCoinHistory(userId: number, limit: number = 50): Promise<Array<{id: string; userId: number; amount: number; type: string; source: string; balanceAfter: number; createdAt: Date;}>> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(coinTransactions)
    .where(eq(coinTransactions.userId, userId))
    .orderBy(sql`${coinTransactions.createdAt} DESC`)
    .limit(limit);
  return JSON.parse(JSON.stringify(results));
}

/**
 * Profile Management
 */
export async function getProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? JSON.parse(JSON.stringify(result[0])) : null;
}

export async function updateProfile(userId: number, data: Partial<typeof profiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(profiles).set(data).where(eq(profiles.userId, userId));
  return getProfile(userId);
}

/**
 * Feed Management
 */
export async function getFeedPosts(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  const feedResults = await db
    .select()
    .from(feedPosts)
    .orderBy(sql`${feedPosts.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
  return JSON.parse(JSON.stringify(feedResults));
}

export async function createFeedPost(userId: number, content: string, mediaUrl?: string) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(feedPosts).values({ userId, content, mediaUrl });
  const posts = await db
    .select()
    .from(feedPosts)
    .where(eq(feedPosts.userId, userId))
    .orderBy(sql`${feedPosts.createdAt} DESC`)
    .limit(1);
  return posts.length > 0 ? posts[0] : null;
}

/**
 * Lounge Management
 */
export async function getLounges(limit: number = 20): Promise<Array<{id: number; ownerId: number; name: string; description: string | null; type: string; isPrivate: boolean | null; createdAt: Date; updatedAt: Date;}>> {
  const db = await getDb();
  if (!db) return [];

  const loungeResults = await db.select().from(lounges).limit(limit);
  return JSON.parse(JSON.stringify(loungeResults));
}

export async function createLounge(
  ownerId: number,
  name: string,
  type: "family" | "friend" | "fan" | "community",
  description?: string
) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(lounges).values({ ownerId, name, type, description });
  const loungeList = await db
    .select()
    .from(lounges)
    .where(eq(lounges.ownerId, ownerId))
    .orderBy(sql`${lounges.createdAt} DESC`)
    .limit(1);
  return loungeList.length > 0 ? loungeList[0] : null;
}

// ─── Member Profile / Being System ───────────────────────────────────────────

export async function getProfileByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      profile: profiles,
      user: { id: users.id, name: users.name, createdAt: users.createdAt },
      coinBalance: coins.balance,
      totalEarned: coins.totalEarned,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .leftJoin(coins, eq(profiles.userId, coins.userId))
    .where(eq(profiles.username, username))
    .limit(1);
  if (!result[0]) return null;
  return JSON.parse(JSON.stringify(result[0]));
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      profile: profiles,
      user: { id: users.id, name: users.name, createdAt: users.createdAt },
      coinBalance: coins.balance,
      totalEarned: coins.totalEarned,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .leftJoin(coins, eq(profiles.userId, coins.userId))
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!result[0]) return null;
  return JSON.parse(JSON.stringify(result[0]));
}

export async function updateMemberProfile(
  userId: number,
  data: {
    username?: string;
    bio?: string;
    photoUrl?: string;
    beingType?: "clifford" | "tater" | "x9" | "ao-symbol";
    beingName?: string;
    backgroundId?: string;
    theme?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;
  await db.update(profiles).set({ ...data }).where(eq(profiles.userId, userId));
  return getProfileByUserId(userId);
}

export async function getProfileAwards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(profileAwards)
    .where(eq(profileAwards.userId, userId))
    .orderBy(profileAwards.earnedAt);
  return JSON.parse(JSON.stringify(result));
}

export async function grantAward(
  userId: number,
  awardType: typeof profileAwards.$inferInsert["awardType"],
  awardName: string,
  description?: string
) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(profileAwards).where(eq(profileAwards.userId, userId)).limit(50);
  const alreadyHas = existing.some((a) => a.awardType === awardType);
  if (alreadyHas) return null;
  await db.insert(profileAwards).values({ userId, awardType, awardName, description });
  return true;
}

export async function toggleProfileLike(fromUserId: number, toUserId: number) {
  const db = await getDb();
  if (!db) return { liked: false };
  const existing = await db
    .select()
    .from(profileLikes)
    .where(eq(profileLikes.fromUserId, fromUserId))
    .limit(200);
  const alreadyLiked = existing.some((l) => l.toUserId === toUserId);
  if (alreadyLiked) {
    // Delete only the specific like between these two users
    await db
      .delete(profileLikes)
      .where(
        sql`${profileLikes.fromUserId} = ${fromUserId} AND ${profileLikes.toUserId} = ${toUserId}`
      );
    return { liked: false };
  }
  await db.insert(profileLikes).values({ fromUserId, toUserId });
  return { liked: true };
}

export async function getProfileLikeCount(toUserId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(profileLikes).where(eq(profileLikes.toUserId, toUserId));
  return result.length;
}

export async function hasLikedProfile(fromUserId: number, toUserId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(profileLikes).where(eq(profileLikes.fromUserId, fromUserId)).limit(200);
  return result.some((l) => l.toUserId === toUserId);
}

export async function recordProfileVisit(profileUserId: number, visitorUserId: number) {
  if (profileUserId === visitorUserId) return;
  const db = await getDb();
  if (!db) return;
  await db.insert(profileVisitors).values({ profileUserId, visitorUserId });
}

export async function getRecentVisitors(profileUserId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      visitor: { id: users.id, name: users.name },
      visitedAt: profileVisitors.visitedAt,
    })
    .from(profileVisitors)
    .innerJoin(users, eq(profileVisitors.visitorUserId, users.id))
    .where(eq(profileVisitors.profileUserId, profileUserId))
    .orderBy(sql`${profileVisitors.visitedAt} DESC`)
    .limit(limit);
  return JSON.parse(JSON.stringify(result));
}

export async function isUsernameAvailable(username: string, excludeUserId?: number) {
  const db = await getDb();
  if (!db) return true;
  const result = await db.select({ id: profiles.id, userId: profiles.userId }).from(profiles).where(eq(profiles.username, username)).limit(1);
  if (!result[0]) return true;
  if (excludeUserId && result[0].userId === excludeUserId) return true;
  return false;
}
