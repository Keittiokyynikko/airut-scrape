const cheerio = require("cheerio");
const axios = require("axios");
const {
    XMLParser,
    XMLBuilder
} = require("fast-xml-parser");
const {
    parse,
    stringify
} = require("flatted");

async function scrape_kansis() {

    const names = [];

    const name_promise = new Promise((resolve) => {
        axios
            .get(
                "https://www.kansallisteatteri.fi/ohjelmisto/esitykset-a-o"
            )
            .then((res) => {
                const parser = new XMLParser();
                const builder = new XMLBuilder();
                const data = res.data;

                const xml = parser.parse(data);
                const xml_build = builder.build(xml);
                const $ = cheerio.load(xml_build);

                let name_raw = $("h2").children("span");
                for (let i = 0; i < name_raw.length; i++) {
                    let name_element = $(name_raw).get([i]);
                    let name_text = $(name_element).text();
                    names.push(name_text);
                }


                resolve(names);
            });


    });
    console.log(name_promise);

    return name_promise;
}

module.exports = {
    scrape_kansis
};