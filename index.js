const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 3000;

app.get('/menu', async (req, res) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.pizzaroma.be/nl/menu', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(15000); // İçerik yüklenmesini bekle

    const items = await page.$$eval('[data-testid="product"]', elements => {
      return elements.map(el => {
        const name = el.querySelector('h3')?.innerText.trim() || '';
        const price = el.querySelector('.color--red')?.innerText.trim() || '';
        const ingredientsText = el.querySelector('.fs--14.color--dusty')?.innerText.trim() || '';
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
