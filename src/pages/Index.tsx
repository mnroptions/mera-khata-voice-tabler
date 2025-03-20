
import React, { useState, useEffect } from 'react';
import VoiceInput from '@/components/VoiceInput';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const LOCAL_STORAGE_KEY = 'mera-khata-transactions';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Load transactions from localStorage on initial render
  useEffect(() => {
    const savedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error parsing saved transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved transactions.',
          variant: 'destructive',
        });
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const handleTransactionAdded = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    toast({
      title: 'Transaction Deleted',
      description: 'The transaction has been removed.',
    });
  };

  const handleClearTransactions = () => {
    setShowClearDialog(true);
  };

  const confirmClearTransactions = () => {
    setTransactions([]);
    setShowClearDialog(false);
    toast({
      title: 'All Transactions Cleared',
      description: 'Your transaction history has been cleared.',
    });
  };

  const cancelClearTransactions = () => {
    setShowClearDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center animate-fade-in">
          <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Voice-Powered Finance Tracker
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Mera Khata
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Speak to record transactions and manage your finances effortlessly with voice commands
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 animate-fade-in-up">
          <VoiceInput onTransactionAdded={handleTransactionAdded} />
          
          <TransactionTable 
            transactions={transactions} 
            onDelete={handleDeleteTransaction} 
            onClear={handleClearTransactions}
          />
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Mera Khata &copy; {new Date().getFullYear()} - Voice-powered finance tracking</p>
        </footer>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All transactions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClearTransactions}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearTransactions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
