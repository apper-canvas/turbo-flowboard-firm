import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routes } from '@/config/routes';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationRoutes = Object.values(routes).filter(route => !route.hideFromNav);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-surface-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <ApperIcon name="Zap" size={18} className="text-white" />
              </div>
              <h1 className="font-display font-bold text-xl text-surface-900">FlowBoard Pro</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
              <ApperIcon name="Search" size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
              <ApperIcon name="Bell" size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-surface-200 flex-col z-40">
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationRoutes.map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                    }`
                  }
                >
                  <ApperIcon name={route.icon} size={18} />
                  {route.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                transition={{ duration: 0.3 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                transition={{ duration: 0.3 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50"
              >
                <div className="p-4 border-b border-surface-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <ApperIcon name="Zap" size={18} className="text-white" />
                    </div>
                    <h1 className="font-display font-bold text-xl text-surface-900">FlowBoard Pro</h1>
                  </div>
                </div>
                <nav className="flex-1 p-4">
                  <div className="space-y-1">
                    {navigationRoutes.map((route) => (
                      <NavLink
                        key={route.id}
                        to={route.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                          }`
                        }
                      >
                        <ApperIcon name={route.icon} size={18} />
                        {route.label}
                      </NavLink>
                    ))}
                  </div>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;