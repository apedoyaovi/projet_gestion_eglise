import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Members } from '@/pages/Members';
import { AddMember } from '@/pages/AddMember';
import { MemberDetails } from '@/pages/MemberDetails';
import { Finance } from '@/pages/Finance';
import { Events } from '@/pages/Events';
import { Settings } from '@/pages/Settings';
import { AddIncome } from '@/pages/AddIncome';
import { AddExpense } from '@/pages/AddExpense';
import { AddEvent } from '@/pages/AddEvent';
import { EditMember } from '@/pages/EditMember';
import { EventDetails } from '@/pages/EventDetails';
import { EditEvent } from '@/pages/EditEvent';
import { PublicEventsList } from '@/pages/PublicEventsList';
import { PublicEventDetail } from '@/pages/PublicEventDetail';
import { NotFound } from '@/pages/NotFound';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/archives" element={<PublicEventsList />} />
          <Route path="/archives/:id" element={<PublicEventDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Protected/Admin Routes */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/new" element={<AddMember />} />
            <Route path="/members/:id" element={<MemberDetails />} />
            <Route path="/members/edit/:id" element={<EditMember />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/income" element={<AddIncome />} />
            <Route path="/finance/expense" element={<AddExpense />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/new" element={<AddEvent />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events/:id/edit" element={<EditEvent />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
