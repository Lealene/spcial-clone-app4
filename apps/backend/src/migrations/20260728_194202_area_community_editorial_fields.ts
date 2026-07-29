import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ADD VALUE cannot be used in the same transaction as SET DEFAULT to that value.
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_blocks_communities_strip_source_mode" ADD VALUE IF NOT EXISTS 'areas';
  `);
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_blocks_featured_communities_source_mode" ADD VALUE IF NOT EXISTS 'areas';
  `);
  await db.execute(sql`
    ALTER TYPE "public"."enum__pages_v_blocks_communities_strip_source_mode" ADD VALUE IF NOT EXISTS 'areas';
  `);
  await db.execute(sql`
    ALTER TYPE "public"."enum__pages_v_blocks_featured_communities_source_mode" ADD VALUE IF NOT EXISTS 'areas';
  `);

  await db.execute(sql`
    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "locality" varchar;
    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "price_range" varchar;
    ALTER TABLE "areas" ADD COLUMN IF NOT EXISTS "total_residences" numeric;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "areas" DROP COLUMN IF EXISTS "locality";
    ALTER TABLE "areas" DROP COLUMN IF EXISTS "price_range";
    ALTER TABLE "areas" DROP COLUMN IF EXISTS "total_residences";
  `);
}
