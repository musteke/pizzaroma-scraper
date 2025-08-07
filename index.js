const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 3000;

app.get('/menu', async (req, res) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.pizzaroma.be/nl/menu');
    await page.waitForTimeout(3000); // Sayfa yüklenmesini bekle

    const items = await page.$$eval('[class~="cg-col-6"][class~="m-b-0.5x"]', elements => {
      return elements.map(el => {
        const name = el.querySelector('[class~="barlow"][class~="bold"][class~="fs--18"]')?.innerText.trim() || '';
        const price = el.querySelector('[class~="barlow"][class~="bold"][class~="color--red"][class~="fs--16"]')?.innerText.trim() || '';
        const ingredients = el.querySelector('[class~="barlow"][class~="fs--14"][class~="color--dusty"]')?.innerText.trim().split(',').map(i => i.trim()) || [];
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

