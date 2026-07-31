import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

/**
 * Drops every area review field: the rating/reviewCount columns, the reviewBars and
 * reviews tables, and the denormalized rating columns on the featuredCommunities
 * block (live and `_pages_v` draft copies).
 *
 * DESTRUCTIVE AND IRREVERSIBLE. `down` recreates the tables and columns so the
 * schema matches, but the authored quotes, reviewer names and scores are gone — they
 * lived nowhere else. Take a dump before running this against production.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "areas_review_bars" CASCADE;
  DROP TABLE "areas_reviews" CASCADE;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" DROP COLUMN "rating";
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" DROP COLUMN "reviews";
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" DROP COLUMN "reviews_label";
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" DROP COLUMN "rating";
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" DROP COLUMN "reviews";
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" DROP COLUMN "reviews_label";
  ALTER TABLE "areas" DROP COLUMN "rating";
  ALTER TABLE "areas" DROP COLUMN "review_count";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" ADD COLUMN "rating" numeric;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" ADD COLUMN "reviews" numeric;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" ADD COLUMN "reviews_label" varchar DEFAULT 'reviews';
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" ADD COLUMN "rating" numeric;
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" ADD COLUMN "reviews" numeric;
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" ADD COLUMN "reviews_label" varchar DEFAULT 'reviews';
  ALTER TABLE "areas" ADD COLUMN "rating" numeric;
  ALTER TABLE "areas" ADD COLUMN "review_count" numeric;
  ALTER TABLE "areas_review_bars" ADD CONSTRAINT "areas_review_bars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "areas_reviews" ADD CONSTRAINT "areas_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "areas_review_bars_order_idx" ON "areas_review_bars" USING btree ("_order");
  CREATE INDEX "areas_review_bars_parent_id_idx" ON "areas_review_bars" USING btree ("_parent_id");
  CREATE INDEX "areas_reviews_order_idx" ON "areas_reviews" USING btree ("_order");
  CREATE INDEX "areas_reviews_parent_id_idx" ON "areas_reviews" USING btree ("_parent_id");`);
}
