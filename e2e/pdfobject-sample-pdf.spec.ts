import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

test.describe('Reading a PDF from a URL', () => {
  test('Read and print PDFObject sample PDF text', async ({ page }) => {
    // 1. Capture the download and navigate to the PDF URL.
    const downloadPromise = page.waitForEvent('download');
    try {
      await page.goto('https://pdfobject.com/pdf/sample.pdf');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Download is starting')) {
        throw error;
      }
    }
    const download = await downloadPromise;

    // 2. Verify the download succeeded and read the PDF bytes.
    const downloadFailure = await download.failure();
    expect(downloadFailure, 'PDF download should complete successfully').toBeNull();
    const pdfPath = await download.path();
    expect(pdfPath, 'Downloaded PDF should be saved to a file').not.toBeNull();
    if (!pdfPath) {
      throw new Error('Playwright did not provide a path for the downloaded PDF');
    }
    const pdfBytes = await readFile(pdfPath);
    expect(pdfBytes.length, 'PDF response should contain data').toBeGreaterThan(0);

    // 3. Extract the PDF text and print each non-empty line with its 1-based line number.
    const parser = new PDFParse({ data: pdfBytes });
    try {
      const parsedPdf = await parser.getText();
      const actualLines = parsedPdf.text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      expect(actualLines.length, 'PDF should contain extractable text').toBeGreaterThan(0);
      actualLines.forEach((line, index) => {
        console.log(`Line ${index + 1}: ${line}`);
      });
      console.log(`Total lines: ${actualLines.length}`);
    } finally {
      await parser.destroy();
    }
  });

  test('Interact with embedded web PDF viewer UI', async ({ page }) => {
    await page.goto('https://example.com');
    // 1. Click the button to launch or unlock the draft view
    await page.getByRole('button', { name: 'Open Draft Preview' }).click();
    // 2. Locate the viewer container or iframe
    const pdfViewer = page.locator('#pdf-viewer-container');
    await pdfViewer.waitFor({ state: 'visible' });
    // 3. Hover over the element and scroll down to load lazy elements/simulate reading
    await pdfViewer.hover();
    await page.mouse.wheel(0, 600); // Scroll down 600 pixels vertically
    // 4. Wait for a specific draft watermark text if rendered in the web DOM layer
    const draftWatermark = page.getByText('DRAFT', { exact: false });
    await expect(draftWatermark).toBeVisible();
  });

  test('Test PDF interaction, scroll and text extraction on live Mozilla app', async ({ page }) => {
    // 1. Open the PDF.js viewer and confirm it reports all document pages.
    await page.goto('https://mozilla.github.io/pdf.js/web/viewer.html');
    const pageCountLabel = page.locator('#numPages');
    await expect(pageCountLabel).toContainText('14');
    const pdfPages = page.locator('.page');
    await expect(pdfPages).toHaveCount(14);

    // 2. Scroll each page into view and read its rendered text layer from the browser.
    const pageTexts: string[] = [];
    for (let pageIndex = 0; pageIndex < 14; pageIndex++) {
      const pdfPage = pdfPages.nth(pageIndex);
      await pdfPage.scrollIntoViewIfNeeded();
      const textLayer = pdfPage.locator('.textLayer');
      await expect(textLayer, `PDF page ${pageIndex + 1} text layer should render`).toBeVisible();
      await expect(textLayer, `PDF page ${pageIndex + 1} should contain text`).not.toBeEmpty();

      const pageText = await textLayer.innerText();
      pageTexts.push(pageText);
      console.log(`--- PDF page ${pageIndex + 1} ---`);
      pageText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .forEach((line, lineIndex) => {
          console.log(`Page ${pageIndex + 1}, line ${lineIndex + 1}: ${line}`);
        });
    }

    // 3. Validate text from the beginning and the final pages of the document.
    const normalizedText = pageTexts.join(' ').replace(/\s+/g, ' ').toLowerCase();
    const expectedDocumentSnippets = [
      'Trace-based Just-in-Time Type Specialization for Dynamic Languages',
      'Andreas Gal',
      'Abstract',
      'International Conference on Virtual Execution Environments'
    ];
    expectedDocumentSnippets.forEach(snippet => {
      const normalizedSnippet = snippet.replace(/\s+/g, ' ').toLowerCase();
      expect(
        normalizedText.includes(normalizedSnippet),
        `Document missing sequence snippet: "${snippet}"`
      ).toBeTruthy();
    });
  });
});
