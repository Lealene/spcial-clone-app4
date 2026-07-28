import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_areas_amenities_icon" AS ENUM('golf', 'marina', 'beach', 'racquet', 'fitness', 'dining', 'trails', 'pool', 'club', 'spa', 'gate', 'dog');
  CREATE TYPE "public"."enum_areas_kind" AS ENUM('community', 'city');
  CREATE TABLE "areas_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "areas_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_areas_amenities_icon",
  	"title" varchar
  );
  
  CREATE TABLE "areas_clubs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "areas_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "areas_review_bars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"pct" numeric,
  	"score" varchar
  );
  
  CREATE TABLE "areas_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"who" varchar,
  	"meta" varchar
  );
  
  CREATE TABLE "areas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_areas_kind" NOT NULL,
  	"city" varchar NOT NULL,
  	"county" varchar NOT NULL,
  	"mls_area_major" varchar NOT NULL,
  	"sync_enabled" boolean DEFAULT true,
  	"last_synced_at" timestamp(3) with time zone,
  	"blurb" varchar,
  	"phone" varchar,
  	"about" jsonb,
  	"rating" numeric,
  	"review_count" numeric,
  	"active_count" numeric,
  	"price_min" numeric,
  	"price_max" numeric,
  	"avg_price_per_sqft" numeric,
  	"beds_min" numeric,
  	"beds_max" numeric,
  	"sqft_min" numeric,
  	"sqft_max" numeric,
  	"hoa_min" numeric,
  	"hoa_max" numeric,
  	"year_built_min" numeric,
  	"year_built_max" numeric,
  	"is55_plus" boolean,
  	"is_gated" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "areas_id" integer;
  ALTER TABLE "areas_gallery" ADD CONSTRAINT "areas_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "areas_gallery" ADD CONSTRAINT "areas_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas_amenities" ADD CONSTRAINT "areas_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas_clubs" ADD CONSTRAINT "areas_clubs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas_faqs" ADD CONSTRAINT "areas_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas_review_bars" ADD CONSTRAINT "areas_review_bars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas_reviews" ADD CONSTRAINT "areas_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "areas_gallery_order_idx" ON "areas_gallery" USING btree ("_order");
  CREATE INDEX "areas_gallery_parent_id_idx" ON "areas_gallery" USING btree ("_parent_id");
  CREATE INDEX "areas_gallery_image_idx" ON "areas_gallery" USING btree ("image_id");
  CREATE INDEX "areas_amenities_order_idx" ON "areas_amenities" USING btree ("_order");
  CREATE INDEX "areas_amenities_parent_id_idx" ON "areas_amenities" USING btree ("_parent_id");
  CREATE INDEX "areas_clubs_order_idx" ON "areas_clubs" USING btree ("_order");
  CREATE INDEX "areas_clubs_parent_id_idx" ON "areas_clubs" USING btree ("_parent_id");
  CREATE INDEX "areas_faqs_order_idx" ON "areas_faqs" USING btree ("_order");
  CREATE INDEX "areas_faqs_parent_id_idx" ON "areas_faqs" USING btree ("_parent_id");
  CREATE INDEX "areas_review_bars_order_idx" ON "areas_review_bars" USING btree ("_order");
  CREATE INDEX "areas_review_bars_parent_id_idx" ON "areas_review_bars" USING btree ("_parent_id");
  CREATE INDEX "areas_reviews_order_idx" ON "areas_reviews" USING btree ("_order");
  CREATE INDEX "areas_reviews_parent_id_idx" ON "areas_reviews" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "areas_slug_idx" ON "areas" USING btree ("slug");
  CREATE INDEX "areas_mls_area_major_idx" ON "areas" USING btree ("mls_area_major");
  CREATE INDEX "areas_updated_at_idx" ON "areas" USING btree ("updated_at");
  CREATE INDEX "areas_created_at_idx" ON "areas" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_areas_id_idx" ON "payload_locked_documents_rels" USING btree ("areas_id");`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "areas_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "areas_amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "areas_clubs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "areas_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "areas_review_bars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "areas_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "areas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "areas_gallery" CASCADE;
  DROP TABLE "areas_amenities" CASCADE;
  DROP TABLE "areas_clubs" CASCADE;
  DROP TABLE "areas_faqs" CASCADE;
  DROP TABLE "areas_review_bars" CASCADE;
  DROP TABLE "areas_reviews" CASCADE;
  DROP TABLE "areas" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_areas_fk";
  
  DROP INDEX "payload_locked_documents_rels_areas_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "areas_id";
  DROP TYPE "public"."enum_areas_amenities_icon";
  DROP TYPE "public"."enum_areas_kind";`);
}
