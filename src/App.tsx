import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { RouteSelection } from './pages/RouteSelection';
import { TripSearchResults } from './pages/TripSearchResults';
import { TripDetails } from './pages/TripDetails';
import { BookingReview } from './pages/BookingReview';
import { PassengerDetails } from './pages/PassengerDetails';
import { MyTickets } from './pages/MyTickets';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { ErrorPage } from './pages/ErrorPage';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminTripsPage } from './pages/AdminTripsPage';
import { AdminRoutesPage } from './pages/AdminRoutesPage';
import { AdminBusesPage } from './pages/AdminBusesPage';
import { GoogleCallback } from './pages/GoogleCallback';
import { GuestLookup } from './pages/GuestLookup';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/oauth/google/callback" element={<GoogleCallback />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trips"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminTripsPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/routes"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminRoutesPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/buses"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminBusesPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/routes" element={<RouteSelection />} />
            <Route path="/booking/passengers" element={<PassengerDetails />} />
            <Route path="/search" element={<TripSearchResults />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/booking-review" element={<BookingReview />} />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/guest-booking" element={<GuestLookup />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
