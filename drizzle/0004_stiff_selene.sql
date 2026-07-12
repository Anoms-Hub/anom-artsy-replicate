CREATE TABLE `shopItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`type` enum('sticker','background','emote','profile_build','gif_pack','color_theme','decoration') NOT NULL,
	`tier` enum('free','coin','starter','creator','elite') NOT NULL DEFAULT 'coin',
	`coinPrice` int DEFAULT 0,
	`realPrice` decimal(10,2),
	`imageUrl` text,
	`previewUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shopItemId` int NOT NULL,
	`purchaseType` enum('coins','stripe','achievement','free') NOT NULL,
	`coinSpent` int DEFAULT 0,
	`stripePaymentId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userPurchases_id` PRIMARY KEY(`id`)
);
