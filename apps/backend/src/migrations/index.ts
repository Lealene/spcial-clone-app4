import * as migration_20260724_021715_initial_hardened_page_builder from './20260724_021715_initial_hardened_page_builder';
import * as migration_20260728_170815_areas from './20260728_170815_areas';
import * as migration_20260728_171453_listings from './20260728_171453_listings';
import * as migration_20260728_171840_sync_logs_and_jobs from './20260728_171840_sync_logs_and_jobs';
import * as migration_20260728_184449_is_featured_on_listings from './20260728_184449_is_featured_on_listings';
import * as migration_20260728_194202_area_community_editorial_fields from './20260728_194202_area_community_editorial_fields';
import * as migration_20260728_204147_brokers_and_area_detail_fields from './20260728_204147_brokers_and_area_detail_fields';

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
];
