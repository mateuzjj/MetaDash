import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportsService {
  async exportToCSV(data: any[]): Promise<string> {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  async exportToPDF(data: any[]): Promise<Buffer> {
    // PDF generation would be implemented here
    // Using a library like puppeteer or pdfkit
    return Buffer.from('PDF export placeholder');
  }
}
