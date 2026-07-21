import xlsx from 'xlsx';

const workbook = xlsx.readFile('./src/assets/Korean_Items.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Total rows:", data.length);
if (data.length > 0) {
  console.log("Keys:", Object.keys(data[0]));
  console.log("First 3 rows:", data.slice(0, 3));
}
