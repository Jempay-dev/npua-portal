/**
 * Downloads an .xlsx file.
 * rows: [{ "Column title": value, ... }] — the keys of the first row become the header.
 * The Excel library is big, so it is loaded only when this function runs.
 */
export async function downloadExcel(fileName, sheetName, rows) {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows);

  // Make each column roughly as wide as its longest value.
  const headers = Object.keys(rows[0] ?? {});
  sheet["!cols"] = headers.map((h) => ({
    wch: Math.max(h.length, ...rows.map((r) => String(r[h] ?? "").length)) + 2,
  }));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(book, fileName);
}
