import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_name_label";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_name_placeholder";
  ALTER TABLE "pages_blocks_lead_capture" DROP COLUMN "fields_name_required";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_name_label";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_name_placeholder";
  ALTER TABLE "_pages_v_blocks_lead_capture" DROP COLUMN "fields_name_required";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_name_label" varchar;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_name_placeholder" varchar;
  ALTER TABLE "pages_blocks_lead_capture" ADD COLUMN "fields_name_required" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_name_label" varchar;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_name_placeholder" varchar;
  ALTER TABLE "_pages_v_blocks_lead_capture" ADD COLUMN "fields_name_required" boolean DEFAULT true;`);
}
