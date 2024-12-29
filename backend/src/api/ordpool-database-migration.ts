
import DB from '../database';
import logger from '../logger';

class OrdpoolDatabaseMigration {

  // change this after every update
  private static currentVersion = 1;

  private queryTimeout = 3600_000;

  /**
   * Entry point
   */
  public async $initializeOrMigrateDatabase(): Promise<void> {
    logger.debug('ORDPOOL MIGRATIONS: Running migrations');

    const ordpoolDatabaseSchemaVersion = await this.$getOrdpoolSchemaVersionFromDatabase();

    if (ordpoolDatabaseSchemaVersion === 0) {
      logger.info('Changing database to Ordpool schema!');
      await this.$executeQuery(`INSERT INTO state VALUES('ordpool_schema_version', 0, NULL);`);
    }

    logger.debug('ORDPOOL MIGRATIONS: Current state.ordpool_schema_version ' + ordpoolDatabaseSchemaVersion);
    logger.debug('ORDPOOL MIGRATIONS: Latest OrdpoolDatabaseMigration.currentVersion is ' + OrdpoolDatabaseMigration.currentVersion);

    if (ordpoolDatabaseSchemaVersion >= OrdpoolDatabaseMigration.currentVersion) {
      logger.debug('ORDPOOL MIGRATIONS: Nothing to do.');
      return;
    }

    if (OrdpoolDatabaseMigration.currentVersion > ordpoolDatabaseSchemaVersion) {
      try {
        await this.$migrateTableSchemaFromVersion(ordpoolDatabaseSchemaVersion);
        logger.notice(`ORDPOOL MIGRATIONS: OK. Database schema have been migrated from version ${ordpoolDatabaseSchemaVersion} to ${OrdpoolDatabaseMigration.currentVersion} (latest version)`);
      } catch (e) {
        logger.err('ORDPOOL MIGRATIONS: Unable to migrate database, aborting. ' + e);
      }
    }

    return;
  }

  /**
   * Small query execution wrapper to log all executed queries
   */
  private async $executeQuery(query: string, silent = false): Promise<any> {
    if (!silent) {
      logger.debug('ORDPOOL MIGRATIONS: Execute query:\n' + query);
    }
    return DB.query({ sql: query, timeout: this.queryTimeout });
  }

  /**
   * Get current ordpool database version, or 0 if 'ordpool_schema_version' does not exists.
   */
  private async $getOrdpoolSchemaVersionFromDatabase(): Promise<number> {
    const query = `SELECT IFNULL((SELECT number FROM state WHERE name = 'ordpool_schema_version'), 0) AS number;`;
    const [rows] = await this.$executeQuery(query, true);
    return rows[0]['number'];
  }

  /**
   * We actually execute the migrations queries here
   */
  private async $migrateTableSchemaFromVersion(version: number): Promise<void> {
    const transactionQueries: string[] = [];
    for (const query of this.getMigrationQueriesFromVersion(version)) {
      transactionQueries.push(query);
    }

    logger.notice(`ORDPOOL MIGRATIONS: ${version > 0 ? 'Upgrading' : 'Initializing'} database schema version number to ${OrdpoolDatabaseMigration.currentVersion}`);
    transactionQueries.push(this.getUpdateToLatestSchemaVersionQuery());

    try {
      await this.$executeQuery('START TRANSACTION;');
      for (const query of transactionQueries) {
        await this.$executeQuery(query);
      }
      await this.$executeQuery('COMMIT;');
    } catch (e) {
      await this.$executeQuery('ROLLBACK;');
      throw e;
    }
  }

