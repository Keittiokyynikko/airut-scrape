const {
    scrape_kansis
} = require("./kansallisteatteri/kansallisteatteri_show_scrape");

const {
    scrape_kansis_director,
    scrape_kansis_preview,
    scrape_kansis_actors
} = require("./kansallisteatteri/kansallisteatteri_details_scrape");

async function organize_show_objects() {

    const show_objects = [];

    const show_name = await scrape_kansis();
    const show_director = await scrape_kansis_director();
    const show_preview = await scrape_kansis_preview();
    const show_actors = await scrape_kansis_actors();

    for (let i = 0; i < show_name.length; i++) {

        const actors = show_actors[i] == "Tietoja ei onnistuttu hakemaan" ? show_director[i] : show_actors[i];
        console.log("Näyttelijät:" + actors);

        const show_object = {
            name: show_name[i],
            director: show_director[i],
            preview: show_preview[i],
            actors: actors
        };
        show_objects.push(show_object);
    }

    return show_objects;
}

module.exports = {
    organize_show_objects
};