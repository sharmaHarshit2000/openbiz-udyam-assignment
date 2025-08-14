import puppeteer from "puppeteer";
import fs from "fs-extra";
import * as cheerio from "cheerio";

async function scrapeStep1Live() {
  console.log("=== Step 1: Aadhaar (Live Puppeteer) ===");
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true, 
      args: ["--no-sandbox", "--disable-setuid-sandbox"] 
    });
    const page = await browser.newPage();

    await page.goto("https://udyamregistration.gov.in/UdyamRegistration.aspx", { 
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    // Wait for the main form to load
    await page.waitForSelector("#aspnetForm", { timeout: 30000 });

    const step1Data = await page.evaluate(() => {
      const container = document.querySelector("#aspnetForm");

      const getLabel = (el) => {
        if (el.id) {
          const lbl = document.querySelector(`label[for="${el.id}"]`);
          if (lbl) return lbl.innerText.trim();
        }
        const parentLabel = el.closest("label");
        return parentLabel ? parentLabel.innerText.trim() : null;
      };

      const inputs = Array.from(container.querySelectorAll("input, select, textarea")).map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.type || null,
        name: el.name || null,
        id: el.id || null,
        placeholder: el.placeholder || null,
        label: getLabel(el),
        attributes: Array.from(el.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {})
      }));

      return { 
        title: document.title, 
        url: location.href, 
        inputs 
      };
    });

    await fs.ensureDir("./output");
    await fs.writeJson("./output/step1_aadhaar.json", step1Data, { spaces: 2 });
    console.log("Step 1 saved: output/step1_aadhaar.json");

  } catch (error) {
    console.error("Error in Step 1:", error);
  } finally {
    if (browser) await browser.close();
  }
}

async function scrapeStep2FromFile(filePath) {
  console.log("=== Step 2: PAN (From Local HTML) ===");
  
  try {
    const html = await fs.readFile(filePath, "utf8");
    const $ = cheerio.load(html);

    // The PAN section is in a different container
    const container = $("#aspnetForm").length ? $("#aspnetForm") : $("body");

    const inputs = [];
    
    container.find("input, select, textarea").each((_, el) => {
      const $el = $(el);
      const id = $el.attr("id") || null;
      const name = $el.attr("name") || null;
      
      // Find label - different approach than step 1
      let label = null;
      if (id) {
        label = $(`label[for="${id}"]`).text().trim();
      }
      if (!label) {
        // Try to find preceding label
        label = $el.prev("label").text().trim() || 
                $el.parent().find("label").first().text().trim();
      }

      inputs.push({
        tag: el.tagName.toLowerCase(),
        type: $el.attr("type") || null,
        name,
        id,
        placeholder: $el.attr("placeholder") || null,
        label,
        attributes: $el[0].attribs
      });
    });

    const step2Data = {
      title: $("title").text(),
      source: filePath,
      inputs
    };

    await fs.ensureDir("./output");
    await fs.writeJson("./output/step2_pan.json", step2Data, { spaces: 2 });
    console.log("Step 2 saved: output/step2_pan.json");

  } catch (error) {
    console.error("Error in Step 2:", error);
  }
}

async function main() {
  try {
    await scrapeStep1Live();
    await scrapeStep2FromFile("./step2_pan.html"); 
  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
}

main();