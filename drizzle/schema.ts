import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  bigint,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm/relations";
import { nanoid } from "nanoid";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User Profiles - Extended user information with customization
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  username: varchar("username", { length: 64 }).unique(),
  photoUrl: text("photoUrl"),
  bio: text("bio"),
  theme: varchar("theme", { length: 64 }).default("neon-magenta"),
  // Being / Avatar identity
  beingType: mysqlEnum("beingType", ["clifford", "tater", "x9", "ao-symbol"]),
  beingName: varchar("beingName", { length: 64 }),
  backgroundId: varchar("backgroundId", { length: 64 }).default("default"),
  // Social Good Score
  socialGoodScore: int("socialGoodScore").default(0).notNull(),
  // Privilege tier (0=newcomer, 1=citizen, 2=member, 3=contributor, 4=guardian)
  privilegeTier: int("privilegeTier").default(0).notNull(),
  // Showcase items (pinned content IDs as JSON array)
  showcaseItems: json("showcaseItems"),
  customizationData: json("customizationData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Anom Coin Economy - Track user currency
 */
export const coins = mysqlTable("coins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  totalEarned: decimal("totalEarned", { precision: 10, scale: 2 }).default("0").notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coin = typeof coins.$inferSelect;
export type InsertCoin = typeof coins.$inferInsert;

/**
 * Coin Transactions - Complete audit trail of all coin movements
 */
export const coinTransactions = mysqlTable("coin_transactions", {
  id: varchar("id", { length: 32 }).primaryKey().$defaultFn(() => nanoid(12)), // Auto-generated ID
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // +50 or -100
  type: varchar("type", { length: 64 }).notNull(), // EARN or SPEND
  source: varchar("source", { length: 255 }).notNull(), // Mission, Lounge, Game, Purchase
  balanceAfter: int("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = typeof coinTransactions.$inferInsert;

/**
 * Missions - Community contribution tasks
 */
export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 64 }).notNull(), // perimeter-sweep, resource-logistics, etc
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  rewardCoins: int("rewardCoins").default(0),
  // URL the user is sent to in order to complete this mission (e.g. /settings, /lounge)
  actionUrl: varchar("actionUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

/**
 * Mission Contributions - Track user contributions to missions
 */
export const missionContributions = mysqlTable("mission_contributions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  missionId: int("missionId").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "verified"]).default("pending").notNull(),
  coinsEarned: int("coinsEarned").default(0),
  claimed: boolean("claimed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MissionContribution = typeof missionContributions.$inferSelect;
export type InsertMissionContribution = typeof missionContributions.$inferInsert;

/**
 * Lounges - Community spaces/channels
 */
export const lounges = mysqlTable("lounges", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["family", "friend", "fan", "community"]).default("community").notNull(),
  isPrivate: boolean("isPrivate").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lounge = typeof lounges.$inferSelect;
export type InsertLounge = typeof lounges.$inferInsert;

/**
 * Lounge Members - Track membership in lounges
 */
export const loungeMembers = mysqlTable("lounge_members", {
  id: int("id").autoincrement().primaryKey(),
  loungeId: int("loungeId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "moderator", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type LoungeMember = typeof loungeMembers.$inferSelect;
export type InsertLoungeMember = typeof loungeMembers.$inferInsert;

/**
 * Emotes & Bling - Collectible expressions and decorative items
 */
export const emotes = mysqlTable("emotes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  cost: int("cost").default(0),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Emote = typeof emotes.$inferSelect;
export type InsertEmote = typeof emotes.$inferInsert;

/**
 * User Emotes - Track which emotes users own
 */
export const userEmotes = mysqlTable("user_emotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  emoteId: int("emoteId").notNull(),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
});

export type UserEmote = typeof userEmotes.$inferSelect;
export type InsertUserEmote = typeof userEmotes.$inferInsert;

/**
 * Feed Posts - User-generated content for the feed
 */
export const feedPosts = mysqlTable("feed_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("mediaUrl"),
  likes: int("likes").default(0),
  shares: int("shares").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedPost = typeof feedPosts.$inferInsert;

/**
 * Post Likes - Track user likes on feed posts
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Ratings - User rating system for contributions and content
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  raterId: int("raterId").notNull(),
  ratedUserId: int("ratedUserId").notNull(),
  score: int("score").notNull(), // 1-5
  category: varchar("category", { length: 64 }).notNull(), // contribution, creativity, helpfulness
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Profile Awards - Earned badges displayed on member profiles
 */
export const profileAwards = mysqlTable("profile_awards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  awardType: mysqlEnum("awardType", [
    "patience",
    "emotion",
    "community",
    "creativity",
    "loyalty",
    "discovery",
    "guardian",
    "financial-literacy",
    "world-builder",
    "ao-symbol"
  ]).notNull(),
  awardName: varchar("awardName", { length: 128 }).notNull(),
  description: text("description"),
  isDisplayed: boolean("isDisplayed").default(true).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type ProfileAward = typeof profileAwards.$inferSelect;
export type InsertProfileAward = typeof profileAwards.$inferInsert;

/**
 * Profile Likes - Members leaving hearts on other members' profiles
 */
export const profileLikes = mysqlTable("profile_likes", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfileLike = typeof profileLikes.$inferSelect;
export type InsertProfileLike = typeof profileLikes.$inferInsert;

/**
 * Profile Visitors - Private log of who visited a member's profile
 */
export const profileVisitors = mysqlTable("profile_visitors", {
  id: int("id").autoincrement().primaryKey(),
  profileUserId: int("profileUserId").notNull(),
  visitorUserId: int("visitorUserId").notNull(),
  visitedAt: timestamp("visitedAt").defaultNow().notNull(),
});

export type ProfileVisitor = typeof profileVisitors.$inferSelect;
export type InsertProfileVisitor = typeof profileVisitors.$inferInsert;

/**
 * Relations for type safety
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  coins: one(coins, {
    fields: [users.id],
    references: [coins.userId],
  }),
  coinTransactions: many(coinTransactions),
  missionContributions: many(missionContributions),
  lounges: many(lounges),
  loungeMembers: many(loungeMembers),
  userEmotes: many(userEmotes),
  feedPosts: many(feedPosts),
  postLikes: many(postLikes),
  ratingsGiven: many(ratings),
  profileAwards: many(profileAwards),
  profileLikesGiven: many(profileLikes, { relationName: "likesGiven" }),
  profileLikesReceived: many(profileLikes, { relationName: "likesReceived" }),
  profileVisits: many(profileVisitors, { relationName: "profileVisits" }),
  profileVisitors: many(profileVisitors, { relationName: "profileVisitors" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const coinsRelations = relations(coins, ({ one, many }) => ({
  user: one(users, {
    fields: [coins.userId],
    references: [users.id],
  }),
  transactions: many(coinTransactions),
}));

export const coinTransactionsRelations = relations(coinTransactions, ({ one }) => ({
  user: one(users, {
    fields: [coinTransactions.userId],
    references: [users.id],
  }),
}));

export const missionContributionsRelations = relations(missionContributions, ({ one }) => ({
  user: one(users, {
    fields: [missionContributions.userId],
    references: [users.id],
  }),
  mission: one(missions, {
    fields: [missionContributions.missionId],
    references: [missions.id],
  }),
}));

export const loungeRelations = relations(lounges, ({ one, many }) => ({
  owner: one(users, {
    fields: [lounges.ownerId],
    references: [users.id],
  }),
  members: many(loungeMembers),
}));

export const loungeMembersRelations = relations(loungeMembers, ({ one }) => ({
  lounge: one(lounges, {
    fields: [loungeMembers.loungeId],
    references: [lounges.id],
  }),
  user: one(users, {
    fields: [loungeMembers.userId],
    references: [users.id],
  }),
}));

export const userEmotesRelations = relations(userEmotes, ({ one }) => ({
  user: one(users, {
    fields: [userEmotes.userId],
    references: [users.id],
  }),
  emote: one(emotes, {
    fields: [userEmotes.emoteId],
    references: [emotes.id],
  }),
}));

export const feedPostsRelations = relations(feedPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [feedPosts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(feedPosts, {
    fields: [postLikes.postId],
    references: [feedPosts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  rater: one(users, {
    fields: [ratings.raterId],
    references: [users.id],
  }),
}));

export const profileAwardsRelations = relations(profileAwards, ({ one }) => ({
  user: one(users, {
    fields: [profileAwards.userId],
    references: [users.id],
  }),
}));

export const profileLikesRelations = relations(profileLikes, ({ one }) => ({
  fromUser: one(users, {
    fields: [profileLikes.fromUserId],
    references: [users.id],
    relationName: "likesGiven",
  }),
  toUser: one(users, {
    fields: [profileLikes.toUserId],
    references: [users.id],
    relationName: "likesReceived",
  }),
}));

export const profileVisitorsRelations = relations(profileVisitors, ({ one }) => ({
  profileUser: one(users, {
    fields: [profileVisitors.profileUserId],
    references: [users.id],
    relationName: "profileVisits",
  }),
  visitor: one(users, {
    fields: [profileVisitors.visitorUserId],
    references: [users.id],
    relationName: "profileVisitors",
  }),
}));

/**
 * Shop Items — cosmetic items created by Anom for the store
 */
export const shopItems = mysqlTable("shopItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["sticker", "background", "emote", "profile_build", "gif_pack", "color_theme", "decoration"]).notNull(),
  tier: mysqlEnum("tier", ["free", "coin", "starter", "creator", "elite"]).default("coin").notNull(),
  coinPrice: int("coinPrice").default(0),
  realPrice: decimal("realPrice", { precision: 10, scale: 2 }),
  imageUrl: text("imageUrl"),
  previewUrl: text("previewUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = typeof shopItems.$inferInsert;

/**
 * User Purchases — tracks which shop items a user has purchased/unlocked
 */
export const userPurchases = mysqlTable("userPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  shopItemId: int("shopItemId").notNull(),
  purchaseType: mysqlEnum("purchaseType", ["coins", "stripe", "achievement", "free"]).notNull(),
  coinSpent: int("coinSpent").default(0),
  stripePaymentId: varchar("stripePaymentId", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertUserPurchase = typeof userPurchases.$inferInsert;

export const shopItemsRelations = relations(shopItems, ({ many }) => ({
  purchases: many(userPurchases),
}));

export const userPurchasesRelations = relations(userPurchases, ({ one }) => ({
  user: one(users, {
    fields: [userPurchases.userId],
    references: [users.id],
  }),
  shopItem: one(shopItems, {
    fields: [userPurchases.shopItemId],
    references: [shopItems.id],
  }),
}));

/**
 * Site Content — editable text blocks managed by admin via inline editor
 */
export const siteContent = mysqlTable("site_content", {
  id: int("id").autoincrement().primaryKey(),
  contentKey: varchar("contentKey", { length: 256 }).notNull().unique(),
  label: varchar("label", { length: 256 }).notNull(),
  page: varchar("page", { length: 128 }).notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"),
});
export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

/**
 * Admin Documents — planning docs, concept docs, guides stored in admin panel
 */
export const adminDocuments = mysqlTable("admin_documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 128 }).notNull().default("general"),
  tags: varchar("tags", { length: 1024 }).notNull().default("[]"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AdminDocument = typeof adminDocuments.$inferSelect;
export type InsertAdminDocument = typeof adminDocuments.$inferInsert;
