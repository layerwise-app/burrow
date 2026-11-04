CREATE TABLE `app_secrets` (
	`name` text PRIMARY KEY,
	`value` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `early_access_signups` (
	`id` text PRIMARY KEY,
	`email` text NOT NULL UNIQUE,
	`github_username` text,
	`team_size` text NOT NULL,
	`owner_notified_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signup_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`visitor_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `early_access_signups_notified_idx` ON `early_access_signups` (`owner_notified_at`);--> statement-breakpoint
CREATE INDEX `signup_attempts_visitor_idx` ON `signup_attempts` (`visitor_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `signup_attempts_created_idx` ON `signup_attempts` (`created_at`);--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
DROP TABLE `verification`;