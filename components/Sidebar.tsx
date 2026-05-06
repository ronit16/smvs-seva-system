'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Users, Folder, Heart, Link2,
  BarChart2, Building2, LogOut, ShieldCheck,
} from 'lucide-react'

type Role = 'super_admin' | 'center_admin'

interface Props {
  role: Role
  centerName?: string
  userName: string
}

const SUPER_ADMIN_NAV = [
  { href: '/super-admin',         icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/super-admin/centers', icon: Building2,       label: 'All Centers'  },
  { href: '/super-admin/members', icon: Users,           label: 'All Members'  },
  { href: '/super-admin/reports', icon: BarChart2,       label: 'Global Reports'},
]

const ADMIN_NAV = [
  { href: '/admin',             icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/admin/members',     icon: Users,           label: 'Members'      },
  { href: '/admin/categories',  icon: Folder,          label: 'Categories'   },
  { href: '/admin/sevas',       icon: Heart,           label: 'Sevas'        },
  { href: '/admin/assignments', icon: Link2,           label: 'Assignments'  },
  { href: '/admin/reports',     icon: BarChart2,       label: 'Reports'      },
]

export default function Sidebar({ role, centerName, userName }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const navItems = role === 'super_admin' ? SUPER_ADMIN_NAV : ADMIN_NAV

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <aside className="sidebar-gradient w-[260px] min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[rgba(255,215,0,0.15)]">
        <div className="font-cinzel text-sm text-yellow-300 font-semibold tracking-wide">
          SMVS Swaminarayan
        </div>
        <div className="text-[11px] text-white/60 tracking-[1.5px] uppercase mt-0.5">
          Seva Management
        </div>
        <span className={`inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide
          ${role === 'super_admin'
            ? 'bg-yellow-400 text-[#3D0C00]'
            : 'bg-white/20 text-white'
          }`}>
          {role === 'super_admin' ? '★ Super Admin' : 'Center Admin'}
        </span>
      </div>

      {/* Center badge */}
      {role === 'center_admin' && centerName && (
        <div className="mx-3 my-3 px-3 py-2.5 bg-white/[0.07] rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-yellow-400/70 font-semibold">Active Center</div>
          <div className="text-sm text-white font-semibold mt-0.5">{centerName}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2">
        <div className="text-[10px] uppercase tracking-[1.5px] text-yellow-400/50 font-semibold px-3 py-2">
          Menu
        </div>
        {navItems.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/admin' && item.href !== '/super-admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 mx-1 my-0.5 rounded-xl text-[13px] font-medium transition-all
                ${active
                  ? 'bg-gradient-to-r from-[rgba(201,136,13,0.4)] to-[rgba(232,101,10,0.3)] text-yellow-400 border border-[rgba(201,136,13,0.3)]'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <div className="text-[10px] text-white/40 uppercase tracking-wide">Logged in as</div>
          <div className="text-xs text-white/80 font-medium mt-0.5 truncate">{userName}</div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-white/70 bg-white/[0.06] hover:bg-red-900/40 hover:text-red-300 transition-all border border-white/10">
          <LogOut size={15}/>
          Logout
        </button>
      </div>
    </aside>
  )
}
