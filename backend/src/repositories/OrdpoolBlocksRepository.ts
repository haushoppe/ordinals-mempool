import { Cat21Mint, compactToBrc20DeployAttempts, compactToMinimalCat21Mints, compactToMintActivity, compactToRuneEtchAttempts, compactToSrc20DeployAttempts, OrdpoolStats, traitsToCompactColors } from 'ordpool-parser';

import DB from '../database';
import logger from '../logger';


export interface OrdpoolDatabaseBlock {
  id: string;
  height: number;

  amountsAtomical: number;
  amountsAtomicalMint: number;
  amountsAtomicalTransfer: number;
  amountsAtomicalUpdate: number;

  amountsCat21: number;
  amountsCat21Mint: number;
  amountsCat21Transfer: number;

  amountsInscription: number;
  amountsInscriptionMint: number;
  amountsInscriptionTransfer: number;
  amountsInscriptionBurn: number;

  amountsRune: number;
  amountsRuneEtch: number;
  amountsRuneMint: number;
  amountsRuneCenotaph: number;
  amountsRuneTransfer: number;
  amountsRuneBurn: number;

  amountsBrc20: number;
  amountsBrc20Deploy: number;
  amountsBrc20Mint: number;
  amountsBrc20Transfer: number;

  amountsSrc20: number;
  amountsSrc20Deploy: number;
  amountsSrc20Mint: number;
  amountsSrc20Transfer: number;

  feesRuneMints: number;
  feesNonUncommonRuneMints: number;
  feesBrc20Mints: number;
  feesSrc20Mints: number;
  feesCat21Mints: number;
  feesAtomicals: number;
  feesInscriptionMints: number;

  inscriptionsTotalEnvelopeSize: number;
  inscriptionsTotalContentSize: number;
  inscriptionsLargestEnvelopeSize: number;
  inscriptionsLargestContentSize: number;
  inscriptionsLargestEnvelopeInscriptionId: string | null;
  inscriptionsLargestContentInscriptionId: string | null;
  inscriptionsAverageEnvelopeSize: number;
  inscriptionsAverageContentSize: number;

  runesMostActiveMint: string | null;
  runesMostActiveNonUncommonMint: string | null;
  brc20MostActiveMint: string | null;
  src20MostActiveMint: string | null;

  analyserVersion: number;

  runeMintActivity: string;
  brc20MintActivity: string;
  src20MintActivity: string;
  cat21MintActivity: string;

  runeEtchAttempts: string;
  brc20DeployAttempts: string;
  src20DeployAttempts: string;
}

