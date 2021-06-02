const { putRssFile } = require("./rss_s3");
const { transformRss } = require("./rss_transformer");
const { diffRss } = require("./rss_diff");
const { getRssFile } = require("./rss_s3");
const { importRss } = require("./rss_importer");

const { Client } = require("@notionhq/client");

const notion = new Client({auth: process.env.NOTION_INTEGRATION_TOKEN});


exports.processRss = async function (bucket, config) {
  const rssEndpoints = []
  for await (const rssEndpoint of importRss(config)) {

    const prevRssItems = await getRssFile(bucket, rssEndpoint.url)

    const itemsDiff = diffRss(
        rssEndpoint.items,
        prevRssItems,
        rssEndpoint.updates_only
    )

    if (itemsDiff.length === 0) {
      itemsDiff.push({
        title: 'Nothing new today',
        link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      })
    }

    const transform = transformRss({
      ...rssEndpoint,
      items: itemsDiff
    })

    rssEndpoints.push({
      ...rssEndpoint,
      originalItems: rssEndpoint.items,
      items: transform,
    })
  }
  return rssEndpoints;
};

exports.importToNotion = async function (pageName, rss) {
  // search for the specified RSS page
  const searchResult = await notion.search({
    query: pageName
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
        "parent": {"page_id": page_id},
        "properties": {
          "title": [
            {
              "text": {
                "content": new Date().toISOString().slice(0, 10)
              }
            }
          ],
        },
        "children": rss.flatMap(rss => rss.items)
      }
    })
  } catch (error) {
    console.error(error.body)
    return false
  }
}

exports.persistRss = async function (bucket, rss) {
  for (const rssItem of rss) {
    await putRssFile(bucket, rssItem);
  }
};