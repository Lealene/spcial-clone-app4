import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_privacy_policy_seo_canonical_mode" AS ENUM('auto', 'custom');
  CREATE TYPE "public"."enum_privacy_policy_seo_twitter_card" AS ENUM('summary', 'summary_large_image');
  CREATE TABLE "privacy_policy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Privacy Policy' NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"intro" varchar,
  	"body" jsonb NOT NULL,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_mode" "enum_privacy_policy_seo_canonical_mode" DEFAULT 'auto',
  	"seo_canonical_url" varchar,
  	"seo_index" boolean DEFAULT true,
  	"seo_follow" boolean DEFAULT true,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_og_image_alt" varchar,
  	"seo_twitter_card" "enum_privacy_policy_seo_twitter_card" DEFAULT 'summary_large_image',
  	"seo_twitter_title" varchar,
  	"seo_twitter_description" varchar,
  	"seo_twitter_image_id" integer,
  	"seo_twitter_image_alt" varchar,
  	"seo_include_in_sitemap" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "privacy_policy" ADD CONSTRAINT "privacy_policy_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_policy" ADD CONSTRAINT "privacy_policy_seo_twitter_image_id_media_id_fk" FOREIGN KEY ("seo_twitter_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "privacy_policy_seo_seo_og_image_idx" ON "privacy_policy" USING btree ("seo_og_image_id");
  CREATE INDEX "privacy_policy_seo_seo_twitter_image_idx" ON "privacy_policy" USING btree ("seo_twitter_image_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "privacy_policy" CASCADE;
  DROP TYPE "public"."enum_privacy_policy_seo_canonical_mode";
  DROP TYPE "public"."enum_privacy_policy_seo_twitter_card";`);
}
