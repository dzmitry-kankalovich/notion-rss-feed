const config = require('./rss-config.json')
const { transformRss } = require('./rss_transformer')
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });
const page_name = process.env.NOTION_PAGE_NAME;

exports.handler = async function () {

  const lists = await transformRss(config);

  // search for the specified RSS page
  const searchResult = await notion.search({
    query: page_name
  })

  if (searchResult.results.length === 0) {
    console.error('Cannot find RSS page. Cancelling execution...')
    return false
  }

  // Grab the target page ID for further usage
  const page_id = searchResult.results[0].id;

  // Create a new page with RSS items
  try {
    await notion.request({
      path: 'pages',
      method: "post",
      body: {
        "parent": { "page_id": page_id },
        "properties": {
          "title": [
            {
              "text": {
                "content": new Date().toISOString().slice(0, 10)
              }
            }
          ],
        },
        "children": lists
      }
    })
  } catch (error) {
    console.error(error.body)
    return false;
  }

  return true;
};