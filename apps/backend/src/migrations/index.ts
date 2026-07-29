import * as migration_20260724_021715_initial_hardened_page_builder from './20260724_021715_initial_hardened_page_builder';
import * as migration_20260728_170815_areas from './20260728_170815_areas';
import * as migration_20260728_171453_listings from './20260728_171453_listings';
import * as migration_20260728_171840_sync_logs_and_jobs from './20260728_171840_sync_logs_and_jobs';
import * as migration_20260728_184449_is_featured_on_listings from './20260728_184449_is_featured_on_listings';
import * as migration_20260728_194202_area_community_editorial_fields from './20260728_194202_area_community_editorial_fields';
import * as migration_20260728_204147_brokers_and_area_detail_fields from './20260728_204147_brokers_and_area_detail_fields';
import * as migration_20260728_233845_leads_and_lead_name_split_add from './20260728_233845_leads_and_lead_name_split_add';
import * as migration_20260728_233911_drop_lead_capture_legacy_name from './20260728_233911_drop_lead_capture_legacy_name';
import * as migration_20260728_235518_add_sync_lead_task_slug from './20260728_235518_add_sync_lead_task_slug';
import * as migration_20260729_163225_drop_lead_crm_client_id from './20260729_163225_drop_lead_crm_client_id';

export const migrations = [
  {
    up: migration_20260724_021715_initial_hardened_page_builder.up,
    down: migration_20260724_021715_initial_hardened_page_builder.down,
    name: '20260724_021715_initial_hardened_page_builder',
  },
  {
    up: migration_20260728_170815_areas.up,
    down: migration_20260728_170815_areas.down,
    name: '20260728_170815_areas',
  },
  {
    up: migration_20260728_171453_listings.up,
    down: migration_20260728_171453_listings.down,
    name: '20260728_171453_listings',
  },
  {
    up: migration_20260728_171840_sync_logs_and_jobs.up,
    down: migration_20260728_171840_sync_logs_and_jobs.down,
    name: '20260728_171840_sync_logs_and_jobs',
  },
  {
    up: migration_20260728_184449_is_featured_on_listings.up,
    down: migration_20260728_184449_is_featured_on_listings.down,
    name: '20260728_184449_is_featured_on_listings',
  },
  {
    up: migration_20260728_194202_area_community_editorial_fields.up,
    down: migration_20260728_194202_area_community_editorial_fields.down,
    name: '20260728_194202_area_community_editorial_fields',
  },
  {
    up: migration_20260728_204147_brokers_and_area_detail_fields.up,
    down: migration_20260728_204147_brokers_and_area_detail_fields.down,
    name: '20260728_204147_brokers_and_area_detail_fields',
  },
  {
    up: migration_20260728_233845_leads_and_lead_name_split_add.up,
    down: migration_20260728_233845_leads_and_lead_name_split_add.down,
    name: '20260728_233845_leads_and_lead_name_split_add',
  },
  {
    up: migration_20260728_233911_drop_lead_capture_legacy_name.up,
    down: migration_20260728_233911_drop_lead_capture_legacy_name.down,
    name: '20260728_233911_drop_lead_capture_legacy_name',
  },
  {
    up: migration_20260728_235518_add_sync_lead_task_slug.up,
    down: migration_20260728_235518_add_sync_lead_task_slug.down,
    name: '20260728_235518_add_sync_lead_task_slug',
  },
  {
    up: migration_20260729_163225_drop_lead_crm_client_id.up,
    down: migration_20260729_163225_drop_lead_crm_client_id.down,
    name: '20260729_163225_drop_lead_crm_client_id',
  },
];
