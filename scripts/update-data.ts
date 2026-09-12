import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as XLSX from 'xlsx';
import { transformSheet } from './transform-data';
import { validateData } from './validate-data';
import { generateDiff } from './generate-diff';
import { AppMetadata } from '../src/types/facility';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../public/data');
const TEMP_DIR = path.resolve(__dirname, '../temp');
const SOURCE_URL = 'https://opdt.city.toyama.lg.jp/dataset/seikatsu-eisei01';

async function downloadFile(url: string, dest: string) {
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    timeout: 30000,
  });

  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(undefined));
    writer.on('error', reject);
  });
}

async function getXlsxUrl(): Promise<string> {
  // 2026/09/12 時点の最新URL
  return 'https://opdt.city.toyama.lg.jp/dataset/fb1198c6-3ac2-42fc-ae99-81ea5ba09a2d/resource/fa38003f-accd-4690-b71b-96b1d78e1c45/download/syokuhin.xlsx';
}

async function main() {
  try {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    console.log('Fetching XLSX URL...');
    const xlsxUrl = await getXlsxUrl();
    const tempXlsx = path.join(TEMP_DIR, 'source.xlsx');

    console.log(`Downloading ${xlsxUrl}...`);
    await downloadFile(xlsxUrl, tempXlsx);

    const fileBuffer = fs.readFileSync(tempXlsx);
    if (fileBuffer.length === 0) throw new Error('Downloaded file is empty');

    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const dataVersion = hash.slice(0, 12);

    console.log('Parsing XLSX...');
    const workbook = XLSX.read(fileBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const facilities = transformSheet(firstSheet);

    console.log(`Found ${facilities.length} facilities.`);

    let previousFacilities = [];
    let previousMetadata = null;
    const currentPath = path.join(DATA_DIR, 'current.json');
    const metadataPath = path.join(DATA_DIR, 'metadata.json');

    if (fs.existsSync(currentPath)) {
      previousFacilities = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
    }
    if (fs.existsSync(metadataPath)) {
      previousMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }

    console.log('Validating data...');
    const validation = validateData(
      facilities,
      previousFacilities.length > 0 ? previousFacilities : null,
    );

    fs.writeFileSync(
      path.join(TEMP_DIR, 'validation-report.json'),
      JSON.stringify(validation, null, 2),
    );

    if (!validation.success) {
      console.error('Validation failed:', validation.errors);
      process.exit(1);
    }

    console.log('Generating diff...');
    const diff = generateDiff(
      facilities,
      previousFacilities,
      dataVersion,
      previousMetadata?.dataVersion || 'none',
    );

    // Prepare metadata
    const now = new Date().toISOString();
    const metadata: AppMetadata = {
      datasetName: '食品営業許可施設',
      provider: '富山市',
      datasetUrl: SOURCE_URL,
      sourceFileUrl: xlsxUrl,
      license: 'CC-BY-4.0', // Standard for many open data portals, check actual
      downloadedAt: now,
      generatedAt: now,
      dataVersion,
      recordCount: facilities.length,
      validPermitDateCount: facilities.filter((f) => f.permitDate).length,
      invalidPermitDateCount: validation.metrics.invalidDateCount,
      sourceFileHash: hash,
      schemaVersion: '1.0.0',
    };

    // Save files
    if (previousFacilities.length > 0) {
      fs.writeFileSync(
        path.join(DATA_DIR, 'previous.json'),
        JSON.stringify(previousFacilities, null, 2),
      );
    }
    fs.writeFileSync(currentPath, JSON.stringify(facilities, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'diff.json'), JSON.stringify(diff, null, 2));
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('Update complete!');
  } catch (error) {
    console.error('Error updating data:', error);
    process.exit(1);
  }
}

main();