export const ORDPOOL_BLOCK_DB_FIELDS = `

  /* HACK -- Ordpool stats */
  ordpool_stats.amounts_atomical                             AS amountsAtomical,                           /* 1 */
  ordpool_stats.amounts_atomical_mint                        AS amountsAtomicalMint,                       /* 2 */
  ordpool_stats.amounts_atomical_transfer                    AS amountsAtomicalTransfer,                   /* 3 */
  ordpool_stats.amounts_atomical_update                      AS amountsAtomicalUpdate,                     /* 4 */

  ordpool_stats.amounts_cat21                                AS amountsCat21,                              /* 5 */
  ordpool_stats.amounts_cat21_mint                           AS amountsCat21Mint,                          /* 6 */
  ordpool_stats.amounts_cat21_transfer                       AS amountsCat21Transfer,                      /* 7 */

  ordpool_stats.amounts_inscription                          AS amountsInscription,                        /* 8 */
  ordpool_stats.amounts_inscription_mint                     AS amountsInscriptionMint,                    /* 9 */
  ordpool_stats.amounts_inscription_transfer                 AS amountsInscriptionTransfer,                /* 10 */
  ordpool_stats.amounts_inscription_burn                     AS amountsInscriptionBurn,                    /* 11 */

  ordpool_stats.amounts_rune                                 AS amountsRune,                               /* 12 */
  ordpool_stats.amounts_rune_etch                            AS amountsRuneEtch,                           /* 13 */
  ordpool_stats.amounts_rune_mint                            AS amountsRuneMint,                           /* 14 */
  ordpool_stats.amounts_rune_cenotaph                        AS amountsRuneCenotaph,                       /* 15 */
  ordpool_stats.amounts_rune_transfer                        AS amountsRuneTransfer,                       /* 16 */
  ordpool_stats.amounts_rune_burn                            AS amountsRuneBurn,                           /* 17 */

  ordpool_stats.amounts_brc20                                AS amountsBrc20,                              /* 18 */
  ordpool_stats.amounts_brc20_deploy                         AS amountsBrc20Deploy,                        /* 19 */
  ordpool_stats.amounts_brc20_mint                           AS amountsBrc20Mint,                          /* 20 */
  ordpool_stats.amounts_brc20_transfer                       AS amountsBrc20Transfer,                      /* 21 */

  ordpool_stats.amounts_src20                                AS amountsSrc20,                              /* 22 */
  ordpool_stats.amounts_src20_deploy                         AS amountsSrc20Deploy,                        /* 23 */
  ordpool_stats.amounts_src20_mint                           AS amountsSrc20Mint,                          /* 24 */
  ordpool_stats.amounts_src20_transfer                       AS amountsSrc20Transfer,                      /* 25 */

  ordpool_stats.fees_rune_mints                              AS feesRuneMints,                             /* 26 */
  ordpool_stats.fees_non_uncommon_rune_mints                 AS feesNonUncommonRuneMints,                  /* 27 */
  ordpool_stats.fees_brc20_mints                             AS feesBrc20Mints,                            /* 28 */
  ordpool_stats.fees_src20_mints                             AS feesSrc20Mints,                            /* 29 */
  ordpool_stats.fees_cat21_mints                             AS feesCat21Mints,                            /* 30 */
  ordpool_stats.fees_atomicals                               AS feesAtomicals,                             /* 31 */
  ordpool_stats.fees_inscription_mints                       AS feesInscriptionMints,                      /* 32 */

  ordpool_stats.inscriptions_total_envelope_size             AS inscriptionsTotalEnvelopeSize,             /* 33 */
  ordpool_stats.inscriptions_total_content_size              AS inscriptionsTotalContentSize,              /* 34 */
  ordpool_stats.inscriptions_largest_envelope_size           AS inscriptionsLargestEnvelopeSize,           /* 35 */
  ordpool_stats.inscriptions_largest_content_size            AS inscriptionsLargestContentSize,            /* 36 */
  ordpool_stats.inscriptions_largest_envelope_inscription_id AS inscriptionsLargestEnvelopeInscriptionId,  /* 37 */
  ordpool_stats.inscriptions_largest_content_inscription_id  AS inscriptionsLargestContentInscriptionId,   /* 38 */
  ordpool_stats.inscriptions_average_envelope_size           AS inscriptionsAverageEnvelopeSize,           /* 39 */
  ordpool_stats.inscriptions_average_content_size            AS inscriptionsAverageContentSize,            /* 40 */

  ordpool_stats.runes_most_active_mint                       AS runesMostActiveMint,                       /* 41 */
  ordpool_stats.runes_most_active_non_uncommon_mint          AS runesMostActiveNonUncommonMint,            /* 42 */
  ordpool_stats.brc20_most_active_mint                       AS brc20MostActiveMint,                       /* 43 */
  ordpool_stats.src20_most_active_mint                       AS src20MostActiveMint,                       /* 44 */

  ordpool_stats.analyser_version                             AS analyserVersion,                           /* 45 */

  -- Mint Activities
  GROUP_CONCAT(DISTINCT CONCAT(rune_mint.identifier, ',',  rune_mint.count)  ORDER BY rune_mint.count DESC) AS runeMintActivity,
  GROUP_CONCAT(DISTINCT CONCAT(brc20_mint.identifier, ',', brc20_mint.count) ORDER BY brc20_mint.count DESC) AS brc20MintActivity,
  GROUP_CONCAT(DISTINCT CONCAT(src20_mint.identifier, ',', src20_mint.count) ORDER BY src20_mint.count DESC) AS src20MintActivity,

  GROUP_CONCAT(
    DISTINCT CONCAT(
      cat21_mint.txid, '|',
      cat21_mint.fee, '|',
      cat21_mint.weight
    ) SEPARATOR ','
  ) AS cat21MintActivity,

  -- Etch/Deploy Attempts
  GROUP_CONCAT(
    DISTINCT CONCAT(
      rune_etch.txid,                       '|', --  1
      rune_etch.rune_id,                    '|', --  2
      COALESCE(rune_etch.rune_name, ''),    '|', --  3
      COALESCE(rune_etch.divisibility, ''), '|', --  4
      COALESCE(rune_etch.premine, ''),      '|', --  5
      COALESCE(rune_etch.symbol, ''),       '|', --  6
      COALESCE(rune_etch.cap, ''),          '|', --  7
      COALESCE(rune_etch.amount, ''),       '|', --  8
      COALESCE(rune_etch.offset_start, ''), '|', --  9
      COALESCE(rune_etch.offset_end, ''),   '|', -- 10
      COALESCE(rune_etch.height_start, ''), '|', -- 11
      COALESCE(rune_etch.height_end, ''),   '|', -- 12
      IF(rune_etch.turbo, '1', '')               -- 13
    )
  ) AS runeEtchAttempts,

  GROUP_CONCAT(
    DISTINCT CONCAT(
      COALESCE(brc20_deploy.txid, ''),       '|',
      COALESCE(brc20_deploy.ticker, ''),     '|',
      COALESCE(brc20_deploy.max_supply, ''), '|',
      COALESCE(brc20_deploy.mint_limit, ''), '|',
      COALESCE(brc20_deploy.decimals, '')
    )
  ) AS brc20DeployAttempts,

  GROUP_CONCAT(
    DISTINCT CONCAT(
      COALESCE(src20_deploy.txid, ''),       '|',
      COALESCE(src20_deploy.ticker, ''),     '|',
      COALESCE(src20_deploy.max_supply, ''), '|',
      COALESCE(src20_deploy.mint_limit, ''), '|',
      COALESCE(src20_deploy.decimals, '')
    )
  ) AS src20DeployAttempts
`;


