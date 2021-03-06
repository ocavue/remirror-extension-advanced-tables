async function checkEditorScreenshot() {
  const editor = await page.waitForSelector('#example-editor', { timeout: 1000 });
  expect(editor).toBeTruthy();
  const screenshot = await editor?.screenshot();
  expect(screenshot).toMatchImageSnapshot();
}

describe('Smoke test', function () {
  test('3*3', async () => {
    await page.goto('http://localhost:1234', { timeout: 30 * 1000 });
    await page.click('[data-testid=btn-3-3]');
    await checkEditorScreenshot();
  });
  test('5*5', async () => {
    await page.goto('http://localhost:1234', { timeout: 30 * 1000 });
    await page.click('[data-testid=btn-5-5]');
    await checkEditorScreenshot();
  });
  test('8*100', async () => {
    await page.goto('http://localhost:1234', { timeout: 30 * 1000 });
    await page.click('[data-testid=btn-8-100]');
    await checkEditorScreenshot();
  });
});
