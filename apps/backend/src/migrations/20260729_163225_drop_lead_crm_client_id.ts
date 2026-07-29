import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DROP COLUMN "crm_wise_agent_client_id";
  ALTER TABLE "leads" DROP COLUMN "crm_is_new_contact";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ADD COLUMN "crm_wise_agent_client_id" varchar;
  ALTER TABLE "leads" ADD COLUMN "crm_is_new_contact" boolean;`);
}
