export function debugIsEqual(a: any, b: any) {
  const notMatchingKeys = new Set<string>();

  for (const akey of Object.keys(a)) {
    if (a[akey] !== b[akey]) {
      notMatchingKeys.add(akey);
    }
  }
  for (const bkey of Object.keys(b)) {
    if (a[bkey] !== b[bkey]) {
      notMatchingKeys.add(bkey);
    }
  }

  if (notMatchingKeys.size > 0) {
    console.log(`Not equal: ${[...notMatchingKeys.keys()].join(', ')}`);
  }

  return notMatchingKeys.size === 0;
}
