const deepCopy = (items) =>
    JSON.parse(JSON.stringify(items))

const diff = (currentItems, prevItemsKeys, keepUpdatesOnly) => {
  return currentItems.map(item => {
    return prevItemsKeys.includes(item.title) ?
        (keepUpdatesOnly ? null : item) :
        ({
          ...item,
          title: `🔥 ${item.title}`
        })
  }).filter(item => item !== null)
}

exports.diffRss = function (currentItems, prevItems, keepUpdatesOnly) {
  const copy = deepCopy(currentItems);

  if (prevItems === null || prevItems?.length === 0) {
    return diff(copy, [], keepUpdatesOnly);
  } else {
    const prevItemsKeys = prevItems.map(item => item.title)
    return diff(copy, prevItemsKeys, keepUpdatesOnly)
  }
}