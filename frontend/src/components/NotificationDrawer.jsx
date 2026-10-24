import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCheck, Clock, AlertTriangle, Truck, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export function NotificationDrawer() {
  const { notifications, unreadCount, drawerOpen, setDrawerOpen, markAsRead, markAllRead } = useNotifications();
  const [filter, setFilter] = React.useState('all'); // 'all' | 'unread' | 'pickups'

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.is_read;
      if (filter === 'pickups') {
        return ['FOOD_COLLECTED', 'PICKUP_READY', 'PICKUP_CLAIMED', 'DELIVERY_COMPLETED', 'PICKUP_FAILED'].includes(n.notification_type);
      }
      return true;
    });
  }, [notifications, filter]);

  const getIcon = (type) => {
    switch (type) {
      case 'FOOD_COLLECTED':
      case 'PICKUP_READY':
      case 'PICKUP_CLAIMED':
        return <Truck className="w-5 h-5 text-amber-500" />;
      case 'DELIVERY_COMPLETED':
      case 'REQUEST_ACCEPTED':
      case 'ACCOUNT_VERIFIED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'PICKUP_FAILED':
      case 'REQUEST_REJECTED':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="p-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded flex items-center gap-1 font-medium transition cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 bg-white text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filter === 'unread' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('pickups')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filter === 'pickups' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Logistics
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm">No notifications matching this filter</p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      n.is_read
                        ? 'bg-white border-slate-100 text-slate-600'
                        : 'bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(n.notification_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-sm font-semibold">{n.title}</h4>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block flex items-center gap-1">
                          <Clock className="w-3 h-3 inline" />
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
