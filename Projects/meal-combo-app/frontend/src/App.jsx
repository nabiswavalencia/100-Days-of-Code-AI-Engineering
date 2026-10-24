import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { MotionConfig } from 'motion/react'
import RestaurantLayout from './components/RestaurantLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MenuPage from './pages/MenuPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import RecommendPage from './pages/RecommendPage.jsx'
import RestaurantsPage from './pages/RestaurantsPage.jsx'
import { useSession } from './lib/session.jsx'

// Pages behind the demo login send you to /login first.
function RequireUser() {
  const { user } = useSession()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

// A new page starts at the top, like a normal website.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    // reducedMotion="user": every Motion animation turns instant under prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/restaurants" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireUser />}>
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/r/:slug" element={<RestaurantLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="recommend" element={<RecommendPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MotionConfig>
  )
}
