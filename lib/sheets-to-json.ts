export function sheetsToJson(data: unknown[][]): Record<string, unknown>[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const headers = data[0] as string[];
  const rows = data.slice(1);

  return rows
    .filter((row) => row.some((cell) => cell !== "" && cell !== null && cell !== undefined))
    .map((row, index) => {
      const obj: Record<string, unknown> = { _rowIndex: index + 2 };

      headers.forEach((header, colIndex) => {
        obj[header] = row[colIndex] !== undefined ? row[colIndex] : null;
      });

      return obj;
    });
}
