const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 3000;

app.get('/menu', async (req, res) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.pizzaroma.be/nl/menu', { waitUntil: 'domcontentloaded' });

    // Menüdeki bir öğe yüklenene kadar bekle
    await page.waitForSelector('.barlow.bold.fs--18', { timeout: 10000 });

    const items = await page.$$eval('[class~="cg-col-6"][class~="m-b-0.5x"]', elements => {
      return elements.map(el => {
        const name = el.querySelector('.barlow.bold.fs--18')?.innerText.trim() || '';
        const price = el.querySelector('.barlow.bold.color--red.fs--16')?.innerText.trim() || '';
        const ingredientsText = el.querySelector('.barlow.fs--14.color--dusty')?.innerText.trim() || '';
        const ingredients = ingredientsText ? ingredientsText.split(',').map(i => i.trim()) : [];
        return { name, price, ingredients };
      });
    });

    await browser.close();
    res.json(items);
  } catch (err) {
    console.error('Hata:', err);
    await browser.close();
    res.status(500).send('Bir hata oluştu');
  }
});

app.listen(PORT, () => {
  console.log(`Scraper çalışıyor http://localhost:${PORT}/menu`);
});
