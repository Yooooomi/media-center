function symmetricDifference<T>(
  setA: Set<T>,
  setB: Set<T>,
): {onlyInA: T[]; onlyInB: T[]} {
  const onlyInA = Array.from(setA).filter(item => !setB.has(item));
  const onlyInB = Array.from(setB).filter(item => !setA.has(item));

  return {onlyInA, onlyInB};
}

export function debugIsEqual(a: any, b: any) {
  let equal = true;
  Object.entries(a).forEach(([key, value]) => {
    if (value !== b[key]) {
      console.log(`Property ${key} is not equal`);
      equal = false;
    }
  });
  const akeys = new Set(Object.keys(a));
  const bkeys = new Set(Object.keys(b));

  const {onlyInA, onlyInB} = symmetricDifference(akeys, bkeys);

  if (onlyInA.length > 0) {
    console.log(`  These keys are only present in before ${onlyInA}`);
  }
  if (onlyInB.length > 0) {
    console.log(`  These keys are only present in after ${onlyInB}`);
  }

  return equal;
}
