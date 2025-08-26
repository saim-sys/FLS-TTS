import axios from 'axios'

// This is the SECURE PROXY layer that completely hides the external API
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL!
const EXTERNAL_API_TOKEN = process.env.EXTERNAL_API_TOKEN!

const externalApiClient = axios.create({
  baseURL: EXTERNAL_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${EXTERNAL_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

// Types for our internal API (completely different from external API)
export interface CreateTaskRequest {
  input: string
  voiceId: string
  modelId?: string
  style?: number
  speed?: number
  useSpeakerBoost?: boolean
  similarity?: number
  stability?: number
  exportSubtitle?: boolean
  maxCharactersPerLine?: number
  maxLinesPerCue?: number
  maxSecondsPerCue?: number
}

export interface TaskResponse {
  id: string
  input: string
  voiceId: string
  modelId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  resultUrl?: string
  subtitleUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UserInfo {
  id: string
  username: string
  balance: number
  credits: Array<{
    amount: number
    expireAt: string
  }>
}

// Proxy functions that transform requests/responses
export async function createTask(data: CreateTaskRequest): Promise<{ taskId: string }> {
  try {
    console.log('🔍 createTask: Starting task creation...')
    console.log('🔍 createTask: Input data:', data)
    
    // Transform our internal format to external API format
    const externalRequest = {
      input: data.input,
      voice_id: data.voiceId,
      model_id: data.modelId || 'eleven_multilingual_v2',
      style: data.style || 0.0,
      speed: data.speed || 1.0,
      use_speaker_boost: data.useSpeakerBoost || false,
      similarity: data.similarity || 0.75,
      stability: data.stability || 0.5,
      export_subtitle: data.exportSubtitle || false,
      max_characters_per_line: data.maxCharactersPerLine || 42,
      max_lines_per_cue: data.maxLinesPerCue || 2,
      max_seconds_per_cue: data.maxSecondsPerCue || 7,
    }
    
    console.log('🔍 createTask: External request payload:', externalRequest)
    console.log('🔍 createTask: Making request to external API...')

    const response = await externalApiClient.post('/api/elevenlabs/task', externalRequest)
    console.log('✅ createTask: External API response:', response.data)
    
    // Transform external response to our internal format
    return {
      taskId: response.data.task_id
    }
  } catch (error) {
    console.error('❌ createTask: Error:', error)
    if (axios.isAxiosError(error)) {
      console.error('❌ createTask: Response status:', error.response?.status)
      console.error('❌ createTask: Response data:', error.response?.data)
    }
    throw new Error('Failed to create voice generation task')
  }
}

export async function getTask(taskId: string): Promise<TaskResponse> {
  try {
    const response = await externalApiClient.get(`/api/elevenlabs/task/${taskId}`)
    
    // Transform external response to our internal format
    return {
      id: response.data.id,
      input: response.data.input,
      voiceId: response.data.voice_id,
      modelId: response.data.model_id,
      status: response.data.status,
      resultUrl: response.data.result,
      subtitleUrl: response.data.subtitle,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    }
  } catch (error) {
    console.error('Error getting task:', error)
    throw new Error('Failed to get task details')
  }
}

export async function getTaskHistory(page: number = 1, limit: number = 20): Promise<{
  tasks: TaskResponse[]
  total: number
  page: string
  limit: string
}> {
  try {
    const response = await externalApiClient.get(`/api/elevenlabs/task?page=${page}&limit=${limit}`)
    
    // Transform external response to our internal format
    return {
      tasks: response.data.tasks.map((task: any) => ({
        id: task.id,
        input: task.input,
        voiceId: task.voice_id,
        modelId: task.model_id,
        status: task.status,
        resultUrl: task.result,
        subtitleUrl: task.subtitle,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      })),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    }
  } catch (error) {
    console.error('Error getting task history:', error)
    throw new Error('Failed to get task history')
  }
}

export async function getUserInfo(): Promise<UserInfo> {
  try {
    console.log('🔍 getUserInfo: Making request to external API...')
    console.log('🔍 getUserInfo: Base URL:', EXTERNAL_API_BASE_URL)
    console.log('🔍 getUserInfo: Token exists:', !!EXTERNAL_API_TOKEN)
    
    const response = await externalApiClient.get('/api/me')
    console.log('✅ getUserInfo: External API response:', response.data)
    
    // Transform external response to our internal format
    return {
      id: response.data.id,
      username: response.data.username,
      balance: response.data.balance,
      credits: response.data.credits.map((credit: any) => ({
        amount: credit.amount,
        expireAt: credit.expire_at,
      })),
    }
  } catch (error) {
    console.error('❌ getUserInfo: Error:', error)
    if (axios.isAxiosError(error)) {
      console.error('❌ getUserInfo: Response status:', error.response?.status)
      console.error('❌ getUserInfo: Response data:', error.response?.data)
    }
    throw new Error('Failed to get user information')
  }
}

export async function deleteTask(taskId: string): Promise<{ message: string }> {
  try {
    const response = await externalApiClient.delete(`/api/elevenlabs/task/${taskId}`)
    return { message: response.data.message }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}
