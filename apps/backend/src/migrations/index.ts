import * as migration_20260724_021715_initial_hardened_page_builder from './20260724_021715_initial_hardened_page_builder';

export const migrations = [
  {
    up: migration_20260724_021715_initial_hardened_page_builder.up,
    down: migration_20260724_021715_initial_hardened_page_builder.down,
    name: '20260724_021715_initial_hardened_page_builder',
  },
];
