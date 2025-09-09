import React, { ReactNode } from 'react';
import { SessionProvider } from './SessionContext';
import { TransactionProvider } from './TransactionContext';
import { WalletProvider } from './WalletContext';

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <SessionProvider>
      <WalletProvider>
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </WalletProvider>
    </SessionProvider>
  );
};
