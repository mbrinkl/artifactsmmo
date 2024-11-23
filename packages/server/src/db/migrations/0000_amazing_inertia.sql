CREATE TABLE `character_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`activityName` text,
	`activityParams` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `character_activity_name_unique` ON `character_activity` (`name`);