import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_columns_source" AS ENUM('manual', 'communities');
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"areas_id" integer
  );
  
  ALTER TABLE "footer_columns_links" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_label" DROP NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_type" DROP NOT NULL;
  ALTER TABLE "footer_columns" ADD COLUMN "source" "enum_footer_columns_source" DEFAULT 'manual' NOT NULL;
  ALTER TABLE "footer_columns" ADD COLUMN "community_limit" numeric DEFAULT 6;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_areas_id_idx" ON "footer_rels" USING btree ("areas_id");`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_rels" CASCADE;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_label" SET NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_type" SET NOT NULL;
  ALTER TABLE "footer_columns" DROP COLUMN "source";
  ALTER TABLE "footer_columns" DROP COLUMN "community_limit";
  DROP TYPE "public"."enum_footer_columns_source";`);
}
