'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  Users, 
  CreditCard, 
  Activity, 
  Settings, 
  LogOut,
  UserPlus,
  UserMinus,
  DollarSign,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  email: string
  username: string
  isActive: boolean
  isAdmin: boolean
  balance: number
  credits: Array<{
    amount: number
    expireAt: string
  }>
  createdAt: string
  taskCount: number
}

interface Task {
  id: string
  userId: string
  input: string
  status: string
  createdAt: string
  resultUrl?: string
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  completedTasks: number
  totalBalance: number
  totalCredits: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (!parsedUser.isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      router.push('/dashboard')
      return
    }

    setUser(parsedUser)
    loadAdminData()
  }, [router])

  const loadAdminData = async () => {
    try {
      console.log('🔄 loadAdminData called...')
      const token = localStorage.getItem('token')
      
      // Load all users
      const usersResponse = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('📡 Users data loaded:', usersData.users)
        setUsers(usersData.users)
      } else {
        console.error('❌ Failed to load users:', usersResponse.status)
      }

      // Load all tasks
      const tasksResponse = await fetch('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks)
      }

      // Load dashboard stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
        loadAdminData()
      } else {
        throw new Error('Failed to update user status')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const updateUserBalance = async (userId: string, balance: number) => {
    try {
      console.log('🔄 updateUserBalance called with:', { userId, balance })
      
      const token = localStorage.getItem('token')
      console.log('🔍 Token exists:', !!token)
      
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ balance }),
      })

      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📡 Response data:', result)

      if (response.ok) {
        console.log('✅ Balance update successful, reloading data...')
        toast.success('Balance updated successfully')
        await loadAdminData()
        console.log('✅ Admin data reloaded')
      } else {
        console.error('❌ Balance update failed:', result)
        throw new Error(result.error || 'Failed to update balance')
      }
    } catch (error) {
      console.error('❌ Balance update error:', error)
      toast.error('Failed to update balance')
    }
  }

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              <button
                onClick={onLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'tasks', name: 'Tasks', icon: Activity },
              { id: 'billing', name: 'Billing', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Task completed by user
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.balance?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.taskCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user.id, !user.isActive)}
                              className={`text-sm px-3 py-1 rounded ${
                                user.isActive
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                const newBalance = prompt('Enter new balance:', user.balance?.toString() || '0')
                                if (newBalance !== null) {
                                  updateUserBalance(user.id, parseInt(newBalance) || 0)
                                }
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 rounded"
                            >
                              Update Balance
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Tasks</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Input
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {users.find(u => u.id === task.userId)?.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {task.input}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Billing & Credits</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credit Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Summary</h3>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">Balance: {user.balance?.toLocaleString() || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Credits: {user.credits?.reduce((sum, credit) => sum + credit.amount, 0) || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Analytics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Tasks Today</span>
                    <span className="text-sm font-medium">
                      {tasks.filter(t => 
                        new Date(t.createdAt).toDateString() === new Date().toDateString()
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Tasks</span>
                    <span className="text-sm font-medium">
                      {tasks.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Failed Tasks</span>
                    <span className="text-sm font-medium">
                      {tasks.filter(t => t.status === 'failed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
