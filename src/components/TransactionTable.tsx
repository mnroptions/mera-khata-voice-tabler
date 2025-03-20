
import React, { useState } from 'react';
import { Transaction } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onDelete,
  onClear
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction,
    direction: 'ascending' | 'descending'
  }>({
    key: 'timestamp',
    direction: 'descending'
  });

  const sortedTransactions = React.useMemo(() => {
    const sortableTransactions = [...transactions];
    if (sortConfig.key) {
      sortableTransactions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  }, [transactions, sortConfig]);

  const requestSort = (key: keyof Transaction) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    exportToCSV(transactions, 'mera-khata-transactions');
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) return;
    exportToExcel(transactions, 'mera-khata-transactions');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <Card className="w-full shadow-medium glassmorphism">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Transactions</CardTitle>
          <CardDescription>
            {transactions.length === 0 
              ? "No transactions yet"
              : `Showing ${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`
            }
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            disabled={transactions.length === 0}
            className="text-xs transition-all duration-200"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            size="sm"
            disabled={transactions.length === 0}
            className="text-xs transition-all duration-200"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Excel
          </Button>
          {transactions.length > 0 && (
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="table-animation overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => requestSort('name')}
                >
                  Name
                  {sortConfig.key === 'name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/50 transition-colors text-right"
                  onClick={() => requestSort('amount')}
                >
                  Amount
                  {sortConfig.key === 'amount' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => requestSort('timestamp')}
                >
                  Date & Time
                  {sortConfig.key === 'timestamp' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No transactions recorded yet. Start by adding one using voice input!
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="table-row-animation">
                    <TableCell className="font-medium">{transaction.name}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium">{transaction.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatTimestamp(transaction.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