class OrdpoolBlocksRepository {
  /**
   * Save indexed block data in the database
   */
  public async saveBlockOrdpoolStatsInDatabase(block: {
    id: string,
    height: number,
    extras: {
      ordpoolStats: OrdpoolStats
    }
  }): Promise<void> {

    if (!block.extras.ordpoolStats) {
      return;
    }

    try {
      const query = `INSERT INTO ordpool_stats(
        hash,
        height,

        amounts_atomical,                                   /* 1 */
        amounts_atomical_mint,                              /* 2 */
        amounts_atomical_transfer,                          /* 3 */
        amounts_atomical_update,                            /* 4 */

        amounts_cat21,                                      /* 5 */
        amounts_cat21_mint,                                 /* 6 */
        amounts_cat21_transfer,                             /* 7 */

        amounts_inscription,                                /* 8 */
        amounts_inscription_mint,                           /* 9 */
        amounts_inscription_transfer,                       /* 10 */
        amounts_inscription_burn,                           /* 11 */

        amounts_rune,                                       /* 12 */
        amounts_rune_etch,                                  /* 13 */
        amounts_rune_mint,                                  /* 14 */
        amounts_rune_cenotaph,                              /* 15 */
        amounts_rune_transfer,                              /* 16 */
        amounts_rune_burn,                                  /* 17 */

        amounts_brc20,                                      /* 18 */
        amounts_brc20_deploy,                               /* 19 */
        amounts_brc20_mint,                                 /* 20 */
        amounts_brc20_transfer,                             /* 21 */

        amounts_src20,                                      /* 22 */
        amounts_src20_deploy,                               /* 23 */
        amounts_src20_mint,                                 /* 24 */
        amounts_src20_transfer,                             /* 25 */

        fees_rune_mints,                                    /* 26 */
        fees_non_uncommon_rune_mints,                       /* 27 */
        fees_brc20_mints,                                   /* 28 */
        fees_src20_mints,                                   /* 29 */
        fees_cat21_mints,                                   /* 30 */
        fees_atomicals,                                     /* 31 */
        fees_inscription_mints,                             /* 32 */

        inscriptions_total_envelope_size,                   /* 33 */
        inscriptions_total_content_size,                    /* 34 */
        inscriptions_largest_envelope_size,                 /* 35 */
        inscriptions_largest_content_size,                  /* 36 */
        inscriptions_largest_envelope_inscription_id,       /* 37 */
        inscriptions_largest_content_inscription_id,        /* 38 */
        inscriptions_average_envelope_size,                 /* 39 */
        inscriptions_average_content_size,                  /* 40 */

        runes_most_active_mint,                             /* 41 */
        runes_most_active_non_uncommon_mint,                /* 42 */
        brc20_most_active_mint,                             /* 43 */
        src20_most_active_mint,                             /* 44 */

        analyser_version                                    /* 45 */

      ) VALUE (
        ?,
        ?,

        ?,  /* 1 amounts_atomical */
        ?,  /* 2 amounts_atomical_mint */
        ?,  /* 3 amounts_atomical_transfer */
        ?,  /* 4 amounts_atomical_update */

        ?,  /* 5 amounts_cat21 */
        ?,  /* 6 amounts_cat21_mint */
        ?,  /* 7 amounts_cat21_transfer */

        ?,  /* 8 amounts_inscription */
        ?,  /* 9 amounts_inscription_mint */
        ?,  /* 10 amounts_inscription_transfer */
        ?,  /* 11 amounts_inscription_burn */

        ?,  /* 12 amounts_rune */
        ?,  /* 13 amounts_rune_etch */
        ?,  /* 14 amounts_rune_mint */
        ?,  /* 15 amounts_rune_cenotaph */
        ?,  /* 16 amounts_rune_transfer */
        ?,  /* 17 amounts_rune_burn */

        ?,  /* 18 amounts_brc20 */
        ?,  /* 19 amounts_brc20_deploy */
        ?,  /* 20 amounts_brc20_mint */
        ?,  /* 21 amounts_brc20_transfer */

        ?,  /* 22 amounts_src20 */
        ?,  /* 23 amounts_src20_deploy */
        ?,  /* 24 amounts_src20_mint */
        ?,  /* 25 amounts_src20_transfer */

        ?,  /* 26 fees_rune_mints */
        ?,  /* 27 fees_non_uncommon_rune_mints */
        ?,  /* 28 fees_brc20_mints */
        ?,  /* 29 fees_src20_mints */
        ?,  /* 30 fees_cat21_mints */
        ?,  /* 31 fees_atomicals */
        ?,  /* 32 fees_inscription_mints */

        ?,  /* 33 inscriptions_total_envelope_size */
        ?,  /* 34 inscriptions_total_content_size */
        ?,  /* 35 inscriptions_largest_envelope_size */
        ?,  /* 36 inscriptions_largest_content_size */
        ?,  /* 37 inscriptions_largest_envelope_inscription_id */
        ?,  /* 38 inscriptions_largest_content_inscription_id */
        ?,  /* 39 inscriptions_average_envelope_size */
        ?,  /* 40 inscriptions_average_content_size */

        LEFT(?, 20),  /* 41 runes_most_active_mint - truncated to 20 ASCII characters */
        LEFT(?, 20),  /* 42 runes_most_active_non_uncommon_mint - truncated to 20 ASCII characters */
        LEFT(?, 20),  /* 43 brc20_most_active_mint - truncated to 20 Unicode characters (between 1 and 4 bytes) */
        LEFT(?, 20),  /* 44 src20_most_active_mint - truncated to 20 Unicode characters (between 1 and 4 bytes) */

        ?   /* 45 analyser_version */
      )`;

      const params: any[] = [
        block.id,
        block.height,

        block.extras.ordpoolStats.amounts.atomical,                           // 1
        block.extras.ordpoolStats.amounts.atomicalMint,                       // 2
        block.extras.ordpoolStats.amounts.atomicalTransfer,                   // 3
        block.extras.ordpoolStats.amounts.atomicalUpdate,                     // 4

        block.extras.ordpoolStats.amounts.cat21,                              // 5
        block.extras.ordpoolStats.amounts.cat21Mint,                          // 6
        block.extras.ordpoolStats.amounts.cat21Transfer,                      // 7

        block.extras.ordpoolStats.amounts.inscription,                        // 8
        block.extras.ordpoolStats.amounts.inscriptionMint,                    // 9
        block.extras.ordpoolStats.amounts.inscriptionTransfer,                // 10
        block.extras.ordpoolStats.amounts.inscriptionBurn,                    // 11

        block.extras.ordpoolStats.amounts.rune,                               // 12
        block.extras.ordpoolStats.amounts.runeEtch,                           // 13
        block.extras.ordpoolStats.amounts.runeMint,                           // 14
        block.extras.ordpoolStats.amounts.runeCenotaph,                       // 15
        block.extras.ordpoolStats.amounts.runeTransfer,                       // 16
        block.extras.ordpoolStats.amounts.runeBurn,                           // 17

        block.extras.ordpoolStats.amounts.brc20,                              // 18
        block.extras.ordpoolStats.amounts.brc20Deploy,                        // 19
        block.extras.ordpoolStats.amounts.brc20Mint,                          // 20
        block.extras.ordpoolStats.amounts.brc20Transfer,                      // 21

        block.extras.ordpoolStats.amounts.src20,                              // 22
        block.extras.ordpoolStats.amounts.src20Deploy,                        // 23
        block.extras.ordpoolStats.amounts.src20Mint,                          // 24
        block.extras.ordpoolStats.amounts.src20Transfer,                      // 25

        block.extras.ordpoolStats.fees.runeMints,                             // 26
        block.extras.ordpoolStats.fees.nonUncommonRuneMints,                  // 27
        block.extras.ordpoolStats.fees.brc20Mints,                            // 28
        block.extras.ordpoolStats.fees.src20Mints,                            // 29
        block.extras.ordpoolStats.fees.cat21Mints,                            // 30
        block.extras.ordpoolStats.fees.atomicals,                             // 31
        block.extras.ordpoolStats.fees.inscriptionMints,                      // 32

        block.extras.ordpoolStats.inscriptions.totalEnvelopeSize,             // 33
        block.extras.ordpoolStats.inscriptions.totalContentSize,              // 34
        block.extras.ordpoolStats.inscriptions.largestEnvelopeSize,           // 35
        block.extras.ordpoolStats.inscriptions.largestContentSize,            // 36
        block.extras.ordpoolStats.inscriptions.largestEnvelopeInscriptionId,  // 37
        block.extras.ordpoolStats.inscriptions.largestContentInscriptionId,   // 38
        block.extras.ordpoolStats.inscriptions.averageEnvelopeSize,           // 39
        block.extras.ordpoolStats.inscriptions.averageContentSize,            // 40

        block.extras.ordpoolStats.runes.mostActiveMint,                       // 41
        block.extras.ordpoolStats.runes.mostActiveNonUncommonMint,            // 42
        block.extras.ordpoolStats.brc20.mostActiveMint,                       // 43
        block.extras.ordpoolStats.src20.mostActiveMint,                       // 44

        block.extras.ordpoolStats.version                                     // 45
      ];

      await DB.query(query, params);

      await this.saveTokenActivity(block.id, block.height, block.extras.ordpoolStats);

      logger.debug(`$saveBlockOrdpoolStatsInDatabase() - Block ${block.height} successfully stored!`, logger.tags.mining);

    } catch (e: any) {
      if (e.errno === 1062) {
        logger.debug(`$saveBlockOrdpoolStatsInDatabase() - Block ${block.height} has already been indexed, ignoring`, logger.tags.mining);
      } else {
        logger.err('Cannot save indexed block into ordpool_stats. Reason: ' + (e instanceof Error ? e.message : e), logger.tags.mining);
        throw e;
      }
    }
  }

