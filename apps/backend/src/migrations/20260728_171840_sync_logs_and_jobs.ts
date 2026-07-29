import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sync_logs_trigger" AS ENUM('cron', 'manual');
  CREATE TYPE "public"."enum_sync_logs_status" AS ENUM('success', 'warning', 'error');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'syncBridgeListings', 'mirrorListingHero');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'syncBridgeListings', 'mirrorListingHero');
  CREATE TABLE "sync_logs_areas_warnings" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "sync_logs_areas_errors" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "sync_logs_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area_id" integer NOT NULL,
  	"area_slug" varchar,
  	"fetched" numeric NOT NULL,
  	"created" numeric NOT NULL,
  	"updated" numeric NOT NULL,
  	"deactivated" numeric NOT NULL
  );
  
  CREATE TABLE "sync_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"run_at" timestamp(3) with time zone NOT NULL,
  	"trigger" "enum_sync_logs_trigger" NOT NULL,
  	"duration_ms" numeric,
  	"status" "enum_sync_logs_status" NOT NULL,
  	"message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "listings" ADD COLUMN "hero_media_key" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sync_logs_id" integer;
  ALTER TABLE "sync_logs_areas_warnings" ADD CONSTRAINT "sync_logs_areas_warnings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sync_logs_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sync_logs_areas_errors" ADD CONSTRAINT "sync_logs_areas_errors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sync_logs_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sync_logs_areas" ADD CONSTRAINT "sync_logs_areas_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sync_logs_areas" ADD CONSTRAINT "sync_logs_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sync_logs_areas_warnings_order_idx" ON "sync_logs_areas_warnings" USING btree ("_order");
  CREATE INDEX "sync_logs_areas_warnings_parent_id_idx" ON "sync_logs_areas_warnings" USING btree ("_parent_id");
  CREATE INDEX "sync_logs_areas_errors_order_idx" ON "sync_logs_areas_errors" USING btree ("_order");
  CREATE INDEX "sync_logs_areas_errors_parent_id_idx" ON "sync_logs_areas_errors" USING btree ("_parent_id");
  CREATE INDEX "sync_logs_areas_order_idx" ON "sync_logs_areas" USING btree ("_order");
  CREATE INDEX "sync_logs_areas_parent_id_idx" ON "sync_logs_areas" USING btree ("_parent_id");
  CREATE INDEX "sync_logs_areas_area_idx" ON "sync_logs_areas" USING btree ("area_id");
  CREATE INDEX "sync_logs_updated_at_idx" ON "sync_logs" USING btree ("updated_at");
  CREATE INDEX "sync_logs_created_at_idx" ON "sync_logs" USING btree ("created_at");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sync_logs_fk" FOREIGN KEY ("sync_logs_id") REFERENCES "public"."sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_sync_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("sync_logs_id");`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sync_logs_areas_warnings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sync_logs_areas_errors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sync_logs_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sync_logs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sync_logs_areas_warnings" CASCADE;
  DROP TABLE "sync_logs_areas_errors" CASCADE;
  DROP TABLE "sync_logs_areas" CASCADE;
  DROP TABLE "sync_logs" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sync_logs_fk";
  
  DROP INDEX "payload_locked_documents_rels_sync_logs_id_idx";
  ALTER TABLE "listings" DROP COLUMN "hero_media_key";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sync_logs_id";
  DROP TYPE "public"."enum_sync_logs_trigger";
  DROP TYPE "public"."enum_sync_logs_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`);
}
