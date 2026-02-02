#!/usr/bin/env node

/**
 * Parameterized Project Fetcher for DevRev
 * Accepts project IDs via command line or config file
 * Usage:
 *   node fetch-projects-parameterized.js --ids "ENH-1,ENH-2"
 *   node fetch-projects-parameterized.js --config ./my-config.json
 *   node fetch-projects-parameterized.js --vista-filters '{"stage":"in_progress"}'
 */

const DEVREV_API_TOKEN = process.env.DEVREV_PAT || process.env.DEVREV_API_TOKEN;
const DEVREV_API_BASE_URL = "https://api.devrev.ai";

const args = process.argv.slice(2);

async function makeRequest(endpoint, params = {}) {
  const url = new URL(endpoint, DEVREV_API_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": DEVREV_API_TOKEN,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DevRev API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function fetchEnhancementsByIds(ids) {
  const enhancements = [];
  let cursor = null;

  do {
    const params = {
      type: ["enhancement"],
      limit: 100
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await makeRequest("/parts.list", params);
    const parts = response.parts || [];

    const matchingParts = parts.filter(part =>
      ids.includes(part.display_id)
    );

    enhancements.push(...matchingParts);

    if (enhancements.length >= ids.length) {
      break;
    }

    cursor = response.next_cursor;
  } while (cursor);

  return enhancements;
}

async function fetchEnhancementsByFilters(filters = {}) {
  const enhancements = [];
  let cursor = null;

  do {
    const params = {
      type: ["enhancement"],
      limit: 100,
      ...filters
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await makeRequest("/parts.list", params);
    enhancements.push(...(response.parts || []));

    cursor = response.next_cursor;
  } while (cursor);

  return enhancements;
}

function extractUpdateText(enh) {
  const description = enh.body || '';
  const customFields = enh.custom_fields || {};

  const weeklyUpdate = customFields.tnt__weekly_update ||
                       customFields.weekly_update ||
                       customFields.latest_update || '';

  return weeklyUpdate || 'No update available';
}

function formatEnhancementForDashboard(enh) {
  const customFields = enh.custom_fields || {};
  const targetCloseDate = enh.target_close_date ? new Date(enh.target_close_date) : null;
  const modifiedDate = enh.modified_date ? new Date(enh.modified_date) : null;

  return {
    id: enh.display_id,
    title: enh.name || enh.title,
    stage: enh.stage_v2?.stage?.name || customFields.tnt__stage || 'N/A',
    current_rag: customFields.tnt__current_rag || customFields.current_rag || 'N/A',
    quarter_rag: customFields.tnt__quarter_rag || customFields.quarter_rag || 'N/A',
    target_close_date: targetCloseDate ? targetCloseDate.toISOString().split('T')[0] : 'N/A',
    weekly_update: extractUpdateText(enh),
    last_modified: modifiedDate ? modifiedDate.toISOString().split('T')[0] : 'N/A',
    url: `https://app.devrev.ai/razorpay/parts/${enh.display_id}`,
    raw_data: enh
  };
}

function parseArguments() {
  const config = {
    projectIds: [],
    vistaFilters: null,
    configFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--ids' && args[i + 1]) {
      config.projectIds = args[i + 1].split(',').map(id => id.trim());
      i++;
    } else if (arg === '--config' && args[i + 1]) {
      config.configFile = args[i + 1];
      i++;
    } else if (arg === '--vista-filters' && args[i + 1]) {
      try {
        config.vistaFilters = JSON.parse(args[i + 1]);
      } catch (e) {
        console.error("❌ Invalid JSON for vista-filters");
      }
      i++;
    }
  }

  return config;
}

async function loadConfigFile(filePath) {
  const fs = await import('fs');
  const configData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  return {
    projectIds: configData.data_source?.project_ids || [],
    vistaFilters: configData.data_source?.vista_filters || null,
    dashboardName: configData.dashboard_name || 'Project Dashboard'
  };
}

async function main() {
  try {
    if (!DEVREV_API_TOKEN) {
      console.error("❌ Error: DEVREV_PAT or DEVREV_API_TOKEN environment variable is required");
      process.exit(1);
    }

    console.log("🔍 Fetching projects from DevRev...\n");

    const config = parseArguments();
    let finalConfig = config;

    // Load from config file if specified
    if (config.configFile) {
      const fileConfig = await loadConfigFile(config.configFile);
      finalConfig = { ...fileConfig, ...config };
    }

    let enhancements = [];

    // Fetch by IDs or filters
    if (finalConfig.projectIds.length > 0) {
      console.log(`📋 Fetching ${finalConfig.projectIds.length} specific projects...`);
      enhancements = await fetchEnhancementsByIds(finalConfig.projectIds);
    } else if (finalConfig.vistaFilters) {
      console.log(`🔎 Fetching projects with filters...`);
      enhancements = await fetchEnhancementsByFilters(finalConfig.vistaFilters);
    } else {
      console.error("❌ Error: Please provide --ids, --vista-filters, or --config");
      console.log("\nUsage:");
      console.log('  node fetch-projects-parameterized.js --ids "ENH-1,ENH-2"');
      console.log('  node fetch-projects-parameterized.js --config ./my-config.json');
      console.log('  node fetch-projects-parameterized.js --vista-filters \'{"stage":"in_progress"}\'');
      process.exit(1);
    }

    console.log(`✅ Found ${enhancements.length} projects\n`);

    if (enhancements.length === 0) {
      console.log("⚠️  No enhancements found matching criteria.");
      return;
    }

    // Format and display
    const formattedData = enhancements.map(formatEnhancementForDashboard);

    console.log("=".repeat(120));
    console.log("PROJECT STATUS");
    console.log("=".repeat(120));
    console.log();

    formattedData.forEach((project, idx) => {
      console.log(`${idx + 1}. ${project.id} - ${project.title}`);
      console.log(`   Stage: ${project.stage}`);
      console.log(`   Current RAG: ${project.current_rag} | Quarter RAG: ${project.quarter_rag}`);
      console.log(`   Target Close: ${project.target_close_date}`);
      console.log(`   Last Modified: ${project.last_modified}`);
      console.log();
    });

    // Output as JSON for processing
    console.log("\n=== JSON OUTPUT ===");
    console.log(JSON.stringify(formattedData, null, 2));

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
