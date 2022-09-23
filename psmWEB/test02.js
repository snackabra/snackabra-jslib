// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.

// runs puppeteer test (runs self-testing web page in headleess chrome)

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8000/'); // see 'README', you'll need a server
  // await page.screenshot({ path: 'screenshot.png' }); // you can screenshot for fun
  const testResults = await page.$eval('#results', (el) => el.innerHTML);
  if (testResults.includes('none failed')) {
    console.log('All tests PASSSED');
  } else {
    console.log(`****************************************************************\n` +
		`There were problems: ${testResults}\n` +
		`****************************************************************`);
  }
  await browser.close();
})();
