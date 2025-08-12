import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute/ProtectedRoute";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import SignupPage from "../pages/SignupPage/SignupPage";
import VerifyPage from "../pages/VerifyPage/VerifyPage";
import ResetPasswordPage from "../pages/ResetPasswordPage/ResetPasswordPage";
import LearnMorePage from "../pages/LearnMorePage/LearnMorePage";
import TermsPage from "../pages/TermsPage/TermsPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage/PrivacyPolicyPage";
import CookiesPolicyPage from "../pages/CookiesPolicyPage/CookiesPolicyPage";

import ExplorePage from "../pages/ExplorePage/ExplorePage";
import MessagesPage from "../pages/MessagesPage/MessagesPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import SearchPage from "../pages/SearchPage/SearchPage";
import NotificationsPage from "../pages/NotificationsPage/NotificationsPage";
import CreatePage from "../pages/CreatePage/CreatePage";
import ViewPostPage from "../pages/ViewPostPage/ViewPostPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

import EditProfilePage from "../pages/EditProfilePage/EditProfilePage";
import Profile from "../modules/Profile/Profile";

import Panel from "../shared/components/Panel/Panel";

export default function Navigation() {
  const location = useLocation();
  const state = location.state;

  return (
    <>
      <Routes location={state?.background || location}>
        {/* Публичные */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies-policy" element={<CookiesPolicyPage />} />

        {/* Защищенные */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <ViewPostPage />
            </ProtectedRoute>
          }
        />
        {/* NotFound */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {state?.background && (
        <Routes>
          <Route
            path="/search"
            element={
              <Panel>
                <SearchPage />
              </Panel>
            }
          />
          <Route
            path="/notifications"
            element={
              <Panel>
                <NotificationsPage />
              </Panel>
            }
          />
        </Routes>
      )}
    </>
  );
}