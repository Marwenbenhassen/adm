import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  
  downloadCSV(data: Blob, filename: string): void {
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  exportJSONToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) return;
    const columns = Object.keys(data[0]);
    let csv = columns.join(',') + '\n';
    for (const row of data) {
      const values = columns.map(col => {
        let value = row[col];
        if (value === undefined || value === null) value = '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    }
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadCSV(blob, filename);
  }
}
