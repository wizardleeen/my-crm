import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://voyxrzvueadloyzcpebk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveXhyenZ1ZWFkbG95emNwZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDc0MzIsImV4cCI6MjA4NzUyMzQzMn0.i85WF9oeT2hkncXjELuFfNonYxN7Gz73UzseopZkP3M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
