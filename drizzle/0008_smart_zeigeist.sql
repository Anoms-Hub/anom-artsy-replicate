CREATE TABLE `node_thumbnails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`node_id` varchar(128) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `node_thumbnails_id` PRIMARY KEY(`id`),
	CONSTRAINT `node_thumbnails_node_id_unique` UNIQUE(`node_id`)
);
