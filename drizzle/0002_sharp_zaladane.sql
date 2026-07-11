CREATE TABLE `profile_awards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`awardType` enum('patience','emotion','community','creativity','loyalty','discovery','guardian','financial-literacy','world-builder','ao-symbol') NOT NULL,
	`awardName` varchar(128) NOT NULL,
	`description` text,
	`isDisplayed` boolean NOT NULL DEFAULT true,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_awards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_visitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileUserId` int NOT NULL,
	`visitorUserId` int NOT NULL,
	`visitedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_visitors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `profiles` ADD `beingType` enum('clifford','tater','x9','ao-symbol');--> statement-breakpoint
ALTER TABLE `profiles` ADD `beingName` varchar(64);--> statement-breakpoint
ALTER TABLE `profiles` ADD `backgroundId` varchar(64) DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `profiles` ADD `socialGoodScore` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `privilegeTier` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `showcaseItems` json;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_username_unique` UNIQUE(`username`);