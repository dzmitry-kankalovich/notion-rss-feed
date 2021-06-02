const Parser = require('rss-parser');

const parser = new Parser();

exports.importRss = async function* (config) {
  for (const rss of config.rss) {
    const feed = await parser.parseURL(rss.url)
    yield {
      ...rss,
      items: 'limit' in rss ?
          feed.items.slice(0, rss.limit) :
          feed.items,
    };
  }
}