import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."link_type" AS ENUM('internal', 'custom', 'anchor', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_communities_strip_items_icon" AS ENUM('mapPin');
  CREATE TYPE "public"."enum_pages_blocks_communities_strip_source_mode" AS ENUM('manual');
  CREATE TYPE "public"."enum_pages_blocks_featured_communities_source_mode" AS ENUM('manual');
  CREATE TYPE "public"."enum_pages_blocks_featured_residences_source_mode" AS ENUM('manual');
  CREATE TYPE "public"."enum_pages_blocks_amenities_amenities_icon" AS ENUM('pool', 'racquet', 'fitness', 'dining', 'trails', 'calendar');
  CREATE TYPE "public"."enum_pages_blocks_lead_capture_helper_note_icon" AS ENUM('waves');
  CREATE TYPE "public"."enum_pages_seo_canonical_mode" AS ENUM('auto', 'custom');
  CREATE TYPE "public"."enum_pages_seo_twitter_card" AS ENUM('summary', 'summary_large_image');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_communities_strip_items_icon" AS ENUM('mapPin');
  CREATE TYPE "public"."enum__pages_v_blocks_communities_strip_source_mode" AS ENUM('manual');
  CREATE TYPE "public"."enum__pages_v_blocks_featured_communities_source_mode" AS ENUM('manual');
  CREATE TYPE "public"."enum__pages_v_blocks_featured_residences_source_mode" AS ENUM('manual');
  CREATE TYPE "public"."enum__pages_v_blocks_amenities_amenities_icon" AS ENUM('pool', 'racquet', 'fitness', 'dining', 'trails', 'calendar');
  CREATE TYPE "public"."enum__pages_v_blocks_lead_capture_helper_note_icon" AS ENUM('waves');
  CREATE TYPE "public"."enum__pages_v_version_seo_canonical_mode" AS ENUM('auto', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_seo_twitter_card" AS ENUM('summary', 'summary_large_image');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar,
  	"background_image_image_id" integer,
  	"background_image_alt_override" varchar,
  	"background_image_priority" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lede" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_link_label" varchar,
  	"primary_cta_link_type" "link_type" DEFAULT 'custom',
  	"primary_cta_link_page_id" integer,
  	"primary_cta_link_custom_url" varchar,
  	"primary_cta_link_anchor" varchar,
  	"primary_cta_link_phone" varchar,
  	"primary_cta_link_email" varchar,
  	"primary_cta_link_new_tab" boolean DEFAULT false,
  	"primary_cta_link_aria_label" varchar,
  	"primary_cta_aria_label" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_link_label" varchar,
  	"secondary_cta_link_type" "link_type" DEFAULT 'custom',
  	"secondary_cta_link_page_id" integer,
  	"secondary_cta_link_custom_url" varchar,
  	"secondary_cta_link_anchor" varchar,
  	"secondary_cta_link_phone" varchar,
  	"secondary_cta_link_email" varchar,
  	"secondary_cta_link_new_tab" boolean DEFAULT false,
  	"secondary_cta_link_aria_label" varchar,
  	"secondary_cta_aria_label" varchar,
  	"show_eyebrow_marker" boolean DEFAULT true,
  	"show_primary_cta_icon" boolean DEFAULT true,
  	"show_secondary_cta" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_communities_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"blurb" varchar,
  	"slug" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"icon" "enum_pages_blocks_communities_strip_items_icon" DEFAULT 'mapPin'
  );
  
  CREATE TABLE "pages_blocks_communities_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar,
  	"source_mode" "enum_pages_blocks_communities_strip_source_mode" DEFAULT 'manual',
  	"max_items" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_communities_manual_communities_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_communities_manual_communities" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"locality" varchar,
  	"rating" numeric,
  	"reviews" numeric,
  	"reviews_label" varchar DEFAULT 'reviews',
  	"price_range" varchar,
  	"residences" numeric,
  	"residences_label" varchar DEFAULT 'residences',
  	"now_selling" numeric,
  	"now_selling_label" varchar DEFAULT 'now selling',
  	"image_image_id" integer,
  	"image_alt_override" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_communities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'communities',
  	"header_kicker" varchar,
  	"header_heading" varchar,
  	"header_heading_accent" varchar,
  	"header_lede" varchar,
  	"source_mode" "enum_pages_blocks_featured_communities_source_mode" DEFAULT 'manual',
  	"more_link_label" varchar,
  	"more_link_link_label" varchar,
  	"more_link_link_type" "link_type" DEFAULT 'custom',
  	"more_link_link_page_id" integer,
  	"more_link_link_custom_url" varchar,
  	"more_link_link_anchor" varchar,
  	"more_link_link_phone" varchar,
  	"more_link_link_email" varchar,
  	"more_link_link_new_tab" boolean DEFAULT false,
  	"more_link_link_aria_label" varchar,
  	"more_link_aria_label" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_residences_manual_listings" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"locality" varchar,
  	"price" numeric,
  	"price_label" varchar,
  	"beds" numeric,
  	"beds_label" varchar DEFAULT 'Beds',
  	"baths" numeric,
  	"baths_label" varchar DEFAULT 'Baths',
  	"sqft" numeric,
  	"sqft_label" varchar DEFAULT 'Sq Ft',
  	"badge" varchar,
  	"image_image_id" integer,
  	"image_alt_override" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_residences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'listings',
  	"header_kicker" varchar,
  	"header_heading" varchar,
  	"header_heading_accent" varchar,
  	"header_lede" varchar,
  	"source_mode" "enum_pages_blocks_featured_residences_source_mode" DEFAULT 'manual',
  	"card_cta_label" varchar DEFAULT 'View residence',
  	"more_link_label" varchar,
  	"more_link_link_label" varchar,
  	"more_link_link_type" "link_type" DEFAULT 'custom',
  	"more_link_link_page_id" integer,
  	"more_link_link_custom_url" varchar,
  	"more_link_link_anchor" varchar,
  	"more_link_link_phone" varchar,
  	"more_link_link_email" varchar,
  	"more_link_link_new_tab" boolean DEFAULT false,
  	"more_link_link_aria_label" varchar,
  	"more_link_aria_label" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_lifestyle_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"image_image_id" integer,
  	"image_alt_override" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar
  );
  
  CREATE TABLE "pages_blocks_lifestyle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'lifestyle',
  	"background_image_image_id" integer,
  	"background_image_alt_override" varchar,
  	"kicker" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"body" varchar,
  	"max_tiles" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_stories" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"location" varchar,
  	"quote" varchar,
  	"portrait_image_id" integer,
  	"portrait_alt_override" varchar,
  	"tab_aria_label" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'testimonials',
  	"kicker" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"heading_suffix" varchar,
  	"carousel_auto_play" boolean DEFAULT true,
  	"carousel_interval_ms" numeric DEFAULT 6500,
  	"previous_label" varchar DEFAULT 'Previous story',
  	"next_label" varchar DEFAULT 'Next story',
  	"tab_list_label" varchar DEFAULT 'Choose a resident story',
  	"counter_separator" varchar DEFAULT '/',
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_amenities_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_amenities_amenities_icon",
  	"title" varchar,
  	"blurb" varchar
  );
  
  CREATE TABLE "pages_blocks_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'amenities',
  	"header_kicker" varchar,
  	"header_heading" varchar,
  	"header_heading_accent" varchar,
  	"header_lede" varchar,
  	"feature_image_image_id" integer,
  	"feature_image_alt_override" varchar,
  	"feature_title" varchar,
  	"feature_caption" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_owner_intro_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_owner_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'concierge',
  	"portrait_image_id" integer,
  	"portrait_alt_override" varchar,
  	"portrait_badge_label" varchar DEFAULT 'Broker & Owner',
  	"kicker" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"title_line" varchar,
  	"bio" varchar,
  	"signature" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_lead_capture" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'lead',
  	"kicker" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"helper_note_icon" "enum_pages_blocks_lead_capture_helper_note_icon" DEFAULT 'waves',
  	"helper_note_before_link_text" varchar,
  	"helper_note_link_label" varchar,
  	"helper_note_link_type" "link_type" DEFAULT 'custom',
  	"helper_note_link_page_id" integer,
  	"helper_note_link_custom_url" varchar,
  	"helper_note_link_anchor" varchar,
  	"helper_note_link_phone" varchar,
  	"helper_note_link_email" varchar,
  	"helper_note_link_new_tab" boolean DEFAULT false,
  	"helper_note_link_aria_label" varchar,
  	"helper_note_after_link_text" varchar,
  	"fields_name_label" varchar,
  	"fields_name_placeholder" varchar,
  	"fields_name_required" boolean DEFAULT true,
  	"fields_email_label" varchar,
  	"fields_email_placeholder" varchar,
  	"fields_email_required" boolean DEFAULT true,
  	"fields_phone_label" varchar,
  	"fields_phone_placeholder" varchar,
  	"fields_phone_required" boolean DEFAULT false,
  	"submit_label" varchar,
  	"privacy_text" varchar,
  	"success_heading" varchar,
  	"success_body" varchar,
  	"error_required_message" varchar,
  	"error_invalid_email_message" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_mode" "enum_pages_seo_canonical_mode" DEFAULT 'auto',
  	"seo_canonical_url" varchar,
  	"seo_index" boolean DEFAULT true,
  	"seo_follow" boolean DEFAULT true,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_og_image_alt" varchar,
  	"seo_twitter_card" "enum_pages_seo_twitter_card" DEFAULT 'summary_large_image',
  	"seo_twitter_title" varchar,
  	"seo_twitter_description" varchar,
  	"seo_twitter_image_id" integer,
  	"seo_twitter_image_alt" varchar,
  	"seo_include_in_sitemap" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar,
  	"background_image_image_id" integer,
  	"background_image_alt_override" varchar,
  	"background_image_priority" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lede" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_link_label" varchar,
  	"primary_cta_link_type" "link_type" DEFAULT 'custom',
  	"primary_cta_link_page_id" integer,
  	"primary_cta_link_custom_url" varchar,
  	"primary_cta_link_anchor" varchar,
  	"primary_cta_link_phone" varchar,
  	"primary_cta_link_email" varchar,
  	"primary_cta_link_new_tab" boolean DEFAULT false,
  	"primary_cta_link_aria_label" varchar,
  	"primary_cta_aria_label" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_link_label" varchar,
  	"secondary_cta_link_type" "link_type" DEFAULT 'custom',
  	"secondary_cta_link_page_id" integer,
  	"secondary_cta_link_custom_url" varchar,
  	"secondary_cta_link_anchor" varchar,
  	"secondary_cta_link_phone" varchar,
  	"secondary_cta_link_email" varchar,
  	"secondary_cta_link_new_tab" boolean DEFAULT false,
  	"secondary_cta_link_aria_label" varchar,
  	"secondary_cta_aria_label" varchar,
  	"show_eyebrow_marker" boolean DEFAULT true,
  	"show_primary_cta_icon" boolean DEFAULT true,
  	"show_secondary_cta" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_communities_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"blurb" varchar,
  	"slug" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"icon" "enum__pages_v_blocks_communities_strip_items_icon" DEFAULT 'mapPin',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_communities_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar,
  	"source_mode" "enum__pages_v_blocks_communities_strip_source_mode" DEFAULT 'manual',
  	"max_items" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_communities_manual_communities_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_communities_manual_communities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"locality" varchar,
  	"rating" numeric,
  	"reviews" numeric,
  	"reviews_label" varchar DEFAULT 'reviews',
  	"price_range" varchar,
  	"residences" numeric,
  	"residences_label" varchar DEFAULT 'residences',
  	"now_selling" numeric,
  	"now_selling_label" varchar DEFAULT 'now selling',
  	"image_image_id" integer,
  	"image_alt_override" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_communities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'communities',
  	"header_kicker" varchar,
  	"header_heading" varchar,
  	"header_heading_accent" varchar,
  	"header_lede" varchar,
  	"source_mode" "enum__pages_v_blocks_featured_communities_source_mode" DEFAULT 'manual',
  	"more_link_label" varchar,
  	"more_link_link_label" varchar,
  	"more_link_link_type" "link_type" DEFAULT 'custom',
  	"more_link_link_page_id" integer,
  	"more_link_link_custom_url" varchar,
  	"more_link_link_anchor" varchar,
  	"more_link_link_phone" varchar,
  	"more_link_link_email" varchar,
  	"more_link_link_new_tab" boolean DEFAULT false,
  	"more_link_link_aria_label" varchar,
  	"more_link_aria_label" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_residences_manual_listings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"locality" varchar,
  	"price" numeric,
  	"price_label" varchar,
  	"beds" numeric,
  	"beds_label" varchar DEFAULT 'Beds',
  	"baths" numeric,
  	"baths_label" varchar DEFAULT 'Baths',
  	"sqft" numeric,
  	"sqft_label" varchar DEFAULT 'Sq Ft',
  	"badge" varchar,
  	"image_image_id" integer,
  	"image_alt_override" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_residences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'listings',
  	"header_kicker" varchar,
  	"header_heading" varchar,
  	"header_heading_accent" varchar,
  	"header_lede" varchar,
  	"source_mode" "enum__pages_v_blocks_featured_residences_source_mode" DEFAULT 'manual',
  	"card_cta_label" varchar DEFAULT 'View residence',
  	"more_link_label" varchar,
  	"more_link_link_label" varchar,
  	"more_link_link_type" "link_type" DEFAULT 'custom',
  	"more_link_link_page_id" integer,
  	"more_link_link_custom_url" varchar,
  	"more_link_link_anchor" varchar,
  	"more_link_link_phone" varchar,
  	"more_link_link_email" varchar,
  	"more_link_link_new_tab" boolean DEFAULT false,
  	"more_link_link_aria_label" varchar,
  	"more_link_aria_label" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lifestyle_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"image_image_id" integer,
  	"image_alt_override" varchar,
  	"link_label" varchar,
  	"link_type" "link_type" DEFAULT 'custom',
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lifestyle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'lifestyle',
  	"background_image_image_id" integer,
  	"background_image_alt_override" varchar,
  	"kicker" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"body" varchar,
  	"max_tiles" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_stories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"location" varchar,
  	"quote" varchar,
  	"portrait_image_id" integer,
  	"portrait_alt_override" varchar,
  	"tab_aria_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'testimonials',
  	"kicker" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"heading_suffix" varchar,
  	"carousel_auto_play" boolean DEFAULT true,
  	"carousel_interval_ms" numeric DEFAULT 6500,
  	"previous_label" varchar DEFAULT 'Previous story',
  	"next_label" varchar DEFAULT 'Next story',
  	"tab_list_label" varchar DEFAULT 'Choose a resident story',
  	"counter_separator" varchar DEFAULT '/',
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_amenities_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_amenities_amenities_icon",
  	"title" varchar,
  	"blurb" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'amenities',
  	"header_kicker" varchar,
  	"header_heading" varchar,
  	"header_heading_accent" varchar,
  	"header_lede" varchar,
  	"feature_image_image_id" integer,
  	"feature_image_alt_override" varchar,
  	"feature_title" varchar,
  	"feature_caption" varchar,
  	"empty_state_heading" varchar,
  	"empty_state_body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_owner_intro_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_owner_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'concierge',
  	"portrait_image_id" integer,
  	"portrait_alt_override" varchar,
  	"portrait_badge_label" varchar DEFAULT 'Broker & Owner',
  	"kicker" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"title_line" varchar,
  	"bio" varchar,
  	"signature" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lead_capture" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"anchor_id" varchar DEFAULT 'lead',
  	"kicker" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"helper_note_icon" "enum__pages_v_blocks_lead_capture_helper_note_icon" DEFAULT 'waves',
  	"helper_note_before_link_text" varchar,
  	"helper_note_link_label" varchar,
  	"helper_note_link_type" "link_type" DEFAULT 'custom',
  	"helper_note_link_page_id" integer,
  	"helper_note_link_custom_url" varchar,
  	"helper_note_link_anchor" varchar,
  	"helper_note_link_phone" varchar,
  	"helper_note_link_email" varchar,
  	"helper_note_link_new_tab" boolean DEFAULT false,
  	"helper_note_link_aria_label" varchar,
  	"helper_note_after_link_text" varchar,
  	"fields_name_label" varchar,
  	"fields_name_placeholder" varchar,
  	"fields_name_required" boolean DEFAULT true,
  	"fields_email_label" varchar,
  	"fields_email_placeholder" varchar,
  	"fields_email_required" boolean DEFAULT true,
  	"fields_phone_label" varchar,
  	"fields_phone_placeholder" varchar,
  	"fields_phone_required" boolean DEFAULT false,
  	"submit_label" varchar,
  	"privacy_text" varchar,
  	"success_heading" varchar,
  	"success_body" varchar,
  	"error_required_message" varchar,
  	"error_invalid_email_message" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical_mode" "enum__pages_v_version_seo_canonical_mode" DEFAULT 'auto',
  	"version_seo_canonical_url" varchar,
  	"version_seo_index" boolean DEFAULT true,
  	"version_seo_follow" boolean DEFAULT true,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_og_image_alt" varchar,
  	"version_seo_twitter_card" "enum__pages_v_version_seo_twitter_card" DEFAULT 'summary_large_image',
  	"version_seo_twitter_title" varchar,
  	"version_seo_twitter_description" varchar,
  	"version_seo_twitter_image_id" integer,
  	"version_seo_twitter_image_alt" varchar,
  	"version_seo_include_in_sitemap" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_type" "link_type" DEFAULT 'custom' NOT NULL,
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"aria_label" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_home_link_label" varchar NOT NULL,
  	"brand_home_link_type" "link_type" DEFAULT 'custom' NOT NULL,
  	"brand_home_link_page_id" integer,
  	"brand_home_link_custom_url" varchar,
  	"brand_home_link_anchor" varchar,
  	"brand_home_link_phone" varchar,
  	"brand_home_link_email" varchar,
  	"brand_home_link_new_tab" boolean DEFAULT false,
  	"brand_home_link_aria_label" varchar,
  	"brand_label" varchar DEFAULT 'MVP Realty' NOT NULL,
  	"brand_mark_alt" varchar,
  	"primary_cta_label" varchar NOT NULL,
  	"primary_cta_link_label" varchar,
  	"primary_cta_link_type" "link_type" DEFAULT 'custom' NOT NULL,
  	"primary_cta_link_page_id" integer,
  	"primary_cta_link_custom_url" varchar,
  	"primary_cta_link_anchor" varchar,
  	"primary_cta_link_phone" varchar,
  	"primary_cta_link_email" varchar,
  	"primary_cta_link_new_tab" boolean DEFAULT false,
  	"primary_cta_link_aria_label" varchar,
  	"primary_cta_aria_label" varchar,
  	"mobile_menu_label" varchar DEFAULT 'Menu' NOT NULL,
  	"mobile_menu_close_label" varchar DEFAULT 'Close menu' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_type" "link_type" DEFAULT 'custom' NOT NULL,
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar,
  	"aria_label" varchar
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "footer_bottom_right_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_type" "link_type" DEFAULT 'custom' NOT NULL,
  	"link_page_id" integer,
  	"link_custom_url" varchar,
  	"link_anchor" varchar,
  	"link_phone" varchar,
  	"link_email" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_aria_label" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar NOT NULL,
  	"brand_accent_text" varchar,
  	"brand_blurb" varchar NOT NULL,
  	"bottom_left_text" varchar NOT NULL,
  	"bottom_right_text_fallback" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_image_id_media_id_fk" FOREIGN KEY ("background_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_primary_cta_link_page_id_pages_id_fk" FOREIGN KEY ("primary_cta_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_secondary_cta_link_page_id_pages_id_fk" FOREIGN KEY ("secondary_cta_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_communities_strip_items" ADD CONSTRAINT "pages_blocks_communities_strip_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_communities_strip_items" ADD CONSTRAINT "pages_blocks_communities_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_communities_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_communities_strip" ADD CONSTRAINT "pages_blocks_communities_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities_tags" ADD CONSTRAINT "pages_blocks_featured_communities_manual_communities_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_featured_communities_manual_communities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" ADD CONSTRAINT "pages_blocks_featured_communities_manual_communities_image_image_id_media_id_fk" FOREIGN KEY ("image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" ADD CONSTRAINT "pages_blocks_featured_communities_manual_communities_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_communities_manual_communities" ADD CONSTRAINT "pages_blocks_featured_communities_manual_communities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_featured_communities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_communities" ADD CONSTRAINT "pages_blocks_featured_communities_more_link_link_page_id_pages_id_fk" FOREIGN KEY ("more_link_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_communities" ADD CONSTRAINT "pages_blocks_featured_communities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_residences_manual_listings" ADD CONSTRAINT "pages_blocks_featured_residences_manual_listings_image_image_id_media_id_fk" FOREIGN KEY ("image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_residences_manual_listings" ADD CONSTRAINT "pages_blocks_featured_residences_manual_listings_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_residences_manual_listings" ADD CONSTRAINT "pages_blocks_featured_residences_manual_listings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_featured_residences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_residences" ADD CONSTRAINT "pages_blocks_featured_residences_more_link_link_page_id_pages_id_fk" FOREIGN KEY ("more_link_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_residences" ADD CONSTRAINT "pages_blocks_featured_residences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lifestyle_tiles" ADD CONSTRAINT "pages_blocks_lifestyle_tiles_image_image_id_media_id_fk" FOREIGN KEY ("image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_lifestyle_tiles" ADD CONSTRAINT "pages_blocks_lifestyle_tiles_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_lifestyle_tiles" ADD CONSTRAINT "pages_blocks_lifestyle_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_lifestyle"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lifestyle" ADD CONSTRAINT "pages_blocks_lifestyle_background_image_image_id_media_id_fk" FOREIGN KEY ("background_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_lifestyle" ADD CONSTRAINT "pages_blocks_lifestyle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_stories" ADD CONSTRAINT "pages_blocks_testimonials_stories_portrait_image_id_media_id_fk" FOREIGN KEY ("portrait_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_stories" ADD CONSTRAINT "pages_blocks_testimonials_stories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_amenities_amenities" ADD CONSTRAINT "pages_blocks_amenities_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_amenities" ADD CONSTRAINT "pages_blocks_amenities_feature_image_image_id_media_id_fk" FOREIGN KEY ("feature_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_amenities" ADD CONSTRAINT "pages_blocks_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_owner_intro_credentials" ADD CONSTRAINT "pages_blocks_owner_intro_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_owner_intro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_owner_intro" ADD CONSTRAINT "pages_blocks_owner_intro_portrait_image_id_media_id_fk" FOREIGN KEY ("portrait_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_owner_intro" ADD CONSTRAINT "pages_blocks_owner_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lead_capture" ADD CONSTRAINT "pages_blocks_lead_capture_helper_note_link_page_id_pages_id_fk" FOREIGN KEY ("helper_note_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_lead_capture" ADD CONSTRAINT "pages_blocks_lead_capture_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_twitter_image_id_media_id_fk" FOREIGN KEY ("seo_twitter_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_image_id_media_id_fk" FOREIGN KEY ("background_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_primary_cta_link_page_id_pages_id_fk" FOREIGN KEY ("primary_cta_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_secondary_cta_link_page_id_pages_id_fk" FOREIGN KEY ("secondary_cta_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_communities_strip_items" ADD CONSTRAINT "_pages_v_blocks_communities_strip_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_communities_strip_items" ADD CONSTRAINT "_pages_v_blocks_communities_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_communities_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_communities_strip" ADD CONSTRAINT "_pages_v_blocks_communities_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities_tags" ADD CONSTRAINT "_pages_v_blocks_featured_communities_manual_communities_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_featured_communities_manual_communities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" ADD CONSTRAINT "_pages_v_blocks_featured_communities_manual_communities_image_image_id_media_id_fk" FOREIGN KEY ("image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" ADD CONSTRAINT "_pages_v_blocks_featured_communities_manual_communities_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_communities_manual_communities" ADD CONSTRAINT "_pages_v_blocks_featured_communities_manual_communities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_featured_communities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_communities" ADD CONSTRAINT "_pages_v_blocks_featured_communities_more_link_link_page_id_pages_id_fk" FOREIGN KEY ("more_link_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_communities" ADD CONSTRAINT "_pages_v_blocks_featured_communities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_residences_manual_listings" ADD CONSTRAINT "_pages_v_blocks_featured_residences_manual_listings_image_image_id_media_id_fk" FOREIGN KEY ("image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_residences_manual_listings" ADD CONSTRAINT "_pages_v_blocks_featured_residences_manual_listings_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_residences_manual_listings" ADD CONSTRAINT "_pages_v_blocks_featured_residences_manual_listings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_featured_residences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_residences" ADD CONSTRAINT "_pages_v_blocks_featured_residences_more_link_link_page_id_pages_id_fk" FOREIGN KEY ("more_link_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_residences" ADD CONSTRAINT "_pages_v_blocks_featured_residences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lifestyle_tiles" ADD CONSTRAINT "_pages_v_blocks_lifestyle_tiles_image_image_id_media_id_fk" FOREIGN KEY ("image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lifestyle_tiles" ADD CONSTRAINT "_pages_v_blocks_lifestyle_tiles_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lifestyle_tiles" ADD CONSTRAINT "_pages_v_blocks_lifestyle_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_lifestyle"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lifestyle" ADD CONSTRAINT "_pages_v_blocks_lifestyle_background_image_image_id_media_id_fk" FOREIGN KEY ("background_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lifestyle" ADD CONSTRAINT "_pages_v_blocks_lifestyle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_stories" ADD CONSTRAINT "_pages_v_blocks_testimonials_stories_portrait_image_id_media_id_fk" FOREIGN KEY ("portrait_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_stories" ADD CONSTRAINT "_pages_v_blocks_testimonials_stories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_amenities_amenities" ADD CONSTRAINT "_pages_v_blocks_amenities_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_amenities" ADD CONSTRAINT "_pages_v_blocks_amenities_feature_image_image_id_media_id_fk" FOREIGN KEY ("feature_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_amenities" ADD CONSTRAINT "_pages_v_blocks_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_owner_intro_credentials" ADD CONSTRAINT "_pages_v_blocks_owner_intro_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_owner_intro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_owner_intro" ADD CONSTRAINT "_pages_v_blocks_owner_intro_portrait_image_id_media_id_fk" FOREIGN KEY ("portrait_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_owner_intro" ADD CONSTRAINT "_pages_v_blocks_owner_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD CONSTRAINT "_pages_v_blocks_lead_capture_helper_note_link_page_id_pages_id_fk" FOREIGN KEY ("helper_note_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD CONSTRAINT "_pages_v_blocks_lead_capture_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_twitter_image_id_media_id_fk" FOREIGN KEY ("version_seo_twitter_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_brand_home_link_page_id_pages_id_fk" FOREIGN KEY ("brand_home_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_primary_cta_link_page_id_pages_id_fk" FOREIGN KEY ("primary_cta_link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_bottom_right_links" ADD CONSTRAINT "footer_bottom_right_links_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_bottom_right_links" ADD CONSTRAINT "footer_bottom_right_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_background_image_background_image_imag_idx" ON "pages_blocks_hero" USING btree ("background_image_image_id");
  CREATE INDEX "pages_blocks_hero_primary_cta_link_primary_cta_link_page_idx" ON "pages_blocks_hero" USING btree ("primary_cta_link_page_id");
  CREATE INDEX "pages_blocks_hero_secondary_cta_link_secondary_cta_link__idx" ON "pages_blocks_hero" USING btree ("secondary_cta_link_page_id");
  CREATE INDEX "pages_blocks_communities_strip_items_order_idx" ON "pages_blocks_communities_strip_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_communities_strip_items_parent_id_idx" ON "pages_blocks_communities_strip_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_communities_strip_items_link_link_page_idx" ON "pages_blocks_communities_strip_items" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_communities_strip_order_idx" ON "pages_blocks_communities_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_communities_strip_parent_id_idx" ON "pages_blocks_communities_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_communities_strip_path_idx" ON "pages_blocks_communities_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_featured_communities_manual_communities_tags_order_idx" ON "pages_blocks_featured_communities_manual_communities_tags" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_communities_manual_communities_tags_parent_id_idx" ON "pages_blocks_featured_communities_manual_communities_tags" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_communities_manual_communities_order_idx" ON "pages_blocks_featured_communities_manual_communities" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_communities_manual_communities_parent_id_idx" ON "pages_blocks_featured_communities_manual_communities" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_communities_manual_communities_ima_idx" ON "pages_blocks_featured_communities_manual_communities" USING btree ("image_image_id");
  CREATE INDEX "pages_blocks_featured_communities_manual_communities_lin_idx" ON "pages_blocks_featured_communities_manual_communities" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_featured_communities_order_idx" ON "pages_blocks_featured_communities" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_communities_parent_id_idx" ON "pages_blocks_featured_communities" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_communities_path_idx" ON "pages_blocks_featured_communities" USING btree ("_path");
  CREATE INDEX "pages_blocks_featured_communities_more_link_link_more_li_idx" ON "pages_blocks_featured_communities" USING btree ("more_link_link_page_id");
  CREATE INDEX "pages_blocks_featured_residences_manual_listings_order_idx" ON "pages_blocks_featured_residences_manual_listings" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_residences_manual_listings_parent_id_idx" ON "pages_blocks_featured_residences_manual_listings" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_residences_manual_listings_image_i_idx" ON "pages_blocks_featured_residences_manual_listings" USING btree ("image_image_id");
  CREATE INDEX "pages_blocks_featured_residences_manual_listings_link_li_idx" ON "pages_blocks_featured_residences_manual_listings" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_featured_residences_order_idx" ON "pages_blocks_featured_residences" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_residences_parent_id_idx" ON "pages_blocks_featured_residences" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_residences_path_idx" ON "pages_blocks_featured_residences" USING btree ("_path");
  CREATE INDEX "pages_blocks_featured_residences_more_link_link_more_lin_idx" ON "pages_blocks_featured_residences" USING btree ("more_link_link_page_id");
  CREATE INDEX "pages_blocks_lifestyle_tiles_order_idx" ON "pages_blocks_lifestyle_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_lifestyle_tiles_parent_id_idx" ON "pages_blocks_lifestyle_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lifestyle_tiles_image_image_image_idx" ON "pages_blocks_lifestyle_tiles" USING btree ("image_image_id");
  CREATE INDEX "pages_blocks_lifestyle_tiles_link_link_page_idx" ON "pages_blocks_lifestyle_tiles" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_lifestyle_order_idx" ON "pages_blocks_lifestyle" USING btree ("_order");
  CREATE INDEX "pages_blocks_lifestyle_parent_id_idx" ON "pages_blocks_lifestyle" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lifestyle_path_idx" ON "pages_blocks_lifestyle" USING btree ("_path");
  CREATE INDEX "pages_blocks_lifestyle_background_image_background_image_idx" ON "pages_blocks_lifestyle" USING btree ("background_image_image_id");
  CREATE INDEX "pages_blocks_testimonials_stories_order_idx" ON "pages_blocks_testimonials_stories" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_stories_parent_id_idx" ON "pages_blocks_testimonials_stories" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_stories_portrait_portrait_imag_idx" ON "pages_blocks_testimonials_stories" USING btree ("portrait_image_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_amenities_amenities_order_idx" ON "pages_blocks_amenities_amenities" USING btree ("_order");
  CREATE INDEX "pages_blocks_amenities_amenities_parent_id_idx" ON "pages_blocks_amenities_amenities" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_amenities_order_idx" ON "pages_blocks_amenities" USING btree ("_order");
  CREATE INDEX "pages_blocks_amenities_parent_id_idx" ON "pages_blocks_amenities" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_amenities_path_idx" ON "pages_blocks_amenities" USING btree ("_path");
  CREATE INDEX "pages_blocks_amenities_feature_image_feature_image_image_idx" ON "pages_blocks_amenities" USING btree ("feature_image_image_id");
  CREATE INDEX "pages_blocks_owner_intro_credentials_order_idx" ON "pages_blocks_owner_intro_credentials" USING btree ("_order");
  CREATE INDEX "pages_blocks_owner_intro_credentials_parent_id_idx" ON "pages_blocks_owner_intro_credentials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_owner_intro_order_idx" ON "pages_blocks_owner_intro" USING btree ("_order");
  CREATE INDEX "pages_blocks_owner_intro_parent_id_idx" ON "pages_blocks_owner_intro" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_owner_intro_path_idx" ON "pages_blocks_owner_intro" USING btree ("_path");
  CREATE INDEX "pages_blocks_owner_intro_portrait_portrait_image_idx" ON "pages_blocks_owner_intro" USING btree ("portrait_image_id");
  CREATE INDEX "pages_blocks_lead_capture_order_idx" ON "pages_blocks_lead_capture" USING btree ("_order");
  CREATE INDEX "pages_blocks_lead_capture_parent_id_idx" ON "pages_blocks_lead_capture" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lead_capture_path_idx" ON "pages_blocks_lead_capture" USING btree ("_path");
  CREATE INDEX "pages_blocks_lead_capture_helper_note_link_helper_note_l_idx" ON "pages_blocks_lead_capture" USING btree ("helper_note_link_page_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_seo_seo_twitter_image_idx" ON "pages" USING btree ("seo_twitter_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_background_image_background_image_i_idx" ON "_pages_v_blocks_hero" USING btree ("background_image_image_id");
  CREATE INDEX "_pages_v_blocks_hero_primary_cta_link_primary_cta_link_p_idx" ON "_pages_v_blocks_hero" USING btree ("primary_cta_link_page_id");
  CREATE INDEX "_pages_v_blocks_hero_secondary_cta_link_secondary_cta_li_idx" ON "_pages_v_blocks_hero" USING btree ("secondary_cta_link_page_id");
  CREATE INDEX "_pages_v_blocks_communities_strip_items_order_idx" ON "_pages_v_blocks_communities_strip_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_communities_strip_items_parent_id_idx" ON "_pages_v_blocks_communities_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_communities_strip_items_link_link_page_idx" ON "_pages_v_blocks_communities_strip_items" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_communities_strip_order_idx" ON "_pages_v_blocks_communities_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_communities_strip_parent_id_idx" ON "_pages_v_blocks_communities_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_communities_strip_path_idx" ON "_pages_v_blocks_communities_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_featured_communities_manual_communities_tags_order_idx" ON "_pages_v_blocks_featured_communities_manual_communities_tags" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_communities_manual_communities_tags_parent_id_idx" ON "_pages_v_blocks_featured_communities_manual_communities_tags" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_communities_manual_communities_order_idx" ON "_pages_v_blocks_featured_communities_manual_communities" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_communities_manual_communities_parent_id_idx" ON "_pages_v_blocks_featured_communities_manual_communities" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_communities_manual_communities__idx" ON "_pages_v_blocks_featured_communities_manual_communities" USING btree ("image_image_id");
  CREATE INDEX "_pages_v_blocks_featured_communities_manual_communitie_1_idx" ON "_pages_v_blocks_featured_communities_manual_communities" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_featured_communities_order_idx" ON "_pages_v_blocks_featured_communities" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_communities_parent_id_idx" ON "_pages_v_blocks_featured_communities" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_communities_path_idx" ON "_pages_v_blocks_featured_communities" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_featured_communities_more_link_link_more_idx" ON "_pages_v_blocks_featured_communities" USING btree ("more_link_link_page_id");
  CREATE INDEX "_pages_v_blocks_featured_residences_manual_listings_order_idx" ON "_pages_v_blocks_featured_residences_manual_listings" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_residences_manual_listings_parent_id_idx" ON "_pages_v_blocks_featured_residences_manual_listings" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_residences_manual_listings_imag_idx" ON "_pages_v_blocks_featured_residences_manual_listings" USING btree ("image_image_id");
  CREATE INDEX "_pages_v_blocks_featured_residences_manual_listings_link_idx" ON "_pages_v_blocks_featured_residences_manual_listings" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_featured_residences_order_idx" ON "_pages_v_blocks_featured_residences" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_residences_parent_id_idx" ON "_pages_v_blocks_featured_residences" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_residences_path_idx" ON "_pages_v_blocks_featured_residences" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_featured_residences_more_link_link_more__idx" ON "_pages_v_blocks_featured_residences" USING btree ("more_link_link_page_id");
  CREATE INDEX "_pages_v_blocks_lifestyle_tiles_order_idx" ON "_pages_v_blocks_lifestyle_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lifestyle_tiles_parent_id_idx" ON "_pages_v_blocks_lifestyle_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lifestyle_tiles_image_image_image_idx" ON "_pages_v_blocks_lifestyle_tiles" USING btree ("image_image_id");
  CREATE INDEX "_pages_v_blocks_lifestyle_tiles_link_link_page_idx" ON "_pages_v_blocks_lifestyle_tiles" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_lifestyle_order_idx" ON "_pages_v_blocks_lifestyle" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lifestyle_parent_id_idx" ON "_pages_v_blocks_lifestyle" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lifestyle_path_idx" ON "_pages_v_blocks_lifestyle" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lifestyle_background_image_background_im_idx" ON "_pages_v_blocks_lifestyle" USING btree ("background_image_image_id");
  CREATE INDEX "_pages_v_blocks_testimonials_stories_order_idx" ON "_pages_v_blocks_testimonials_stories" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_stories_parent_id_idx" ON "_pages_v_blocks_testimonials_stories" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_stories_portrait_portrait_i_idx" ON "_pages_v_blocks_testimonials_stories" USING btree ("portrait_image_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_amenities_amenities_order_idx" ON "_pages_v_blocks_amenities_amenities" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_amenities_amenities_parent_id_idx" ON "_pages_v_blocks_amenities_amenities" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_amenities_order_idx" ON "_pages_v_blocks_amenities" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_amenities_parent_id_idx" ON "_pages_v_blocks_amenities" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_amenities_path_idx" ON "_pages_v_blocks_amenities" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_amenities_feature_image_feature_image_im_idx" ON "_pages_v_blocks_amenities" USING btree ("feature_image_image_id");
  CREATE INDEX "_pages_v_blocks_owner_intro_credentials_order_idx" ON "_pages_v_blocks_owner_intro_credentials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_owner_intro_credentials_parent_id_idx" ON "_pages_v_blocks_owner_intro_credentials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_owner_intro_order_idx" ON "_pages_v_blocks_owner_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_owner_intro_parent_id_idx" ON "_pages_v_blocks_owner_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_owner_intro_path_idx" ON "_pages_v_blocks_owner_intro" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_owner_intro_portrait_portrait_image_idx" ON "_pages_v_blocks_owner_intro" USING btree ("portrait_image_id");
  CREATE INDEX "_pages_v_blocks_lead_capture_order_idx" ON "_pages_v_blocks_lead_capture" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lead_capture_parent_id_idx" ON "_pages_v_blocks_lead_capture" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lead_capture_path_idx" ON "_pages_v_blocks_lead_capture" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lead_capture_helper_note_link_helper_not_idx" ON "_pages_v_blocks_lead_capture" USING btree ("helper_note_link_page_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_twitter_image_idx" ON "_pages_v" USING btree ("version_seo_twitter_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_link_link_page_idx" ON "header_nav_items" USING btree ("link_page_id");
  CREATE INDEX "header_brand_home_link_brand_home_link_page_idx" ON "header" USING btree ("brand_home_link_page_id");
  CREATE INDEX "header_primary_cta_link_primary_cta_link_page_idx" ON "header" USING btree ("primary_cta_link_page_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_link_link_page_idx" ON "footer_columns_links" USING btree ("link_page_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_bottom_right_links_order_idx" ON "footer_bottom_right_links" USING btree ("_order");
  CREATE INDEX "footer_bottom_right_links_parent_id_idx" ON "footer_bottom_right_links" USING btree ("_parent_id");
  CREATE INDEX "footer_bottom_right_links_link_link_page_idx" ON "footer_bottom_right_links" USING btree ("link_page_id");`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_communities_strip_items" CASCADE;
  DROP TABLE "pages_blocks_communities_strip" CASCADE;
  DROP TABLE "pages_blocks_featured_communities_manual_communities_tags" CASCADE;
  DROP TABLE "pages_blocks_featured_communities_manual_communities" CASCADE;
  DROP TABLE "pages_blocks_featured_communities" CASCADE;
  DROP TABLE "pages_blocks_featured_residences_manual_listings" CASCADE;
  DROP TABLE "pages_blocks_featured_residences" CASCADE;
  DROP TABLE "pages_blocks_lifestyle_tiles" CASCADE;
  DROP TABLE "pages_blocks_lifestyle" CASCADE;
  DROP TABLE "pages_blocks_testimonials_stories" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_amenities_amenities" CASCADE;
  DROP TABLE "pages_blocks_amenities" CASCADE;
  DROP TABLE "pages_blocks_owner_intro_credentials" CASCADE;
  DROP TABLE "pages_blocks_owner_intro" CASCADE;
  DROP TABLE "pages_blocks_lead_capture" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_communities_strip_items" CASCADE;
  DROP TABLE "_pages_v_blocks_communities_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_communities_manual_communities_tags" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_communities_manual_communities" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_communities" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_residences_manual_listings" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_residences" CASCADE;
  DROP TABLE "_pages_v_blocks_lifestyle_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_lifestyle" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_stories" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_amenities_amenities" CASCADE;
  DROP TABLE "_pages_v_blocks_amenities" CASCADE;
  DROP TABLE "_pages_v_blocks_owner_intro_credentials" CASCADE;
  DROP TABLE "_pages_v_blocks_owner_intro" CASCADE;
  DROP TABLE "_pages_v_blocks_lead_capture" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_bottom_right_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TYPE "public"."link_type";
  DROP TYPE "public"."enum_pages_blocks_communities_strip_items_icon";
  DROP TYPE "public"."enum_pages_blocks_communities_strip_source_mode";
  DROP TYPE "public"."enum_pages_blocks_featured_communities_source_mode";
  DROP TYPE "public"."enum_pages_blocks_featured_residences_source_mode";
  DROP TYPE "public"."enum_pages_blocks_amenities_amenities_icon";
  DROP TYPE "public"."enum_pages_blocks_lead_capture_helper_note_icon";
  DROP TYPE "public"."enum_pages_seo_canonical_mode";
  DROP TYPE "public"."enum_pages_seo_twitter_card";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_communities_strip_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_communities_strip_source_mode";
  DROP TYPE "public"."enum__pages_v_blocks_featured_communities_source_mode";
  DROP TYPE "public"."enum__pages_v_blocks_featured_residences_source_mode";
  DROP TYPE "public"."enum__pages_v_blocks_amenities_amenities_icon";
  DROP TYPE "public"."enum__pages_v_blocks_lead_capture_helper_note_icon";
  DROP TYPE "public"."enum__pages_v_version_seo_canonical_mode";
  DROP TYPE "public"."enum__pages_v_version_seo_twitter_card";
  DROP TYPE "public"."enum__pages_v_version_status";`);
}
