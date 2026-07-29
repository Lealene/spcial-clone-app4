import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_form_type" AS ENUM('tour', 'shortlist');
  CREATE TYPE "public"."enum_leads_surface" AS ENUM('concierge-cta', 'page-lead-capture', 'property-tour-form', 'community-tour-band', 'community-agent-aside');
  CREATE TYPE "public"."enum_leads_crm_status" AS ENUM('pending', 'synced', 'failed', 'skipped');
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"message" varchar,
  	"form_type" "enum_leads_form_type" NOT NULL,
  	"surface" "enum_leads_surface" NOT NULL,
  	"page_url" varchar,
  	"area_id" integer,
  	"listing_id" integer,
  	"crm_status" "enum_leads_crm_status" DEFAULT 'pending' NOT NULL,
  	"crm_wise_agent_client_id" varchar,
  	"crm_is_new_contact" boolean,
  	"crm_synced_at" timestamp(3) with time zone,
  	"crm_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_first_name_label" varchar;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_first_name_placeholder" varchar;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_first_name_required" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_last_name_label" varchar;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_last_name_placeholder" varchar;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_last_name_required" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_first_name_label" varchar;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_first_name_placeholder" varchar;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_first_name_required" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_last_name_label" varchar;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_last_name_placeholder" varchar;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_last_name_required" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");
  CREATE INDEX "leads_form_type_idx" ON "leads" USING btree ("form_type");
  CREATE INDEX "leads_area_idx" ON "leads" USING btree ("area_id");
  CREATE INDEX "leads_listing_idx" ON "leads" USING btree ("listing_id");
  CREATE INDEX "leads_crm_crm_status_idx" ON "leads" USING btree ("crm_status");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");`);

  // Backfill the split name fields from the legacy single `name` group, which
  // the next migration drops. Without this, existing lead-capture blocks carry
  // null labels and fail leadCaptureBlockSchema (min(1)) on the web side.
  for (const table of ['pages_blocks_lead_capture', '_pages_v_blocks_lead_capture']) {
    await db.execute(sql`
      UPDATE ${sql.identifier(table)} SET
        "fields_first_name_label" = COALESCE("fields_name_label", 'First name'),
        "fields_first_name_placeholder" = COALESCE("fields_name_placeholder", 'Jane'),
        "fields_first_name_required" = COALESCE("fields_name_required", true),
        "fields_last_name_label" = 'Last name',
        "fields_last_name_placeholder" = 'Ellison',
        "fields_last_name_required" = COALESCE("fields_name_required", true)
      WHERE "fields_first_name_label" IS NULL;
    `);
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "leads" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_first_name_label";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_first_name_placeholder";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_first_name_required";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_last_name_label";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_last_name_placeholder";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_last_name_required";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_first_name_label";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_first_name_placeholder";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_first_name_required";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_last_name_label";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_last_name_placeholder";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_last_name_required";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  DROP TYPE "public"."enum_leads_form_type";
  DROP TYPE "public"."enum_leads_surface";
  DROP TYPE "public"."enum_leads_crm_status";`);
}
