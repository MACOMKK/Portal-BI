import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Building2, FileText, Shield, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/AuthContext';

const MACOM_LOGO_URL = 'https://svlhklfzwtcvaospmhxy.supabase.co/storage/v1/object/public/Imagens%20macom/image_macom.png';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { path: '/admin/reports', icon: FileText, label: 'Relatórios', adminOnly: true },
  { path: '/admin/units', icon: Building2, label: 'Unidades', adminOnly: true },
  { path: '/admin/permissions', icon: Shield, label: 'Permissões', adminOnly: true },
  { path: '/admin/settings', icon: Settings, label: 'Configurações', adminOnly: true },
];

export default function Sidebar({ user, collapsed, onToggle, onClose }) {
  const { logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
        style={{ background: '#141414', borderRight: '1px solid #222' }}
      >
        {/* Logo MACOM */}
        <div className={`flex items-center gap-3 h-16 border-b px-4 ${collapsed ? 'justify-center' : ''}`} style={{ borderColor: '#222' }}>
          <img src={MACOM_LOGO_URL} alt="MACOM" className="w-10 h-9 object-cover flex-shrink-0" />
          {!collapsed && (
            <div>
              <span className="text-white font-black text-base tracking-widest uppercase">MACOM</span>
              <p className="text-[10px] tracking-wider uppercase" style={{ color: '#E30613' }}>Portal BI</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {isAdmin && !collapsed && (
            <p className="text-[9px] uppercase tracking-widest font-bold px-3 mb-3 mt-1" style={{ color: '#555' }}>
              Navegação
            </p>
          )}
          {filteredItems.map(item => {
            const isActive = location.pathname === item.path;
            const linkContent = (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${
                  collapsed ? 'justify-center' : ''
                }`}
                style={{
                  background: isActive ? '#E30613' : 'transparent',
                  color: isActive ? '#fff' : '#aaa',
                  borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = '#222';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#aaa';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="text-xs">{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-bold uppercase tracking-wider text-xs">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t p-3 space-y-2" style={{ borderColor: '#222' }}>
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: '#E30613' }}
              >
                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white">{user.full_name || 'Usuário'}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: '#E30613' }}>{user.role || 'user'}</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center py-2 transition-colors"
            style={{ color: '#555' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {!collapsed && (
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ color: '#555' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E30613'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#555'; }}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
