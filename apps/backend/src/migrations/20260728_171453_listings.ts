import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_listings_features" AS ENUM('waterfront', 'private-pool', 'golf', 'gated', '55-plus');
  CREATE TYPE "public"."enum_listings_floor_plan_tone" AS ENUM('primary', 'common');
  CREATE TYPE "public"."enum_listings_property_type" AS ENUM('single-family', 'condo', 'townhouse', 'multi-family', 'villa', 'land', 'other');
  CREATE TYPE "public"."enum_listings_mls_status" AS ENUM('active', 'pending', 'under-contract', 'sold', 'coming-soon');
  CREATE TABLE "listings_features" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_listings_features",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "listings_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"media_key" varchar NOT NULL,
  	"order" numeric NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "listings_interior_specs_interior_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_interior_specs_appliances" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_interior_specs_flooring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_interior_specs_heating" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_interior_specs_cooling" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_interior_specs_laundry_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_roof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_construction_materials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_parking_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_pool_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_lot_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_sewer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_exterior_specs_water_source" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "listings_floor_plan" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"note" varchar,
  	"tone" "enum_listings_floor_plan_tone"
  );
  
  CREATE TABLE "listings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"listing_key" varchar NOT NULL,
  	"mls_id" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"area_id" integer NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"synced_at" timestamp(3) with time zone,
  	"modification_timestamp" timestamp(3) with time zone,
  	"full_address" varchar NOT NULL,
  	"street_address" varchar,
  	"city" varchar NOT NULL,
  	"state" varchar DEFAULT 'FL',
  	"zip" varchar,
  	"price" numeric NOT NULL,
  	"beds" numeric,
  	"baths" numeric,
  	"sqft" numeric,
  	"price_per_sqft" numeric,
  	"property_type" "enum_listings_property_type",
  	"mls_status" "enum_listings_mls_status" DEFAULT 'active' NOT NULL,
  	"year_built" numeric,
  	"lot_sqft" numeric,
  	"taxes_yearly" numeric,
  	"hoa_monthly" numeric,
  	"hero_image_id" integer,
  	"public_remarks" varchar,
  	"list_agent_name" varchar,
  	"list_office_name" varchar,
  	"badge" varchar,
  	"is_estate" boolean DEFAULT false,
  	"neighborhood_blurb" varchar,
  	"raw_data" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "listings_id" integer;
  ALTER TABLE "listings_features" ADD CONSTRAINT "listings_features_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_gallery" ADD CONSTRAINT "listings_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings_gallery" ADD CONSTRAINT "listings_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_interior_specs_interior_features" ADD CONSTRAINT "listings_interior_specs_interior_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_interior_specs_appliances" ADD CONSTRAINT "listings_interior_specs_appliances_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_interior_specs_flooring" ADD CONSTRAINT "listings_interior_specs_flooring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_interior_specs_heating" ADD CONSTRAINT "listings_interior_specs_heating_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_interior_specs_cooling" ADD CONSTRAINT "listings_interior_specs_cooling_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_interior_specs_laundry_features" ADD CONSTRAINT "listings_interior_specs_laundry_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_roof" ADD CONSTRAINT "listings_exterior_specs_roof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_construction_materials" ADD CONSTRAINT "listings_exterior_specs_construction_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_parking_features" ADD CONSTRAINT "listings_exterior_specs_parking_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_pool_features" ADD CONSTRAINT "listings_exterior_specs_pool_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_lot_features" ADD CONSTRAINT "listings_exterior_specs_lot_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_sewer" ADD CONSTRAINT "listings_exterior_specs_sewer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_exterior_specs_water_source" ADD CONSTRAINT "listings_exterior_specs_water_source_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_highlights" ADD CONSTRAINT "listings_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings_floor_plan" ADD CONSTRAINT "listings_floor_plan_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "listings" ADD CONSTRAINT "listings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "listings_features_order_idx" ON "listings_features" USING btree ("order");
  CREATE INDEX "listings_features_parent_idx" ON "listings_features" USING btree ("parent_id");
  CREATE INDEX "listings_gallery_order_idx" ON "listings_gallery" USING btree ("_order");
  CREATE INDEX "listings_gallery_parent_id_idx" ON "listings_gallery" USING btree ("_parent_id");
  CREATE INDEX "listings_gallery_media_idx" ON "listings_gallery" USING btree ("media_id");
  CREATE INDEX "listings_interior_specs_interior_features_order_idx" ON "listings_interior_specs_interior_features" USING btree ("_order");
  CREATE INDEX "listings_interior_specs_interior_features_parent_id_idx" ON "listings_interior_specs_interior_features" USING btree ("_parent_id");
  CREATE INDEX "listings_interior_specs_appliances_order_idx" ON "listings_interior_specs_appliances" USING btree ("_order");
  CREATE INDEX "listings_interior_specs_appliances_parent_id_idx" ON "listings_interior_specs_appliances" USING btree ("_parent_id");
  CREATE INDEX "listings_interior_specs_flooring_order_idx" ON "listings_interior_specs_flooring" USING btree ("_order");
  CREATE INDEX "listings_interior_specs_flooring_parent_id_idx" ON "listings_interior_specs_flooring" USING btree ("_parent_id");
  CREATE INDEX "listings_interior_specs_heating_order_idx" ON "listings_interior_specs_heating" USING btree ("_order");
  CREATE INDEX "listings_interior_specs_heating_parent_id_idx" ON "listings_interior_specs_heating" USING btree ("_parent_id");
  CREATE INDEX "listings_interior_specs_cooling_order_idx" ON "listings_interior_specs_cooling" USING btree ("_order");
  CREATE INDEX "listings_interior_specs_cooling_parent_id_idx" ON "listings_interior_specs_cooling" USING btree ("_parent_id");
  CREATE INDEX "listings_interior_specs_laundry_features_order_idx" ON "listings_interior_specs_laundry_features" USING btree ("_order");
  CREATE INDEX "listings_interior_specs_laundry_features_parent_id_idx" ON "listings_interior_specs_laundry_features" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_roof_order_idx" ON "listings_exterior_specs_roof" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_roof_parent_id_idx" ON "listings_exterior_specs_roof" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_construction_materials_order_idx" ON "listings_exterior_specs_construction_materials" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_construction_materials_parent_id_idx" ON "listings_exterior_specs_construction_materials" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_parking_features_order_idx" ON "listings_exterior_specs_parking_features" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_parking_features_parent_id_idx" ON "listings_exterior_specs_parking_features" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_pool_features_order_idx" ON "listings_exterior_specs_pool_features" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_pool_features_parent_id_idx" ON "listings_exterior_specs_pool_features" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_lot_features_order_idx" ON "listings_exterior_specs_lot_features" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_lot_features_parent_id_idx" ON "listings_exterior_specs_lot_features" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_sewer_order_idx" ON "listings_exterior_specs_sewer" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_sewer_parent_id_idx" ON "listings_exterior_specs_sewer" USING btree ("_parent_id");
  CREATE INDEX "listings_exterior_specs_water_source_order_idx" ON "listings_exterior_specs_water_source" USING btree ("_order");
  CREATE INDEX "listings_exterior_specs_water_source_parent_id_idx" ON "listings_exterior_specs_water_source" USING btree ("_parent_id");
  CREATE INDEX "listings_highlights_order_idx" ON "listings_highlights" USING btree ("_order");
  CREATE INDEX "listings_highlights_parent_id_idx" ON "listings_highlights" USING btree ("_parent_id");
  CREATE INDEX "listings_floor_plan_order_idx" ON "listings_floor_plan" USING btree ("_order");
  CREATE INDEX "listings_floor_plan_parent_id_idx" ON "listings_floor_plan" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "listings_listing_key_idx" ON "listings" USING btree ("listing_key");
  CREATE INDEX "listings_mls_id_idx" ON "listings" USING btree ("mls_id");
  CREATE UNIQUE INDEX "listings_slug_idx" ON "listings" USING btree ("slug");
  CREATE INDEX "listings_area_idx" ON "listings" USING btree ("area_id");
  CREATE INDEX "listings_hero_image_idx" ON "listings" USING btree ("hero_image_id");
  CREATE INDEX "listings_updated_at_idx" ON "listings" USING btree ("updated_at");
  CREATE INDEX "listings_created_at_idx" ON "listings" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_listings_id_idx" ON "payload_locked_documents_rels" USING btree ("listings_id");`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "listings_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_interior_specs_interior_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_interior_specs_appliances" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_interior_specs_flooring" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_interior_specs_heating" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_interior_specs_cooling" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_interior_specs_laundry_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_roof" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_construction_materials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_parking_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_pool_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_lot_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_sewer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_exterior_specs_water_source" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings_floor_plan" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "listings_features" CASCADE;
  DROP TABLE "listings_gallery" CASCADE;
  DROP TABLE "listings_interior_specs_interior_features" CASCADE;
  DROP TABLE "listings_interior_specs_appliances" CASCADE;
  DROP TABLE "listings_interior_specs_flooring" CASCADE;
  DROP TABLE "listings_interior_specs_heating" CASCADE;
  DROP TABLE "listings_interior_specs_cooling" CASCADE;
  DROP TABLE "listings_interior_specs_laundry_features" CASCADE;
  DROP TABLE "listings_exterior_specs_roof" CASCADE;
  DROP TABLE "listings_exterior_specs_construction_materials" CASCADE;
  DROP TABLE "listings_exterior_specs_parking_features" CASCADE;
  DROP TABLE "listings_exterior_specs_pool_features" CASCADE;
  DROP TABLE "listings_exterior_specs_lot_features" CASCADE;
  DROP TABLE "listings_exterior_specs_sewer" CASCADE;
  DROP TABLE "listings_exterior_specs_water_source" CASCADE;
  DROP TABLE "listings_highlights" CASCADE;
  DROP TABLE "listings_floor_plan" CASCADE;
  DROP TABLE "listings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_listings_fk";
  
  DROP INDEX "payload_locked_documents_rels_listings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "listings_id";
  DROP TYPE "public"."enum_listings_features";
  DROP TYPE "public"."enum_listings_floor_plan_tone";
  DROP TYPE "public"."enum_listings_property_type";
  DROP TYPE "public"."enum_listings_mls_status";`);
}
