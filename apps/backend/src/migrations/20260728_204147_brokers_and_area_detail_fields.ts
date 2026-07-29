import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "brokers" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "title" varchar NOT NULL,
      "brokerage" varchar NOT NULL,
      "concierge_label" varchar DEFAULT 'Your {community} Concierge',
      "headshot_id" integer,
      "phone" varchar,
      "email" varchar,
      "bio" varchar,
      "signature" varchar,
      "rating" numeric,
      "review_count" numeric,
      "avg_response_minutes" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "brokers_credentials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" varchar NOT NULL,
      "label" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "areas_facts" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "value" varchar
    );

    CREATE TABLE IF NOT EXISTS "areas_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "areas_id" integer
    );

    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "broker_id" integer;
    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "detail_blurb" varchar;
    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "photo_count" numeric;
    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "sold_count" numeric;
    ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "broker_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "brokers_id" integer;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "brokers_credentials" ADD CONSTRAINT "brokers_credentials_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."brokers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "brokers" ADD CONSTRAINT "brokers_headshot_id_media_id_fk"
        FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "areas_facts" ADD CONSTRAINT "areas_facts_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "areas_rels" ADD CONSTRAINT "areas_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "areas_rels" ADD CONSTRAINT "areas_rels_areas_fk"
        FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "areas" ADD CONSTRAINT "areas_broker_id_brokers_id_fk"
        FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "listings" ADD CONSTRAINT "listings_broker_id_brokers_id_fk"
        FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brokers_fk"
        FOREIGN KEY ("brokers_id") REFERENCES "public"."brokers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "brokers_credentials_order_idx" ON "brokers_credentials" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "brokers_credentials_parent_id_idx" ON "brokers_credentials" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "brokers_slug_idx" ON "brokers" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "brokers_headshot_idx" ON "brokers" USING btree ("headshot_id");
    CREATE INDEX IF NOT EXISTS "brokers_updated_at_idx" ON "brokers" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "brokers_created_at_idx" ON "brokers" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "areas_facts_order_idx" ON "areas_facts" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "areas_facts_parent_id_idx" ON "areas_facts" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "areas_rels_order_idx" ON "areas_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "areas_rels_parent_idx" ON "areas_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "areas_rels_path_idx" ON "areas_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "areas_rels_areas_id_idx" ON "areas_rels" USING btree ("areas_id");
    CREATE INDEX IF NOT EXISTS "areas_broker_idx" ON "areas" USING btree ("broker_id");
    CREATE INDEX IF NOT EXISTS "listings_broker_idx" ON "listings" USING btree ("broker_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_brokers_id_idx" ON "payload_locked_documents_rels" USING btree ("brokers_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "areas" DROP CONSTRAINT IF EXISTS "areas_broker_id_brokers_id_fk";
    ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_broker_id_brokers_id_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_brokers_fk";

    DROP INDEX IF EXISTS "areas_broker_idx";
    DROP INDEX IF EXISTS "listings_broker_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_brokers_id_idx";

    ALTER TABLE "areas" DROP COLUMN IF EXISTS "broker_id";
    ALTER TABLE "areas" DROP COLUMN IF EXISTS "detail_blurb";
    ALTER TABLE "areas" DROP COLUMN IF EXISTS "photo_count";
    ALTER TABLE "areas" DROP COLUMN IF EXISTS "sold_count";
    ALTER TABLE "listings" DROP COLUMN IF EXISTS "broker_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "brokers_id";

    DROP TABLE IF EXISTS "areas_rels" CASCADE;
    DROP TABLE IF EXISTS "areas_facts" CASCADE;
    DROP TABLE IF EXISTS "brokers_credentials" CASCADE;
    DROP TABLE IF EXISTS "brokers" CASCADE;
  `);
}