  public formatDbBlockIntoOrdpoolStats(dbBlk: OrdpoolDatabaseBlock): OrdpoolStats | undefined {

    if (!dbBlk.analyserVersion) {
      return undefined;
    }

    return {
      amounts: {
        atomical: dbBlk.amountsAtomical,
        atomicalMint: dbBlk.amountsAtomicalMint,
        atomicalTransfer: dbBlk.amountsAtomicalTransfer,
        atomicalUpdate: dbBlk.amountsAtomicalUpdate,

        cat21: dbBlk.amountsCat21,
        cat21Mint: dbBlk.amountsCat21Mint,
        cat21Transfer: dbBlk.amountsCat21Transfer,

        inscription: dbBlk.amountsInscription,
        inscriptionMint: dbBlk.amountsInscriptionMint,
        inscriptionTransfer: dbBlk.amountsInscriptionTransfer,
        inscriptionBurn: dbBlk.amountsInscriptionBurn,

        rune: dbBlk.amountsRune,
        runeEtch: dbBlk.amountsRuneEtch,
        runeMint: dbBlk.amountsRuneMint,
        runeCenotaph: dbBlk.amountsRuneCenotaph,
        runeTransfer: dbBlk.amountsRuneTransfer,
        runeBurn: dbBlk.amountsRuneBurn,

        brc20: dbBlk.amountsBrc20,
        brc20Deploy: dbBlk.amountsBrc20Deploy,
        brc20Mint: dbBlk.amountsBrc20Mint,
        brc20Transfer: dbBlk.amountsBrc20Transfer,

        src20: dbBlk.amountsSrc20,
        src20Deploy: dbBlk.amountsSrc20Deploy,
        src20Mint: dbBlk.amountsSrc20Mint,
        src20Transfer: dbBlk.amountsSrc20Transfer
      },
      fees: {
        runeMints: dbBlk.feesRuneMints,
        nonUncommonRuneMints: dbBlk.feesNonUncommonRuneMints,
        brc20Mints: dbBlk.feesBrc20Mints,
        src20Mints: dbBlk.feesSrc20Mints,
        cat21Mints: dbBlk.feesCat21Mints,
        atomicals: dbBlk.feesAtomicals,
        inscriptionMints: dbBlk.feesInscriptionMints
      },
      inscriptions: {
        totalEnvelopeSize: dbBlk.inscriptionsTotalEnvelopeSize,
        totalContentSize: dbBlk.inscriptionsTotalContentSize,

        largestEnvelopeSize: dbBlk.inscriptionsLargestEnvelopeSize,
        largestContentSize: dbBlk.inscriptionsLargestContentSize,

        largestEnvelopeInscriptionId: dbBlk.inscriptionsLargestEnvelopeInscriptionId,
        largestContentInscriptionId: dbBlk.inscriptionsLargestContentInscriptionId,

        averageEnvelopeSize: dbBlk.inscriptionsAverageEnvelopeSize,
        averageContentSize: dbBlk.inscriptionsAverageContentSize
      },
      runes: {
        mostActiveMint: dbBlk.runesMostActiveMint,
        mostActiveNonUncommonMint: dbBlk.runesMostActiveNonUncommonMint,
        runeMintActivity: compactToMintActivity(dbBlk.runeMintActivity),
        runeEtchAttempts: compactToRuneEtchAttempts(dbBlk.runeEtchAttempts)
      },
      brc20: {
        mostActiveMint: dbBlk.brc20MostActiveMint,
        brc20MintActivity: compactToMintActivity(dbBlk.brc20MintActivity),
        brc20DeployAttempts: compactToBrc20DeployAttempts(dbBlk.brc20DeployAttempts)
      },
      src20: {
        mostActiveMint: dbBlk.src20MostActiveMint,
        src20MintActivity: compactToMintActivity(dbBlk.src20MintActivity),
        src20DeployAttempts: compactToSrc20DeployAttempts(dbBlk.src20DeployAttempts)
      },
      cat21: {
        minimalCat21MintActivity: compactToMinimalCat21Mints(dbBlk.cat21MintActivity)
      },
      version: dbBlk.analyserVersion
    };
  }

