import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://febpplzuipsowruqhkgg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlYnBwbHp1aXBzb3dydXFoa2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDAzODAsImV4cCI6MjA4NzU3NjM4MH0.hBvTSGKrv6moniKWeK_5kGbRkHnyB6JMv1yJ_uPGlp0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)