const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios");
const {
    XMLParser,
    XMLBuilder
} = require("fast-xml-parser");
const {
    parse,
    stringify
} = require("flatted");

const writer = [];

async function format_data(data) {
    const text_data = await data.getProperty("textContent");
    const json_data = await text_data.jsonValue();
    const clear_data = await json_data.replace(/[\n\r]+|[\s]{2,}/g, " ").trim();
    return clear_data;
}

async function format_data_long(array) {
    const data_array = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== null) {
            const text_data = await array[i].getProperty("textContent");
            const json_data = await text_data.jsonValue();
            const clear_data = await json_data.replace(/[\n\r]+|[\s]{2,}/g, " ").trim();
            data_array.push(clear_data);
        }
    }
    return data_array;
}

async function scrape_kansis_preview() {

    const details = [];

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");

    await page.goto("https://www.kansallisteatteri.fi/ohjelmisto/esitykset-a-o", {
        waitUntil: "load",
        timeout: 0
    });

    const show_buttons = "a.teaser-link";
    await (await page).waitForSelector(show_buttons);
    const shows = await page.$$(show_buttons);
    console.log(shows.length);
    const amount = shows.length;


    for (let i = 0; i < amount; i++) {
        const show_buttons = "a.teaser-link";
        await (await page).waitForSelector(show_buttons);
        const shows = await page.$$(show_buttons);
        shows[i].click();
        await page.waitForSelector("#introduction > div.field.field--name-field-introduction.field--type-entity-reference-revisions.field__items > div:nth-child(1) > div > p");
        const raw_detail = await page.$("#introduction > div.field.field--name-field-introduction.field--type-entity-reference-revisions.field__items > div:nth-child(1) > div > p");
        const detail_json = await format_data(raw_detail);
        details.push(detail_json);
        await page.goBack();
    }


    await browser.close();
    return details;

}

async function scrape_kansis_director() {

    const director = [];

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");

    await page.goto("https://www.kansallisteatteri.fi/ohjelmisto/esitykset-a-o", {
        waitUntil: "load",
        timeout: 0
    });

    const show_buttons = "a.teaser-link";
    await (await page).waitForSelector(show_buttons);
    const shows = await page.$$(show_buttons);
    console.log(shows.length);
    const amount = shows.length;

    for (let i = 0; i < amount; i++) {
        const show_buttons = "a.teaser-link";
        await (await page).waitForSelector(show_buttons);
        const shows = await page.$$(show_buttons);
        shows[i].click();

        let selector;
        try {
            selector = await page.waitForSelector("#team > div.team-members > div.production-team-list > div:nth-child(1) > div.name-column", {
                timeout: 10000
            });
        } catch (err) {
            console.log("Ei löydy");
        }

        const raw_detail = selector ?
            await page.$("#team > div.team-members > div.production-team-list > div:nth-child(1) > div.name-column") :
            await page.$("#block-content-top > article > div > div.content-top--text-wrapper > div > h1 > span");
        const detail_json = await format_data(raw_detail);
        director.push(detail_json);
        await page.goBack();
    }

    await browser.close();
    return director;

}

async function scrape_kansis_actors() {

    const actors = [];

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");

    await page.goto("https://www.kansallisteatteri.fi/ohjelmisto/esitykset-a-o", {
        waitUntil: "load",
        timeout: 0
    });

    const show_buttons = "#repertoire-wrapper > div > article > div > div > div.teaser-content--column.text > a";
    await (await page).waitForSelector(show_buttons);
    const shows = await page.$$(show_buttons);
    console.log(shows.length);
    const amount = shows.length;

    for (let i = 0; i < amount; i++) {
        const show_buttons = "#repertoire-wrapper > div > article > div > div > div.teaser-content--column.text > a";
        console.log("hei!");
        await (await page).waitForSelector(show_buttons);
        const shows = await page.$$(show_buttons);
        await shows[i].click();
        console.log("hei2!");

        try {
            await page.waitForSelector(".person-name", {
                timeout: 5000
            });
            console.log("hei3!");
            const selector = await page.$$(".person-name");
            const formated = await format_data_long(selector);
            console.log(formated);
            actors.push(formated);
        } catch (err) {
            console.log("Dataa ei löydy");
            actors.push("Tietoja ei onnistuttu hakemaan");

        }
        await page.goBack();
    }

    await browser.close();
    return actors;

}

module.exports = {
    scrape_kansis_preview,
    scrape_kansis_director,
    scrape_kansis_actors
};