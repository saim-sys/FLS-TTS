'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { 
  Mic, 
  Play, 
  Download, 
  Trash2, 
  LogOut, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'
import AudioPlayer from '@/components/AudioPlayer'

const createTaskSchema = z.object({
  input: z.string().min(1, 'Text is required').max(5000, 'Text is too long'),
  voiceId: z.string().min(1, 'Voice is required'),
  modelId: z.string().optional(),
  style: z.number().min(0).max(1).optional(),
  speed: z.number().min(0.7).max(1.2).optional(),
  useSpeakerBoost: z.boolean().optional(),
  similarity: z.number().min(0).max(1).optional(),
  stability: z.number().min(0).max(1).optional(),
})

type CreateTaskForm = z.infer<typeof createTaskSchema>

interface Task {
  id: string
  input: string
  voiceId: string
  modelId: string
  status: string
  resultUrl?: string
  subtitleUrl?: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  username: string
  isAdmin: boolean
  balance?: number
  credits?: Array<{
    amount: number
    expireAt: string
  }>
}



export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [audioPlayer, setAudioPlayer] = useState<{ isOpen: boolean; audioUrl: string }>({
    isOpen: false,
    audioUrl: ''
  })
  const router = useRouter()

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      modelId: 'eleven_multilingual_v2',
      style: 0.0,
      speed: 1.0,
      useSpeakerBoost: false,
      similarity: 0.75,
      stability: 0.5,
    },
  })

  useEffect(() => {
    console.log('🔍 Dashboard: Checking authentication...')
    
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    console.log('🔍 Dashboard: Token exists:', !!token)
    console.log('🔍 Dashboard: User data exists:', !!userData)
    
    if (!token || !userData) {
      console.log('❌ Dashboard: Missing token or user data, redirecting to login')
      router.push('/')
      return
    }

    console.log('✅ Dashboard: Authentication found, setting user...')
    setUser(JSON.parse(userData))
    loadUserInfo()
    loadTasks()
  }, [router])

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }



  const onCreateTask = async (data: CreateTaskForm) => {
    setIsCreating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      toast.success('Task created successfully!')
      form.reset()
      loadTasks()
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  const onCheckStatus = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tasks/${taskId}/check-status`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Task status updated: ${result.status}`)
        loadTasks()
      } else {
        throw new Error('Failed to check task status')
      }
    } catch (error) {
      toast.error('Failed to check task status')
    }
  }

  const onPlayAudio = (audioUrl: string) => {
    setAudioPlayer({
      isOpen: true,
      audioUrl: `/api/proxy/audio?url=${encodeURIComponent(audioUrl)}`
    })
  }

  const closeAudioPlayer = () => {
    setAudioPlayer({ isOpen: false, audioUrl: '' })
  }

  const onDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast.success('Task deleted successfully!')
        loadTasks()
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
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
              <Mic className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">VoiceGen</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome, {user.username}</p>
                <p className="text-xs text-gray-500">Balance: {user.balance ? user.balance.toLocaleString() : 'Loading...'}</p>
              </div>
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Task Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Create New Voice</h2>
              <form onSubmit={form.handleSubmit(onCreateTask)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text to Convert
                  </label>
                  <textarea
                    {...form.register('input')}
                    rows={4}
                    className="input-field"
                    placeholder="Enter the text you want to convert to speech..."
                  />
                  {form.formState.errors.input && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.input.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice ID
                  </label>
                  <input
                    type="text"
                    {...form.register('voiceId')}
                    className="input-field"
                    placeholder="Enter voice ID (e.g., 21m00Tcm4TlvDq8ikWAM)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the voice ID you want to use for text-to-speech generation
                  </p>
                  {form.formState.errors.voiceId && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.voiceId.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speed
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.7"
                      max="1.2"
                      {...form.register('speed', { valueAsNumber: true })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      {...form.register('style', { valueAsNumber: true })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Similarity
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      {...form.register('similarity', { valueAsNumber: true })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stability
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      {...form.register('stability', { valueAsNumber: true })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...form.register('useSpeakerBoost')}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Use Speaker Boost</label>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-primary w-full"
                >
                  {isCreating ? 'Creating...' : 'Generate Voice'}
                </button>
              </form>
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Your Voice Generations</h2>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No voice generations yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getStatusIcon(task.status)}
                            <span className="ml-2 text-sm font-medium capitalize">
                              {task.status}
                            </span>
                            <span className="ml-auto text-xs text-gray-500">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2 line-clamp-2">{task.input}</p>
                          <p className="text-sm text-gray-600">Voice: {task.voiceId}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {task.status === 'completed' && task.resultUrl && (
                            <>
                              <button
                                onClick={() => onPlayAudio(task.resultUrl!)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Play audio"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/api/proxy/audio?url=${encodeURIComponent(task.resultUrl!)}`, '_blank')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Download audio"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {task.status === 'pending' && (
                            <button
                              onClick={() => onCheckStatus(task.id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                              title="Check status"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Player Modal */}
      {audioPlayer.isOpen && (
        <AudioPlayer
          audioUrl={audioPlayer.audioUrl}
          onClose={closeAudioPlayer}
        />
      )}
    </div>
  )
}
