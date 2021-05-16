const Parser = require('rss-parser');
const { Client } = require("@notionhq/client");

const parser = new Parser();
const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });
const page_name = process.env.NOTION_PAGE_NAME;
const feed_url = process.env.RSS_FEED_URL;

exports.handler = async function (event) {

  // pull & parse RSS feed
  const feed = await parser.parseURL(feed_url);

  // search for the specified RSS page
  const searchResult = await notion.search({
    query: page_name
  })

  if (searchResult.results.length == 0) {
    console.error('Cannot find RSS page. Cancelling execution...')
    return false
  }

  // Grab the target page ID for further usage
  const page_id = searchResult.results[0].id;

  // Prepare the page contents on the basis of RSS feed
  list_items = feed.items.map(item => {
    return {
      "object": "block",
      "type": "bulleted_list_item",
      "bulleted_list_item": {
        "text": [
          {
            "type": "text",
            "text": {
              "content": item.title,
              "link": { "type": "url", "url": item.link }
            }
          }
        ]
      }
    }
  })

  // Create a new page with RSS items
  try {
    await notion.request({
      path: 'pages',
      method: "POST",
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
        "children": list_items
      }
    })
  } catch (error) {
    console.error(error.body)
    return false;
  }

  return true;
};