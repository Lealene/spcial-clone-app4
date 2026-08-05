import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_brand_display_mode" AS ENUM('text', 'logo');
  CREATE TYPE "public"."enum_footer_brand_display_mode" AS ENUM('text', 'logo');
  ALTER TABLE "header" ADD COLUMN "brand_display_mode" "enum_header_brand_display_mode" DEFAULT 'text' NOT NULL;
  ALTER TABLE "header" ADD COLUMN "brand_logo_image_id" integer;
  ALTER TABLE "header" ADD COLUMN "brand_logo_alt_override" varchar;
  ALTER TABLE "footer" ADD COLUMN "brand_display_mode" "enum_footer_brand_display_mode" DEFAULT 'text' NOT NULL;
  ALTER TABLE "footer" ADD COLUMN "brand_logo_image_id" integer;
  ALTER TABLE "footer" ADD COLUMN "brand_logo_alt_override" varchar;
  ALTER TABLE "header" ADD CONSTRAINT "header_brand_logo_image_id_media_id_fk" FOREIGN KEY ("brand_logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_brand_logo_image_id_media_id_fk" FOREIGN KEY ("brand_logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_brand_logo_brand_logo_image_idx" ON "header" USING btree ("brand_logo_image_id");
  CREATE INDEX "footer_brand_logo_brand_logo_image_idx" ON "footer" USING btree ("brand_logo_image_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" DROP CONSTRAINT "header_brand_logo_image_id_media_id_fk";
  
  ALTER TABLE "footer" DROP CONSTRAINT "footer_brand_logo_image_id_media_id_fk";
  
  DROP INDEX "header_brand_logo_brand_logo_image_idx";
  DROP INDEX "footer_brand_logo_brand_logo_image_idx";
  ALTER TABLE "header" DROP COLUMN "brand_display_mode";
  ALTER TABLE "header" DROP COLUMN "brand_logo_image_id";
  ALTER TABLE "header" DROP COLUMN "brand_logo_alt_override";
  ALTER TABLE "footer" DROP COLUMN "brand_display_mode";
  ALTER TABLE "footer" DROP COLUMN "brand_logo_image_id";
  ALTER TABLE "footer" DROP COLUMN "brand_logo_alt_override";
  DROP TYPE "public"."enum_header_brand_display_mode";
  DROP TYPE "public"."enum_footer_brand_display_mode";`);
}
