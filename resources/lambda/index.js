const config = require('./rss-config.json')
const { persistRss } = require("./rss_facade");
const { importToNotion } = require("./rss_facade");
const { processRss } = require("./rss_facade");

const page_name = process.env.NOTION_PAGE_NAME;
const bucket_name = process.env.RSS_BUCKET_NAME;

exports.handler = async function () {
  try {
    const rss = await processRss(bucket_name, config);
    await importToNotion(page_name, rss);
    await persistRss(bucket_name, rss);
  } catch (e) {
    console.error(e.message);
    return false
  }

  return true;
};