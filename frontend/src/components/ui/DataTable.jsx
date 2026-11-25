/**
 * Simple table.
 * columns: [{ key, label, render?(row), className? }]
 */
export default function DataTable({ columns, rows, empty = "Տվյալներ չկան", onRowClick }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? "table__row--clickable" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} className={c.className}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
