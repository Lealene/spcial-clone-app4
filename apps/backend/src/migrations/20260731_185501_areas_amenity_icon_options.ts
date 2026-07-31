import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

/**
 * Widens `enum_areas_amenities_icon` to match `COMMUNITY_AMENITY_ICONS` in
 * @mvp-realty/api-contracts. `ADD VALUE` is additive, so `up` is safe to re-run
 * against a partially-migrated database; `down` rebuilds the original enum and will
 * fail if any row already uses one of the new values.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'pickleball';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'tennis';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'boating';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'kayak';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'playground';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'concierge';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'valet';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'business-center';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'library';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'garden';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'bike';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'theater';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'sauna';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'yoga';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'cafe';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'bar';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'events';
  ALTER TYPE "public"."enum_areas_amenities_icon" ADD VALUE 'card-room';`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "areas_amenities" ALTER COLUMN "icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_areas_amenities_icon";
  CREATE TYPE "public"."enum_areas_amenities_icon" AS ENUM('golf', 'marina', 'beach', 'racquet', 'fitness', 'dining', 'trails', 'pool', 'club', 'spa', 'gate', 'dog');
  ALTER TABLE "areas_amenities" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_areas_amenities_icon" USING "icon"::"public"."enum_areas_amenities_icon";`);
}
