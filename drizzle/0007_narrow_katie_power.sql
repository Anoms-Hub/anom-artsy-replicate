CREATE TABLE `admin_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(2048) NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`filename` varchar(512) NOT NULL,
	`mimetype` varchar(128) NOT NULL,
	`size` int NOT NULL DEFAULT 0,
	`category` varchar(64) NOT NULL DEFAULT 'files',
	`uploaded_at` bigint NOT NULL,
	`uploaded_by` varchar(128) NOT NULL DEFAULT 'admin',
	CONSTRAINT `admin_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_documents` MODIFY COLUMN `tags` varchar(1024) NOT NULL DEFAULT '[]';