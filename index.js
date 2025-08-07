const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = 3000;

app.get("/menu", async (req, res) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.pizzaroma.be/nl/menu", {
      waitUntil: "domcontentloaded",
    });

    // Sayfa tamamen yüklensin diye 10 saniye bekleyelim
    await page.waitForTimeout(10000);

    const items = await page.$$eval('.cg-col-6.m-b-0\\.5x', elements => {
      return elements.map(el => {
        const name = el.querySelector('h3')?.innerText.trim() || '';
        const price = el.querySelector('div.bg--green')?.innerText.trim().split('\n')[0] || '';
        const ingredientsText = el.querySelector('.barlow.regular.fs--14')?.innerText.trim() || '';
        const ingredients = ingredientsText
          ? ingredientsText.split(',').map(i => i.trim())
          : [];
        return { name, price, ingredients };
      });
    });

    res.json(items);
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "Bir hata oluştu", details: error.message });
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Scraper çalışıyor http://localhost:${PORT}/menu`);
});

