import React, { useState } from 'react';
import { DashboardLayout, PageId } from './layouts/DashboardLayout';
import { ExecutiveOverviewPage } from './pages/ExecutiveOverviewPage';
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage';
import { ProductAnalyticsPage } from './pages/ProductAnalyticsPage';
import { RegionalAnalyticsPage } from './pages/RegionalAnalyticsPage';
import { ProfitabilityPage } from './pages/ProfitabilityPage';
import { CustomerAnalyticsPage } from './pages/CustomerAnalyticsPage';
import { BusinessInsightsPage } from './pages/BusinessInsightsPage';
import { PipelineAutomationPage } from './pages/PipelineAutomationPage';
import { DataExplorerPage } from './pages/DataExplorerPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <ExecutiveOverviewPage />;
      case 'sales':
        return <SalesAnalyticsPage />;
      case 'products':
        return <ProductAnalyticsPage />;
      case 'regions':
        return <RegionalAnalyticsPage />;
      case 'profitability':
        return <ProfitabilityPage />;
      case 'customers':
        return <CustomerAnalyticsPage />;
      case 'insights':
        return <BusinessInsightsPage />;
      case 'pipeline':
        return <PipelineAutomationPage />;
      case 'explorer':
        return <DataExplorerPage />;
      default:
        return <ExecutiveOverviewPage />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </DashboardLayout>
  );
};

export default App;

