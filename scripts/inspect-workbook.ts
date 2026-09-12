import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

async function inspectWorkbook(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer);
  console.log('Sheet Names:', workbook.SheetNames);

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log(`\nSheet: ${sheetName}`);
    console.log(`Rows: ${range.e.r + 1}, Cols: ${range.e.c + 1}`);

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    console.log('First 10 rows:');
    jsonData.slice(0, 10).forEach((row, index) => {
      console.log(`${index}: ${JSON.stringify(row)}`);
    });
  });
}

const targetFile = process.argv[2];
if (targetFile) {
  inspectWorkbook(path.resolve(targetFile));
} else {
  console.log('Usage: npx tsx scripts/inspect-workbook.ts <path-to-xlsx>');
}
