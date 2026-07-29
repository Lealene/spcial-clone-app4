import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "listings" ADD COLUMN "latitude" numeric;
  ALTER TABLE "listings" ADD COLUMN "longitude" numeric;`);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "listings" DROP COLUMN "latitude";
  ALTER TABLE "listings" DROP COLUMN "longitude";`);
}
