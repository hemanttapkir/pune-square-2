import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blenhixylcitexupwrxm.supabase.co/rest/v1/',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZW5oaXh5bGNpdGV4dXB3cnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTEyMzQsImV4cCI6MjEwMTMyNzIzNH0.hNRzXInMhCvNvMbst8DQNxPtG2gJoCLwaptovsJs2mw'
);