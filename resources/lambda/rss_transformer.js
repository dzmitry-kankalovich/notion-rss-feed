exports.transformRss = function (rss) {
  return [
    { // RSS feed title
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "text": [{
          "type": "text",
          "text": {
            "content": rss.title
          }
        }]
      }
    }, // The actual RSS items
    ...rss.items.map(item => {
      return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "text": [
            {
              "type": "text",
              "text": {
                "content": item.title,
                "link": {"type": "url", "url": item.link}
              }
            }
          ]
        }
      }
    }),
    { // Blank line
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "text": [{
          "type": "text",
          "text": {
            "content": ''
          }
        }]
      }
    }
  ]
}