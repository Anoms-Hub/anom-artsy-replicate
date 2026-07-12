/**
 * Monthly Coin Bonus — Heartbeat handler
 * Fires on the 1st of each month (project-level cron, §4a).
 * Awards coins to all users with an active subscription:
 *   Explorer  → 100 coins/month
 *   Creator   → 300 coins/month
 *   Founder   → 750 coins/month
 */

import type { Request, Response } from "express";
import { getDb } from "../db";
import { coinTransactions } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";

const PLAN_BONUS: Record<string, number> = {
  explorer: 100,
  creator: 300,
  founder: 750,
};

export async function monthlyCoinBonusHandler(req: Request, res: Response) {
  try {
    // Authenticate as cron caller
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only endpoint" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "DB unavailable" });

    // Find all active subscriptions using raw SQL to avoid import issues
    const [activeSubs] = await db.execute(
      `SELECT id, user_id as userId, plan_id as planId, status FROM user_subscriptions WHERE status = 'active'`
    ) as any;
    const subRows = (activeSubs as any[]) || [];

    let awarded = 0;
    let skipped = 0;

    for (const sub of subRows) {
      const bonus = PLAN_BONUS[sub.planId];
      if (!bonus) { skipped++; continue; }

      // Ensure coins row exists, then increment atomically
      await db.execute(
        `INSERT INTO coins (user_id, balance, total_earned, updated_at)
         VALUES (${sub.userId}, ${bonus}, ${bonus}, NOW())
         ON DUPLICATE KEY UPDATE
           balance = balance + ${bonus},
           total_earned = total_earned + ${bonus},
           updated_at = NOW()`
      );

      // Record the transaction (balanceAfter is approximate — exact value is in coins table)
      await db.insert(coinTransactions).values({
        userId: sub.userId,
        amount: bonus,
        type: "EARN",
        source: `Monthly ${sub.planId} membership bonus`,
        balanceAfter: 0, // approximate; real balance is in coins table
      });

      awarded++;
    }

    console.log(`[MonthlyCoinBonus] Awarded to ${awarded} subscribers, skipped ${skipped}`);
    return res.json({ ok: true, awarded, skipped });
  } catch (err: any) {
    console.error("[MonthlyCoinBonus] Error:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