  /**
   * Inserts generic mint activity data in batches into the database.
   * The identifier is always truncated to 20 chars
   *
   * WARNING: Avoid setting the `batchSize` too high. A very large batch size may cause:
   * - Queries exceeding `max_allowed_packet` size in MySQL.
   * - Performance bottlenecks due to a single large insert operation.
   *
   * @param tableName - The target table name.
   * @param data - The data to insert, as an array of rows.
   * @param batchSize - Number of rows to include in a single batch (default: 100).
   */
  async batchInsertMintActivity(
    tableName: string,
    data: { hash: string; height: number; identifier: string; count: number }[],
    batchSize = 100
  ): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = batch.map(() => `(?, ?, LEFT(?, 20), ?)`).join(', ');

      const query = `
        INSERT INTO ${tableName} (hash, height, identifier, count)
        VALUES ${values}
        ON DUPLICATE KEY UPDATE count = VALUES(count)
      `;

      const params = batch.flatMap(row => [row.hash, row.height, row.identifier, row.count]);

      await DB.query(query, params);
    }
  }

  /**
   * Batch inserts CAT-21 mint activities into the database.
   *
   * WARNING: Avoid setting the `batchSize` too high. A very large batch size may cause:
   * - Queries exceeding `max_allowed_packet` size in MySQL.
   * - Performance bottlenecks due to a single large insert operation.
   *
   * @param mints - Array of Cat21Mint objects to insert.
   * @param batchSize - Number of rows to include in a single batch (default: 100).
   */
  async batchInsertCat21MintActivity(
    mints: Cat21Mint[],
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < mints.length; i += batchSize) {

      const batch = mints.slice(i, i + batchSize);
      const values = batch.map(() => `(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');

      const params = batch.flatMap((mint) => {
        const { blockId, blockHeight, transactionId, txIndex, number, feeRate, blockTime, fee, size, weight, value, sat, firstOwner, traits } = mint;
        const { catColors, backgroundColors, glassesColors } = traitsToCompactColors(traits);

        return [
          blockId,
          blockHeight,
          transactionId,
          txIndex,
          number ?? null,
          feeRate,
          blockTime,
          fee,
          size,
          weight,
          value,
          sat ?? null,
          firstOwner,
          traits.genesis,
          catColors,
          traits.gender,
          traits.designIndex,
          traits.designPose,
          traits.designExpression,
          traits.designPattern,
          traits.designFacing,
          traits.laserEyes,
          traits.background,
          backgroundColors,
          traits.crown,
          traits.glasses,
          glassesColors,
        ];
      });

      const query = `
        INSERT INTO ordpool_stats_cat21_mint (
          hash, height, txid, tx_index, number, fee_rate, block_time,
          fee, size, weight, value, sat, first_owner,
          genesis, cat_colors, gender, design_index, design_pose,
          design_expression, design_pattern, design_facing,
          laser_eyes, background, background_colors, crown, glasses, glasses_colors
        )
        VALUES ${values}
        ON DUPLICATE KEY UPDATE
          number = VALUES(number),
          fee_rate = VALUES(fee_rate),
          block_time = VALUES(block_time),
          fee = VALUES(fee),
          size = VALUES(size),
          weight = VALUES(weight),
          value = VALUES(value),
          sat = VALUES(sat),
          first_owner = VALUES(first_owner),
          genesis = VALUES(genesis),
          cat_colors = VALUES(cat_colors),
          gender = VALUES(gender),
          design_index = VALUES(design_index),
          design_pose = VALUES(design_pose),
          design_expression = VALUES(design_expression),
          design_pattern = VALUES(design_pattern),
          design_facing = VALUES(design_facing),
          laser_eyes = VALUES(laser_eyes),
          background = VALUES(background),
          background_colors = VALUES(background_colors),
          crown = VALUES(crown),
          glasses = VALUES(glasses),
          glasses_colors = VALUES(glasses_colors)
      `;

      await DB.query(query, params);
    }
  }

  /**
   * Save mints, etchings and deployments into rdpool_stats_* tables.
   * @param hash - The block hash.
   * @param height - The block height.
   * @param stats - The OrdpoolStats object containing the statistics to save.
   */
  async saveTokenActivity(hash: string, height: number, stats: OrdpoolStats): Promise<void> {

    // Store Rune Mint Activity in Batches
    await this.batchInsertMintActivity('ordpool_stats_rune_mint',
      stats.runes.runeMintActivity
        .map(([identifier, count]) => ({
          hash,
          height,
          identifier,
          count
        }))
    );

    // Store BRC-20 Mint Activity in Batches
    await this.batchInsertMintActivity('ordpool_stats_brc20_mint',
      stats.brc20.brc20MintActivity
        .map(([identifier, count]) => ({
          hash,
          height,
          identifier,
          count
        }))
    );

    // Store SRC-20 Mint Activity in Batches
    await this.batchInsertMintActivity('ordpool_stats_src20_mint',
      stats.src20.src20MintActivity
        .map(([identifier, count]) => ({
          hash,
          height,
          identifier,
          count
        }))
    );

    // 😻 Store CAT-21 Mint Activity in Batches
    // should be always defined, for data from the analyser
    if (stats.cat21.cat21MintActivity) {
      await this.batchInsertCat21MintActivity(stats.cat21.cat21MintActivity);
    }

    // Insert Rune Etch Attempts
     for (const {
      txId,                 //  1
      runeId,               //  2
      runeName,             //  3
      divisibility,         //  4
      premine,              //  5
      symbol,               //  6
      cap,                  //  7
      amount,               //  8
      offsetStart,          //  9
      offsetEnd,            // 10
      heightStart,          // 11
      heightEnd,            // 12
      turbo                 // 13
    } of stats.runes.runeEtchAttempts) {
      await DB.query(
        `INSERT INTO ordpool_stats_rune_etch (
            hash,
            height,
            txid,           --  1
            rune_id,        --  2
            rune_name,      --  3
            divisibility,   --  4
            premine,        --  5
            symbol,         --  6
            cap,            --  7
            amount,         --  8
            offset_start,   --  9
            offset_end,     -- 10
            height_start,   -- 11
            height_end,     -- 12
            turbo           -- 13
          ) VALUES (
            ?,
            ?,
            ?,              --  1
            ?,              --  2
            LEFT(?, 60),    --  3 (rune_name)
            ?,              --  4
            ?,              --  5
            LEFT(?, 10),    --  6 (symbol)
            ?,              --  7
            ?,              --  8
            ?,              --  9
            ?,              -- 10
            ?,              -- 11
            ?,              -- 12
            ?               -- 13
          )
          ON DUPLICATE KEY UPDATE
            txid = VALUES(txid),                 --  1
            rune_name = VALUES(rune_name),       --  3
            divisibility = VALUES(divisibility), --  4
            premine = VALUES(premine),           --  5
            symbol = VALUES(symbol),             --  6
            cap = VALUES(cap),                   --  7
            amount = VALUES(amount),             --  8
            offset_start = VALUES(offset_start), --  9
            offset_end = VALUES(offset_end),     -- 10
            height_start = VALUES(height_start), -- 11
            height_end = VALUES(height_end),     -- 12
            turbo = VALUES(turbo)                -- 13
          `,
        [
          hash,
          height,
          txId,
          runeId,
          runeName,
          divisibility,
          premine,
          symbol,
          cap,
          amount,
          offsetStart,
          offsetEnd,
          heightStart,
          heightEnd,
          turbo,
        ]
      );
    }

    // Insert BRC-20 Deploy Attempts
    for (const { txId, ticker, maxSupply, mintLimit, decimals } of stats.brc20.brc20DeployAttempts) {
      await DB.query(
        `INSERT INTO ordpool_stats_brc20_deploy (hash, height, txid, ticker, max_supply, mint_limit, decimals)
        VALUES (?, ?, ?, LEFT(?, 20), ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          max_supply = VALUES(max_supply),
          mint_limit = VALUES(mint_limit),
          decimals = VALUES(decimals)`,
        [hash, height, txId, ticker, maxSupply, mintLimit, decimals]
      );
    }

    // Insert SRC-20 Deploy Attempts
    for (const { txId, ticker, maxSupply, mintLimit, decimals } of stats.src20.src20DeployAttempts) {
      await DB.query(
        `INSERT INTO ordpool_stats_src20_deploy (hash, height, txid, ticker, max_supply, mint_limit, decimals)
        VALUES (?, ?, ?, LEFT(?, 20), ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          max_supply = VALUES(max_supply),
          mint_limit = VALUES(mint_limit),
          decimals = VALUES(decimals)`,
        [hash, height, txId, ticker, maxSupply, mintLimit, decimals]
      );

    }
  }

  /**
   * Retrieves the lowest block from the `blocks` table (starting from a given height)
   * that does not have corresponding data in the `ordpool_stats` table.
   *
   * @param startHeight - The height to start searching from.
   * @returns A promise that resolves to the block information of the first block
   * without stats, or `null` if all blocks have stats.
   */
  async getLowestBlockWithoutOrdpoolStats(startHeight: number): Promise<{
    id: string;
    height: number;
    timestamp: number;
  } | null> {

    const [row] = await DB.query(
      `SELECT id, height, timestamp
      FROM blocks
      WHERE height >= ?
      AND NOT EXISTS (
        SELECT 1 FROM ordpool_stats WHERE ordpool_stats.hash = blocks.id
      )
      ORDER BY height ASC
      LIMIT 1
      `,
      [startHeight]
    ) as any;

    return row ? { id: row.id, height: row.height, timestamp: row.timestamp } : null;
  }
}

export default new OrdpoolBlocksRepository();
