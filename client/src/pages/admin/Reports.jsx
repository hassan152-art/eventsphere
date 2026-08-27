import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const REPORTS = [
  { key: 'registrations', label: 'Event Registrations' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'certificates', label: 'Certificates' },
];

export default function Reports() {
  const download = async (key, label) => {
    try {
      const token = localStorage.getItem('es_token');
      const base = import.meta.env.VITE_API_BASE_URL || '/api';

      if (!token) {
        alert('Session expired. Please login again.');
        return;
      }

      const response = await fetch(
        `${base}/reports/${key}?format=csv&token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'text/csv',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download ${key} report`);
      }

      // Get CSV text from backend
      const csvText = await response.text();

      if (!csvText.trim()) {
        alert('No data available for this report.');
        return;
      }

      // Convert CSV -> Excel workbook
      const workbook = XLSX.read(csvText, {
        type: 'string',
      });

      // Get first sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Make columns readable
      const range = XLSX.utils.decode_range(worksheet['!ref']);

      const columnWidths = [];

      for (let column = range.s.c; column <= range.e.c; column++) {
        let maxLength = 10;

        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: row,
            c: column,
          });

          const cell = worksheet[cellAddress];

          if (cell && cell.v !== undefined) {
            const value = String(cell.v);
            maxLength = Math.max(maxLength, value.length);
          }
        }

        columnWidths.push({
          wch: Math.min(maxLength + 2, 40),
        });
      }

      worksheet['!cols'] = columnWidths;

      // Download as Excel file
      XLSX.writeFile(
        workbook,
        `${key}-report.xlsx`
      );

    } catch (error) {
      console.error('Report download error:', error);
      alert('Unable to download report. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">
        Reports
      </h1>

      <div className="grid sm:grid-cols-2 gap-4">
        {REPORTS.map((report) => (
          <div
            key={report.key}
            className="card p-5 flex items-center justify-between"
          >
            <p className="font-semibold text-sm">
              {report.label}
            </p>

            <button
              type="button"
              onClick={() =>
                download(report.key, report.label)
              }
              className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-2"
            >
              <Download size={14} />
              Excel
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Click Excel to download a properly formatted spreadsheet.
      </p>
    </div>
  );
}