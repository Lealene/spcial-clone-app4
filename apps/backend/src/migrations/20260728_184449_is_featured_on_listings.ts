import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "listings" ADD COLUMN "is_featured" boolean DEFAULT false;
  CREATE INDEX "listings_is_featured_idx" ON "listings" USING btree ("is_featured");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "listings_is_featured_idx";
  ALTER TABLE "listings" DROP COLUMN "is_featured";`);
}
