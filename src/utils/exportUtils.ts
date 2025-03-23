
import { Transaction } from '@/types';

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Exports transaction data to a CSV file
 */
export const exportToCSV = (transactions: Transaction[], filename: string): void => {
  // Format data as CSV
  const headers = ['Name', 'Amount', 'Date', 'Time'];
  const csvContent = [
    headers.join(','),
    ...transactions.map((transaction) => {
      const date = formatDate(transaction.timestamp);
      const time = formatTime(transaction.timestamp);
      return `${transaction.name},${transaction.amount.toFixed(2)},"${date}","${time}"`;
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
  const headers = ['Name', 'Amount', 'Date', 'Time'];
  const csvContent = [
    headers.join('\t'),
    ...transactions.map((transaction) => {
      const date = formatDate(transaction.timestamp);
      const time = formatTime(transaction.timestamp);
      return `${transaction.name}\t${transaction.amount.toFixed(2)}\t"${date}"\t"${time}"`;
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
