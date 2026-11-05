import { test, expect } from '@playwright/test';
// @ts-ignore Node.js typings are not configured in this project.
import * as fs from 'fs';
// @ts-ignore Node.js typings are not configured in this project.
import * as path from 'path';
import { PDFParse } from 'pdf-parse';

test('Compare PDF text line-by-line', async (): Promise<void> => {
  const pdfFilePath: string = path.resolve('e2e', 'downloads', 'myinvoice.pdf');
  
  const pdfBuffer = fs.readFileSync(pdfFilePath);
  
  const parser = new PDFParse({ data: pdfBuffer });
  
  const parsedPdf = await parser.getText();

  console.log(`Total Pages: ${parsedPdf.pages.length}`);

  // 1. Split extracted text into an array of lines and clean up whitespace
  const actualLines: string[] = parsedPdf.text
    .split('\n')
    .map((line: string) => line.trim())
    .filter(line => line.length > 0); // Removes empty trailing lines

   // console.log('Actual lines:', actualLines);
    actualLines.forEach((line, index) => {
      console.log(`Line ${index + 1}: ${line}`);
    });

    // 3. Optional: Quick structural check on length
  console.log(`Actual lines count: ${actualLines.length}`);

  await parser.destroy();

});
