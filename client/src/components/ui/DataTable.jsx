export default function DataTable({ columns, rows, emptyMessage = 'No data available' }) {
  if (!rows.length) {
    return <p className="text-center text-sm text-slate-400 py-10">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-white/10 text-left text-slate-500 dark:text-slate-400">
            {columns.map((c) => <th key={c.key} className="py-3 px-4 font-medium whitespace-nowrap">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row._id || i} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/60 dark:hover:bg-white/5">
              {columns.map((c) => (
                <td key={c.key} className="py-3 px-4 whitespace-nowrap">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
