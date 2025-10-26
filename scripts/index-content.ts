/**
 * Content Indexer Script
 *
 * This script indexes DAO content (posts, comments) with vector embeddings
 * for semantic search capabilities.
 *
 * Usage:
 *   npm run index-content -- --daoId=<daoId>
 *   npm run index-content -- --all
 *   npm run index-content -- --contentId=<contentId>
 */

import dbConnect from '../lib/dbConnect';
import Content from '../models/Content';
import Organization from '../models/Organization';
import { memoryService } from '../lib/services/memory';

async function indexContentById(contentId: string) {
  console.log(`Indexing content: ${contentId}`);

  try {
    const result = await memoryService.indexContent(contentId);
    console.log(`✓ Successfully indexed content ${contentId}`);
    console.log(`  - Model: ${result.embeddings?.model}`);
    console.log(`  - Vector dimension: ${result.embeddings?.vector?.length}`);
    return { success: true, contentId };
  } catch (error: any) {
    console.error(`✗ Failed to index content ${contentId}:`, error.message);
    return { success: false, contentId, error: error.message };
  }
}

async function indexDaoContent(daoId: string) {
  console.log(`\nIndexing all content for DAO: ${daoId}`);

  await dbConnect();

  // Get DAO info
  const dao = await Organization.findOne({ _id: daoId });
  if (!dao) {
    console.error(`✗ DAO not found: ${daoId}`);
    return;
  }

  console.log(`DAO: ${dao.name} (${dao.tokenSymbol})`);

  // Get all published content without embeddings
  const contents = await Content.find({
    daoId,
    status: 'published',
    'embeddings.vector': { $exists: false },
  });

  console.log(`Found ${contents.length} content items to index\n`);

  if (contents.length === 0) {
    console.log('✓ All content already indexed!');
    return;
  }

  const results = {
    total: contents.length,
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  // Index in batches
  const BATCH_SIZE = 5;
  for (let i = 0; i < contents.length; i += BATCH_SIZE) {
    const batch = contents.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(contents.length / BATCH_SIZE)}`);

    const batchPromises = batch.map((content) =>
      indexContentById(content._id.toString())
    );

    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(result);
      }
    }

    // Small delay to avoid rate limits
    if (i + BATCH_SIZE < contents.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\n─────────────────────────────────');
  console.log('Indexing Complete');
  console.log(`─────────────────────────────────`);
  console.log(`Total: ${results.total}`);
  console.log(`✓ Success: ${results.success}`);
  console.log(`✗ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach((err) => {
      console.log(`  - ${err.contentId}: ${err.error}`);
    });
  }
}

async function indexAllDaos() {
  console.log('Indexing content for all DAOs\n');

  await dbConnect();

  const daos = await Organization.find({});
  console.log(`Found ${daos.length} DAOs\n`);

  for (const dao of daos) {
    await indexDaoContent(dao._id.toString());
    console.log('\n');
  }

  console.log('✓ All DAOs indexed!');
}

async function showIndexStatus(daoId?: string) {
  await dbConnect();

  if (daoId) {
    // Show status for specific DAO
    const dao = await Organization.findOne({ _id: daoId });
    if (!dao) {
      console.error(`✗ DAO not found: ${daoId}`);
      return;
    }

    const totalContent = await Content.countDocuments({
      daoId,
      status: 'published',
    });

    const indexedContent = await Content.countDocuments({
      daoId,
      status: 'published',
      'embeddings.vector': { $exists: true },
    });

    console.log(`\nDAO: ${dao.name} (${dao.tokenSymbol})`);
    console.log(`─────────────────────────────────`);
    console.log(`Total content: ${totalContent}`);
    console.log(`Indexed: ${indexedContent}`);
    console.log(`Pending: ${totalContent - indexedContent}`);
    console.log(
      `Progress: ${totalContent > 0 ? ((indexedContent / totalContent) * 100).toFixed(1) : 0}%`
    );
  } else {
    // Show status for all DAOs
    const daos = await Organization.find({});

    console.log('\nIndexing Status - All DAOs');
    console.log('─────────────────────────────────\n');

    for (const dao of daos) {
      const totalContent = await Content.countDocuments({
        daoId: dao._id,
        status: 'published',
      });

      const indexedContent = await Content.countDocuments({
        daoId: dao._id,
        status: 'published',
        'embeddings.vector': { $exists: true },
      });

      const percent =
        totalContent > 0 ? ((indexedContent / totalContent) * 100).toFixed(1) : 0;

      console.log(`${dao.name} (${dao.tokenSymbol})`);
      console.log(`  ${indexedContent}/${totalContent} (${percent}%)`);
      console.log('');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const params: any = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      params[key] = value || true;
    }
  }

  try {
    if (params.status) {
      await showIndexStatus(params.daoId);
    } else if (params.contentId) {
      await indexContentById(params.contentId);
    } else if (params.daoId) {
      await indexDaoContent(params.daoId);
    } else if (params.all) {
      await indexAllDaos();
    } else {
      console.log('Content Indexer');
      console.log('─────────────────────────────────\n');
      console.log('Usage:');
      console.log('  npm run index-content -- --daoId=<daoId>     Index all content for a DAO');
      console.log('  npm run index-content -- --contentId=<id>    Index a specific content item');
      console.log('  npm run index-content -- --all               Index all DAOs');
      console.log('  npm run index-content -- --status            Show indexing status');
      console.log('  npm run index-content -- --status --daoId=<daoId>  Show status for specific DAO');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
