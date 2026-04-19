#!/usr/bin/env node
/**
 * BOSS / Study OS — Intake Agent
 * ────────────────────────────────────────────────────────────────────────────
 * Usage:
 *   node scripts/analyze.js <imagePath> <subjectShort> <type>
 *
 * Arguments:
 *   imagePath     — absolute or relative path to the image file
 *   subjectShort  — TOC | ADA | STATS | DS | DBSEC  (or any short code)
 *   type          — syllabus | pyq
 *
 * Examples:
 *   node scripts/analyze.js uploads/TOC_syllabus.png TOC syllabus
 *   node scripts/analyze.js uploads/ADA_pyq.jpg ADA pyq
 *
 * Output:
 *   subjects/{subjectShort}/topics.json      ← always written / merged
 *   subjects/{subjectShort}/syllabus.md      ← if type = syllabus
 *   subjects/{subjectShort}/pyq.md           ← if type = pyq
 *
 * Requires:
 *   ANTHROPIC_API_KEY in environment  (Antigravity provides this automatically)
 *   npm install @anthropic-ai/sdk      (one-time setup, see note below)
 * ────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── SDK import with friendly error if not installed ──────────────────────────
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch {
  console.error('\n❌  @anthropic-ai/sdk not found.');
  console.error('    Run this once from the BOSS directory:\n');
  console.error('    npm install @anthropic-ai/sdk\n');
  process.exit(1);
}

// ── Validate environment ─────────────────────────────────────────────────────
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('\n❌  ANTHROPIC_API_KEY is not set in your environment.');
  console.error('    Antigravity injects this automatically when running');
  console.error('    commands from the chat. If running manually, set:\n');
  console.error('    $env:ANTHROPIC_API_KEY = "sk-ant-..."  (PowerShell)');
  console.error('    export ANTHROPIC_API_KEY="sk-ant-..."  (bash/zsh)\n');
  process.exit(1);
}

// ── Parse CLI arguments ──────────────────────────────────────────────────────
const [,, rawImagePath, subjectShort, type] = process.argv;

if (!rawImagePath || !subjectShort || !type) {
  console.error('\n❌  Missing arguments.\n');
  console.error('    Usage: node scripts/analyze.js <imagePath> <subjectShort> <type>');
  console.error('    Example: node scripts/analyze.js uploads/TOC_syllabus.png TOC syllabus\n');
  process.exit(1);
}

if (!['syllabus', 'pyq'].includes(type)) {
  console.error(`\n❌  type must be "syllabus" or "pyq", got: "${type}"\n`);
  process.exit(1);
}

// Resolve paths relative to the BOSS directory (where script is called from)
const BOSS_DIR    = path.resolve(__dirname, '..');
const imagePath   = path.resolve(process.cwd(), rawImagePath);
const subjectDir  = path.join(BOSS_DIR, 'subjects', subjectShort);
const topicsFile  = path.join(subjectDir, 'topics.json');
const mdFile      = path.join(subjectDir, `${type}.md`);

// ── Validate image path ──────────────────────────────────────────────────────
if (!fs.existsSync(imagePath)) {
  console.error(`\n❌  Image not found: ${imagePath}\n`);
  process.exit(1);
}

// ── Ensure subject directory exists ──────────────────────────────────────────
if (!fs.existsSync(subjectDir)) {
  fs.mkdirSync(subjectDir, { recursive: true });
  console.log(`📁  Created subject directory: subjects/${subjectShort}/`);
}

// ── Build prompts ─────────────────────────────────────────────────────────────
const INTAKE_PROMPT = type === 'syllabus'
  ? `You are the Intake Agent for Study OS.
Analyze this syllabus image carefully.
Extract every unit, chapter, topic, and subtopic you can see.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Format:
[
  {
    "unit": "Unit name or number",
    "topic": "Topic name",
    "subtopic": "Subtopic name, or empty string if none",
    "type": "syllabus",
    "pyq_years": []
  }
]`
  : `You are the Intake Agent for Study OS.
Analyze this Past Year Question (PYQ) paper image carefully.
Identify every topic and subtopic that questions are asked from.
Note which years the questions appear in.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Format:
[
  {
    "unit": "Unit name or number if visible",
    "topic": "Topic that question tests",
    "subtopic": "Specific subtopic, or empty string",
    "type": "pyq",
    "pyq_years": [2023, 2024]
  }
]`;

// ── Read and encode image ─────────────────────────────────────────────────────
console.log(`\n🔍  Reading image: ${path.relative(BOSS_DIR, imagePath)}`);
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

// Detect media type from extension
const ext = path.extname(imagePath).toLowerCase();
const mediaTypeMap = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
};
const mediaType = mediaTypeMap[ext] || 'image/jpeg';

// ── Call Claude ───────────────────────────────────────────────────────────────
async function runAnalysis() {
  const client = new Anthropic({ apiKey: API_KEY });

  console.log(`🤖  Calling Claude (claude-3-5-sonnet-latest) with ${type} prompt...`);
  console.log(`    Subject: ${subjectShort} | Type: ${type}`);
  console.log(`    Image:   ${(imageBuffer.length / 1024).toFixed(1)} KB\n`);

  let response;
  try {
    response = await client.messages.create({
      model:      'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type:   'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: INTAKE_PROMPT,
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error('❌  Claude API call failed:');
    console.error(`    ${err.message}\n`);
    process.exit(1);
  }

  // ── Parse response JSON ────────────────────────────────────────────────────
  const rawText = response.content[0].text.trim();

  let extractedTopics;
  try {
    // Strip any accidental markdown fences Claude might add
    const cleaned = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    extractedTopics = JSON.parse(cleaned);

    if (!Array.isArray(extractedTopics)) throw new Error('Response is not an array');
  } catch (err) {
    console.error('❌  Failed to parse Claude response as JSON:');
    console.error('──────────────────────────────────────────────');
    console.error(rawText);
    console.error('──────────────────────────────────────────────');
    console.error(`    Parse error: ${err.message}\n`);

    // Save raw response for debugging
    const debugFile = path.join(subjectDir, `${type}_raw_response.txt`);
    fs.writeFileSync(debugFile, rawText, 'utf8');
    console.error(`    Raw response saved to: subjects/${subjectShort}/${type}_raw_response.txt\n`);
    process.exit(1);
  }

  // Normalize: add default prio/done fields the HTML expects
  extractedTopics = extractedTopics.map(t => ({
    unit:      t.unit      || '',
    topic:     t.topic     || 'Unknown Topic',
    subtopic:  t.subtopic  || '',
    type:      t.type      || type,
    pyq_years: Array.isArray(t.pyq_years) ? t.pyq_years : [],
    prio:      'MED',   // Priority Agent will update this
    done:      false,
  }));

  console.log(`✅  Extracted ${extractedTopics.length} topics from ${type} image\n`);

  // ── Merge into existing topics.json ───────────────────────────────────────
  let existing = [];
  if (fs.existsSync(topicsFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
    } catch {
      console.warn('⚠️   Existing topics.json was corrupt — starting fresh.');
    }
  }

  extractedTopics.forEach(nt => {
    const idx = existing.findIndex(e => e.topic === nt.topic);
    if (idx === -1) {
      existing.push(nt);
    } else {
      // Merge pyq_years if already present
      if (nt.pyq_years && nt.pyq_years.length) {
        existing[idx].pyq_years = [...new Set([...(existing[idx].pyq_years || []), ...nt.pyq_years])];
      }
      // Preserve done status
      existing[idx] = { ...nt, done: existing[idx].done, prio: existing[idx].prio };
    }
  });

  // ── Write topics.json ──────────────────────────────────────────────────────
  fs.writeFileSync(topicsFile, JSON.stringify(existing, null, 2), 'utf8');
  console.log(`💾  Saved: subjects/${subjectShort}/topics.json (${existing.length} total topics)`);

  // ── Write markdown file ────────────────────────────────────────────────────
  const now  = new Date().toISOString().split('T')[0];
  const mdLines = [
    `# ${subjectShort} — ${type === 'syllabus' ? 'Syllabus' : 'Past Year Questions'}`,
    `_Extracted by Intake Agent on ${now}_`,
    '',
  ];

  // Group by unit
  const byUnit = {};
  extractedTopics.forEach(t => {
    const u = t.unit || 'Uncategorised';
    if (!byUnit[u]) byUnit[u] = [];
    byUnit[u].push(t);
  });

  Object.entries(byUnit).forEach(([unit, topics]) => {
    mdLines.push(`## ${unit}`);
    topics.forEach(t => {
      mdLines.push(`- **${t.topic}**${t.subtopic ? ` — ${t.subtopic}` : ''}${t.pyq_years.length ? ` _(${t.pyq_years.join(', ')})_` : ''}`);
    });
    mdLines.push('');
  });

  fs.writeFileSync(mdFile, mdLines.join('\n'), 'utf8');
  console.log(`📝  Saved: subjects/${subjectShort}/${type}.md`);

  // ── Final summary ──────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────');
  console.log(`🎯  DONE — ${subjectShort} ${type} analysis complete`);
  console.log('──────────────────────────────────────────────────');
  console.log('\nNext steps:');
  console.log(`  1. Open index.html → ${subjectShort} subject view`);
  console.log(`  2. Click "Load from topics.json" and select:`);
  console.log(`     subjects/${subjectShort}/topics.json`);
  console.log(`  3. Click ⚡ Analyze Priority to rank topics\n`);

  // Machine-readable exit marker (for potential automation)
  console.log(`__BOSS_TOPICS__:${JSON.stringify({ subject: subjectShort, type, count: extractedTopics.length, file: topicsFile })}`);
}

runAnalysis();
