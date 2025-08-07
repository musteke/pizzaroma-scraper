const express = require("express");
const { chromium } = require("playwright");
const app = express();

app.get("/menu", async (req, res) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://www.pizzaroma.be/nl/menu", { waitUntil: "networkidle" });

  const items = await page.$$eval(".cg-col-6.m-b-0.5x", els =>
    els.map(el => {
      const name = el.querySelector("h3.barlow.medium")?.innerText || "";
      const description = el.querySelector("div.barlow.regular")?.innerText || "";
      const price = el.querySelector("div.fs--14.lh--16")?.innerText || "";
      return { name, description, price };
    })
  );

  await browser.close();
  res.json(items);
});

app.listen(3000, () => console.log("Scraper çalışıyor http://localhost:3000/menu"));
