
import { Transaction } from '@/types';

/**
 * Exports transaction data to a CSV file
 */
export const exportToCSV = (transactions: Transaction[], filename: string): void => {
  // Format data as CSV
  const headers = ['Name', 'Amount', 'Date & Time'];
  const csvContent = [
    headers.join(','),
    ...transactions.map((transaction) => {
      const date = new Date(transaction.timestamp).toLocaleString();
      return `${transaction.name},${transaction.amount.toFixed(2)},"${date}"`;
    }),
  ].join('\n');

  // Create a Blob with the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link and trigger it
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports transaction data to an Excel file
 * This is a simplified implementation using CSV with .xlsx extension
 * For a production app, you might want to use a library like xlsx
 */
export const exportToExcel = (transactions: Transaction[], filename: string): void => {
  // Format data as CSV but with Excel-friendly formatting
  const headers = ['Name', 'Amount', 'Date & Time'];
  const csvContent = [
    headers.join('\t'),
    ...transactions.map((transaction) => {
      const date = new Date(transaction.timestamp).toLocaleString();
      return `${transaction.name}\t${transaction.amount.toFixed(2)}\t"${date}"`;
    }),
  ].join('\n');

  // Create a Blob with the CSV data (tab-separated for Excel)
  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  
  // Create a download link and trigger it
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