  /**
   * Generate migration queries based on schema version
   */
  private getMigrationQueriesFromVersion(version: number): string[] {
    const queries: string[] = [];

    if (version <= 1) {

      // MANUAL CLEANUP ALL PREVIOUS ATTEMPTS 😅
      queries.push(`ALTER TABLE blocks
        DROP COLUMN IF EXISTS amount_atomical,
        DROP COLUMN IF EXISTS amount_atomical_mint,
        DROP COLUMN IF EXISTS amount_atomical_transfer,
        DROP COLUMN IF EXISTS amount_atomcial_update,

        DROP COLUMN IF EXISTS amount_cat21,
        DROP COLUMN IF EXISTS amount_cat21_mint,
        DROP COLUMN IF EXISTS amount_cat21_transfer,

        DROP COLUMN IF EXISTS amount_inscription,
        DROP COLUMN IF EXISTS amount_inscription_mint,
        DROP COLUMN IF EXISTS amount_inscription_transfer,
        DROP COLUMN IF EXISTS amount_inscription_burn,

        DROP COLUMN IF EXISTS amount_runestone,
        DROP COLUMN IF EXISTS amount_rune,
        DROP COLUMN IF EXISTS amount_rune_etch,
        DROP COLUMN IF EXISTS amount_rune_transfer,
        DROP COLUMN IF EXISTS amount_rune_burn,

        DROP COLUMN IF EXISTS amount_brc20,
        DROP COLUMN IF EXISTS amount_brc20_deploy,
        DROP COLUMN IF EXISTS amount_brc20_mint,
        DROP COLUMN IF EXISTS amount_brc20_transfer,

        DROP COLUMN IF EXISTS amount_src20,
        DROP COLUMN IF EXISTS amount_src20_deploy,
        DROP COLUMN IF EXISTS amount_src20_mint,
        DROP COLUMN IF EXISTS amount_src20_transfer,

        DROP COLUMN IF EXISTS analyser_version,

        DROP COLUMN IF EXISTS amounts_atomical,
        DROP COLUMN IF EXISTS amounts_atomical_mint,
        DROP COLUMN IF EXISTS amounts_atomical_transfer,
        DROP COLUMN IF EXISTS amounts_atomical_update,
        DROP COLUMN IF EXISTS amounts_cat21,
        DROP COLUMN IF EXISTS amounts_cat21_mint,
        DROP COLUMN IF EXISTS amounts_cat21_transfer,
        DROP COLUMN IF EXISTS amounts_inscription,
        DROP COLUMN IF EXISTS amounts_inscription_mint,
        DROP COLUMN IF EXISTS amounts_inscription_transfer,
        DROP COLUMN IF EXISTS amounts_inscription_burn,
        DROP COLUMN IF EXISTS amounts_rune,
        DROP COLUMN IF EXISTS amounts_rune_etch,
        DROP COLUMN IF EXISTS amounts_rune_mint,
        DROP COLUMN IF EXISTS amounts_rune_cenotaph,
        DROP COLUMN IF EXISTS amounts_rune_transfer,
        DROP COLUMN IF EXISTS amounts_rune_burn,
        DROP COLUMN IF EXISTS amounts_brc20,
        DROP COLUMN IF EXISTS amounts_brc20_deploy,
        DROP COLUMN IF EXISTS amounts_brc20_mint,
        DROP COLUMN IF EXISTS amounts_brc20_transfer,
        DROP COLUMN IF EXISTS amounts_src20,
        DROP COLUMN IF EXISTS amounts_src20_deploy,
        DROP COLUMN IF EXISTS amounts_src20_mint,
        DROP COLUMN IF EXISTS amounts_src20_transfer,
        DROP COLUMN IF EXISTS fees_rune_mints,
        DROP COLUMN IF EXISTS fees_non_uncommon_rune_mints,
        DROP COLUMN IF EXISTS fees_brc20_mints,
        DROP COLUMN IF EXISTS fees_src20_mints,
        DROP COLUMN IF EXISTS fees_cat21_mints,
        DROP COLUMN IF EXISTS fees_atomicals,
        DROP COLUMN IF EXISTS fees_inscription_mints,
        DROP COLUMN IF EXISTS inscriptions_total_envelope_size,
        DROP COLUMN IF EXISTS inscriptions_total_content_size,
        DROP COLUMN IF EXISTS inscriptions_largest_envelope_size,
        DROP COLUMN IF EXISTS inscriptions_largest_content_size,
        DROP COLUMN IF EXISTS inscriptions_largest_envelope_inscription_id,
        DROP COLUMN IF EXISTS inscriptions_largest_content_inscription_id,
        DROP COLUMN IF EXISTS inscriptions_average_envelope_size,
        DROP COLUMN IF EXISTS inscriptions_average_content_size,
        DROP COLUMN IF EXISTS runes_most_active_mint,
        DROP COLUMN IF EXISTS runes_most_active_non_uncommon_mint,
        DROP COLUMN IF EXISTS brc20_most_active_mint,
        DROP COLUMN IF EXISTS src20_most_active_mint;`);


       queries.push(`CREATE TABLE ordpool_stats (
          hash                                         VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height                                       INT(10) UNSIGNED NOT NULL,

          amounts_atomical                             INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_atomical_mint                        INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_atomical_transfer                    INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_atomical_update                      INT UNSIGNED NOT NULL DEFAULT 0,

          amounts_cat21                                INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_cat21_mint                           INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_cat21_transfer                       INT UNSIGNED NOT NULL DEFAULT 0,

          amounts_inscription                          INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_inscription_mint                     INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_inscription_transfer                 INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_inscription_burn                     INT UNSIGNED NOT NULL DEFAULT 0,

          amounts_rune                                 INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_rune_etch                            INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_rune_mint                            INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_rune_cenotaph                        INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_rune_transfer                        INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_rune_burn                            INT UNSIGNED NOT NULL DEFAULT 0,

          amounts_brc20                                INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_brc20_deploy                         INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_brc20_mint                           INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_brc20_transfer                       INT UNSIGNED NOT NULL DEFAULT 0,

          amounts_src20                                INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_src20_deploy                         INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_src20_mint                           INT UNSIGNED NOT NULL DEFAULT 0,
          amounts_src20_transfer                       INT UNSIGNED NOT NULL DEFAULT 0,

          fees_rune_mints                              INT UNSIGNED NOT NULL DEFAULT 0,
          fees_non_uncommon_rune_mints                 INT UNSIGNED NOT NULL DEFAULT 0,
          fees_brc20_mints                             INT UNSIGNED NOT NULL DEFAULT 0,
          fees_src20_mints                             INT UNSIGNED NOT NULL DEFAULT 0,
          fees_cat21_mints                             INT UNSIGNED NOT NULL DEFAULT 0,
          fees_atomicals                               INT UNSIGNED NOT NULL DEFAULT 0,
          fees_inscription_mints                       INT UNSIGNED NOT NULL DEFAULT 0,

          inscriptions_total_envelope_size             INT UNSIGNED NOT NULL DEFAULT 0,
          inscriptions_total_content_size              INT UNSIGNED NOT NULL DEFAULT 0,
          inscriptions_largest_envelope_size           INT UNSIGNED NOT NULL DEFAULT 0,
          inscriptions_largest_content_size            INT UNSIGNED NOT NULL DEFAULT 0,

          -- assumptions: 64 (transaction ID) + 1 (i seperator) + 35 (index) = 100 characters, a 35 digits long index should be more than enough
          inscriptions_largest_envelope_inscription_id VARCHAR(100) CHARACTER SET ascii DEFAULT NULL,
          inscriptions_largest_content_inscription_id  VARCHAR(100) CHARACTER SET ascii DEFAULT NULL,

          inscriptions_average_envelope_size           INT UNSIGNED NOT NULL DEFAULT 0,
          inscriptions_average_content_size            INT UNSIGNED NOT NULL DEFAULT 0,

          -- this is the runes ID (block:tx)
          -- assumptions: 10 (block height) + 1 (: separator) + 7 (transaction index) = 18 characters, +2 to be very safe
          runes_most_active_mint                       VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
          runes_most_active_non_uncommon_mint          VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,

          -- Ticker names on Fractal Mainnet will be limited to 6 - 12 bytes.
          -- Tickers with 4 or 5 characters will not be permitted, as they are already in use on the Bitcoin mainnet.
          -- For brc-20 on Fractal, ticker names can include letters (both uppercase and lowercase: a-z/A-Z), numbers (0-9), and underscores (_).
          -- In total, you have 63 different characters to work with.
          -- Ticker names are not case-sensitive.
          -- https://docs.fractalbitcoin.io/doc/brc-20-on-fractal
          -- BUT there are are ticker names like '龙B' on mainnet --> we go full unicode to be safe
          -- 20 should be a save value
          brc20_most_active_mint                       VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,

          -- SRC20 ticker names on Bitcoin must must be 1-5 characters in length.
          -- https://github.com/stampchain-io/stamps_sdk/blob/main/docs/src20specs.md
          -- SRC20 ticker names on Fractal must be between 6 and 12 characters.
          -- https://docs.openstamp.io/introduction/src20-protocol/src20-on-fractal
          -- 20 should be a save value
          src20_most_active_mint                       VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,

          analyser_version                             INT UNSIGNED NOT NULL DEFAULT 0,

          PRIMARY KEY (hash)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        queries.push(`CREATE TABLE ordpool_stats_rune_mint_activity (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height INT(10) UNSIGNED NOT NULL,
          identifier VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          count INT NOT NULL,
          UNIQUE KEY (hash, identifier),
          INDEX idx_height (height)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        queries.push(`CREATE TABLE ordpool_stats_brc20_mint_activity (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height INT(10) UNSIGNED NOT NULL,
          identifier VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
          count INT NOT NULL,
          UNIQUE KEY (hash, identifier),
          INDEX idx_height (height)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        queries.push(`CREATE TABLE ordpool_stats_src20_mint_activity (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height INT(10) UNSIGNED NOT NULL,
          identifier VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
          count INT NOT NULL,
          UNIQUE KEY (hash, identifier),
          INDEX idx_height (height)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        queries.push(`CREATE TABLE ordpool_stats_rune_etch (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height INT(10) UNSIGNED NOT NULL,
          identifier VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          txid VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          UNIQUE KEY (hash, identifier, txid),
          INDEX idx_height (height)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        queries.push(`CREATE TABLE ordpool_stats_brc20_deploy (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height INT(10) UNSIGNED NOT NULL,
          identifier VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
          txid VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          UNIQUE KEY (hash, identifier, txid),
          INDEX idx_height (height)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        queries.push(`CREATE TABLE ordpool_stats_src20_deploy (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          height INT(10) UNSIGNED NOT NULL,
          identifier VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
          txid VARCHAR(65) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
          UNIQUE KEY (hash, identifier, txid),
          INDEX idx_height (height)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    }

    return queries;
  }

  /**
   * Save the schema version in the database
   */
  private getUpdateToLatestSchemaVersionQuery(): string {
    return `UPDATE state SET number = ${OrdpoolDatabaseMigration.currentVersion} WHERE name = 'ordpool_schema_version';`;
  }
}

export default new OrdpoolDatabaseMigration();
