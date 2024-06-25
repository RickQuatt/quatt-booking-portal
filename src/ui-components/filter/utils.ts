export const matchField = (field: string | null, search: string) => {
  if (field === null) return false;

  const exactMatchRegex = /^"(.*)"$/;
  const exactMatch = search.match(exactMatchRegex);

  // Check if the search string is wrapped in quotes
  if (exactMatch) {
    // Perform an exact match for the content inside the quotes
    const exactSearch = exactMatch[1];
    return field.toLowerCase() === exactSearch.toLowerCase();
  } else {
    // Perform a fuzzy match
    return field.toLowerCase().includes(search.toLowerCase());
  }
};

export const stringToBoolean = (value: string) => {
  return value === "true" ? true : false;
};
