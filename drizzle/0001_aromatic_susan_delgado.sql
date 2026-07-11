CREATE TABLE `coin_transactions` (
	`id` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`source` varchar(255) NOT NULL,
	`balanceAfter` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coin_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0',
	`totalEarned` decimal(10,2) NOT NULL DEFAULT '0',
	`totalSpent` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coins_id` PRIMARY KEY(`id`),
	CONSTRAINT `coins_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `emotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`cost` int DEFAULT 0,
	`rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`mediaUrl` text,
	`likes` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feed_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lounge_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loungeId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','moderator','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lounge_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lounges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('family','friend','fan','community') NOT NULL DEFAULT 'community',
	`isPrivate` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lounges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mission_contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`missionId` int NOT NULL,
	`status` enum('pending','completed','verified') NOT NULL DEFAULT 'pending',
	`coinsEarned` int DEFAULT 0,
	`claimed` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mission_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(64) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`rewardCoins` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`photoUrl` text,
	`bio` text,
	`theme` varchar(64) DEFAULT 'neon-magenta',
	`customizationData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`raterId` int NOT NULL,
	`ratedUserId` int NOT NULL,
	`score` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_emotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emoteId` int NOT NULL,
	`acquiredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_emotes_id` PRIMARY KEY(`id`)
);
