import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_areas_seo_canonical_mode" AS ENUM('auto', 'custom');
  CREATE TYPE "public"."enum_areas_seo_twitter_card" AS ENUM('summary', 'summary_large_image');
  CREATE TYPE "public"."enum_listings_seo_canonical_mode" AS ENUM('auto', 'custom');
  CREATE TYPE "public"."enum_listings_seo_twitter_card" AS ENUM('summary', 'summary_large_image');
  CREATE TYPE "public"."enum_site_settings_opening_hours_days" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  CREATE TABLE "site_settings_opening_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_site_settings_opening_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_area_served" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'MVP Realty' NOT NULL,
  	"legal_name" varchar,
  	"description" varchar,
  	"license_number" varchar,
  	"price_range" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"address_street_address" varchar,
  	"address_address_locality" varchar,
  	"address_address_region" varchar DEFAULT 'FL',
  	"address_postal_code" varchar,
  	"address_address_country" varchar DEFAULT 'US',
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"logo_id" integer,
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "areas" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_canonical_mode" "enum_areas_seo_canonical_mode" DEFAULT 'auto';
  ALTER TABLE "areas" ADD COLUMN "seo_canonical_url" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_index" boolean DEFAULT true;
  ALTER TABLE "areas" ADD COLUMN "seo_follow" boolean DEFAULT true;
  ALTER TABLE "areas" ADD COLUMN "seo_og_title" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_og_description" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_og_image_id" integer;
  ALTER TABLE "areas" ADD COLUMN "seo_og_image_alt" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_twitter_card" "enum_areas_seo_twitter_card" DEFAULT 'summary_large_image';
  ALTER TABLE "areas" ADD COLUMN "seo_twitter_title" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_twitter_description" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_twitter_image_id" integer;
  ALTER TABLE "areas" ADD COLUMN "seo_twitter_image_alt" varchar;
  ALTER TABLE "areas" ADD COLUMN "seo_include_in_sitemap" boolean DEFAULT true;
  ALTER TABLE "listings" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_canonical_mode" "enum_listings_seo_canonical_mode" DEFAULT 'auto';
  ALTER TABLE "listings" ADD COLUMN "seo_canonical_url" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_index" boolean DEFAULT true;
  ALTER TABLE "listings" ADD COLUMN "seo_follow" boolean DEFAULT true;
  ALTER TABLE "listings" ADD COLUMN "seo_og_title" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_og_description" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_og_image_id" integer;
  ALTER TABLE "listings" ADD COLUMN "seo_og_image_alt" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_twitter_card" "enum_listings_seo_twitter_card" DEFAULT 'summary_large_image';
  ALTER TABLE "listings" ADD COLUMN "seo_twitter_title" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_twitter_description" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_twitter_image_id" integer;
  ALTER TABLE "listings" ADD COLUMN "seo_twitter_image_alt" varchar;
  ALTER TABLE "listings" ADD COLUMN "seo_include_in_sitemap" boolean DEFAULT true;
  ALTER TABLE "site_settings_opening_hours_days" ADD CONSTRAINT "site_settings_opening_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings_opening_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_opening_hours" ADD CONSTRAINT "site_settings_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_area_served" ADD CONSTRAINT "site_settings_area_served_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_same_as" ADD CONSTRAINT "site_settings_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_opening_hours_days_order_idx" ON "site_settings_opening_hours_days" USING btree ("order");
  CREATE INDEX "site_settings_opening_hours_days_parent_idx" ON "site_settings_opening_hours_days" USING btree ("parent_id");
  CREATE INDEX "site_settings_opening_hours_order_idx" ON "site_settings_opening_hours" USING btree ("_order");
  CREATE INDEX "site_settings_opening_hours_parent_id_idx" ON "site_settings_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_area_served_order_idx" ON "site_settings_area_served" USING btree ("_order");
  CREATE INDEX "site_settings_area_served_parent_id_idx" ON "site_settings_area_served" USING btree ("_parent_id");
  CREATE INDEX "site_settings_same_as_order_idx" ON "site_settings_same_as" USING btree ("_order");
  CREATE INDEX "site_settings_same_as_parent_id_idx" ON "site_settings_same_as" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  ALTER TABLE "areas" ADD CONSTRAINT "areas_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "areas" ADD CONSTRAINT "areas_seo_twitter_image_id_media_id_fk" FOREIGN KEY ("seo_twitter_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_seo_twitter_image_id_media_id_fk" FOREIGN KEY ("seo_twitter_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "areas_seo_seo_og_image_idx" ON "areas" USING btree ("seo_og_image_id");
  CREATE INDEX "areas_seo_seo_twitter_image_idx" ON "areas" USING btree ("seo_twitter_image_id");
  CREATE INDEX "listings_seo_seo_og_image_idx" ON "listings" USING btree ("seo_og_image_id");
  CREATE INDEX "listings_seo_seo_twitter_image_idx" ON "listings" USING btree ("seo_twitter_image_id");`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_opening_hours_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_opening_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_area_served" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_opening_hours_days" CASCADE;
  DROP TABLE "site_settings_opening_hours" CASCADE;
  DROP TABLE "site_settings_area_served" CASCADE;
  DROP TABLE "site_settings_same_as" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  ALTER TABLE "areas" DROP CONSTRAINT "areas_seo_og_image_id_media_id_fk";
  
  ALTER TABLE "areas" DROP CONSTRAINT "areas_seo_twitter_image_id_media_id_fk";
  
  ALTER TABLE "listings" DROP CONSTRAINT "listings_seo_og_image_id_media_id_fk";
  
  ALTER TABLE "listings" DROP CONSTRAINT "listings_seo_twitter_image_id_media_id_fk";
  
  DROP INDEX "areas_seo_seo_og_image_idx";
  DROP INDEX "areas_seo_seo_twitter_image_idx";
  DROP INDEX "listings_seo_seo_og_image_idx";
  DROP INDEX "listings_seo_seo_twitter_image_idx";
  ALTER TABLE "areas" DROP COLUMN "seo_meta_title";
  ALTER TABLE "areas" DROP COLUMN "seo_meta_description";
  ALTER TABLE "areas" DROP COLUMN "seo_canonical_mode";
  ALTER TABLE "areas" DROP COLUMN "seo_canonical_url";
  ALTER TABLE "areas" DROP COLUMN "seo_index";
  ALTER TABLE "areas" DROP COLUMN "seo_follow";
  ALTER TABLE "areas" DROP COLUMN "seo_og_title";
  ALTER TABLE "areas" DROP COLUMN "seo_og_description";
  ALTER TABLE "areas" DROP COLUMN "seo_og_image_id";
  ALTER TABLE "areas" DROP COLUMN "seo_og_image_alt";
  ALTER TABLE "areas" DROP COLUMN "seo_twitter_card";
  ALTER TABLE "areas" DROP COLUMN "seo_twitter_title";
  ALTER TABLE "areas" DROP COLUMN "seo_twitter_description";
  ALTER TABLE "areas" DROP COLUMN "seo_twitter_image_id";
  ALTER TABLE "areas" DROP COLUMN "seo_twitter_image_alt";
  ALTER TABLE "areas" DROP COLUMN "seo_include_in_sitemap";
  ALTER TABLE "listings" DROP COLUMN "seo_meta_title";
  ALTER TABLE "listings" DROP COLUMN "seo_meta_description";
  ALTER TABLE "listings" DROP COLUMN "seo_canonical_mode";
  ALTER TABLE "listings" DROP COLUMN "seo_canonical_url";
  ALTER TABLE "listings" DROP COLUMN "seo_index";
  ALTER TABLE "listings" DROP COLUMN "seo_follow";
  ALTER TABLE "listings" DROP COLUMN "seo_og_title";
  ALTER TABLE "listings" DROP COLUMN "seo_og_description";
  ALTER TABLE "listings" DROP COLUMN "seo_og_image_id";
  ALTER TABLE "listings" DROP COLUMN "seo_og_image_alt";
  ALTER TABLE "listings" DROP COLUMN "seo_twitter_card";
  ALTER TABLE "listings" DROP COLUMN "seo_twitter_title";
  ALTER TABLE "listings" DROP COLUMN "seo_twitter_description";
  ALTER TABLE "listings" DROP COLUMN "seo_twitter_image_id";
  ALTER TABLE "listings" DROP COLUMN "seo_twitter_image_alt";
  ALTER TABLE "listings" DROP COLUMN "seo_include_in_sitemap";
  DROP TYPE "public"."enum_areas_seo_canonical_mode";
  DROP TYPE "public"."enum_areas_seo_twitter_card";
  DROP TYPE "public"."enum_listings_seo_canonical_mode";
  DROP TYPE "public"."enum_listings_seo_twitter_card";
  DROP TYPE "public"."enum_site_settings_opening_hours_days";`);
}
