import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import DashboardView from './components/Dashboard/DashboardView';
import ExpensesView from './components/Expenses/ExpensesView';
import BudgetsView from './components/Budgets/BudgetsView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import InsightsView from './components/Insights/InsightsView';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSignupMode, setIsSignupMode] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isSignupMode ? (
      <SignupForm onToggleMode={() => setIsSignupMode(false)} />
    ) : (
      <LoginForm onToggleMode={() => setIsSignupMode(true)} />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'expenses':
        return <ExpensesView />;
      case 'budgets':
        return <BudgetsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'insights':
        return <InsightsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <DataProvider>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderView()}
      </Layout>
    </DataProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;