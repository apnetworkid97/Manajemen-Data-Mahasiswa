// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function compareValues(a, b, field, direction = "asc") {
  const first = String(a[field]).toLowerCase();
  const second = String(b[field]).toLowerCase();

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (first === second) {
    return 0;
  }

  const result = first > second ? 1 : -1;
  return direction === "desc" ? result * -1 : result;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function bubbleSort(items, field, direction = "asc") {
  const cloned = [...items];

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  for (let i = 0; i < cloned.length - 1; i += 1) {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    for (let j = 0; j < cloned.length - i - 1; j += 1) {
      if (compareValues(cloned[j], cloned[j + 1], field, direction) > 0) {
        const temp = cloned[j];
        cloned[j] = cloned[j + 1];
        cloned[j + 1] = temp;
      }
    }
  }

  return cloned;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function insertionSort(items, field, direction = "asc") {
  const cloned = [...items];

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  for (let i = 1; i < cloned.length; i += 1) {
    const current = cloned[i];
    let j = i - 1;

    while (j >= 0 && compareValues(cloned[j], current, field, direction) > 0) {
      cloned[j + 1] = cloned[j];
      j -= 1;
    }

    cloned[j + 1] = current;
  }

  return cloned;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function selectionSort(items, field, direction = "asc") {
  const cloned = [...items];

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  for (let i = 0; i < cloned.length - 1; i += 1) {
    let selectedIndex = i;
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    for (let j = i + 1; j < cloned.length; j += 1) {
      if (
        compareValues(cloned[selectedIndex], cloned[j], field, direction) > 0
      ) {
        selectedIndex = j;
      }
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (selectedIndex !== i) {
      const temp = cloned[i];
      cloned[i] = cloned[selectedIndex];
      cloned[selectedIndex] = temp;
    }
  }

  return cloned;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function merge(left, right, field, direction) {
  const merged = [];
  let leftIndex = 0;
  let rightIndex = 0;

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  while (leftIndex < left.length && rightIndex < right.length) {
    if (
      compareValues(left[leftIndex], right[rightIndex], field, direction) <= 0
    ) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return [
    ...merged,
    ...left.slice(leftIndex),
    ...right.slice(rightIndex),
  ];
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function mergeSort(items, field, direction = "asc") {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  if (items.length <= 1) {
    return [...items];
  }

  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), field, direction);
  const right = mergeSort(items.slice(middle), field, direction);

  return merge(left, right, field, direction);
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function shellSort(items, field, direction = "asc") {
  const cloned = [...items];
  let gap = Math.floor(cloned.length / 2);

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  while (gap > 0) {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    for (let i = gap; i < cloned.length; i += 1) {
      const current = cloned[i];
      let j = i;

      while (
        j >= gap &&
        compareValues(cloned[j - gap], current, field, direction) > 0
      ) {
        cloned[j] = cloned[j - gap];
        j -= gap;
      }

      cloned[j] = current;
    }

    gap = Math.floor(gap / 2);
  }

  return cloned;
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function linearSearchByNim(items, keyword) {
  return items.filter((item) => item.nim === keyword);
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function sequentialSearchByName(items, keyword) {
  const normalizedKeyword = keyword.toLowerCase();
  return items.filter((item) =>
    item.nama.toLowerCase().includes(normalizedKeyword)
  );
}

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
function binarySearchByNim(items, keyword) {
  const sorted = mergeSort(items, "nim", "asc");
  let left = 0;
  let right = sorted.length - 1;

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const currentNim = sorted[middle].nim;

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (currentNim === keyword) {
      return [sorted[middle]];
    }

    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (currentNim < keyword) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return [];
}

module.exports = {
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  shellSort,
  linearSearchByNim,
  sequentialSearchByName,
  binarySearchByNim,
};
