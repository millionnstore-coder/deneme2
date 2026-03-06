// --- SUPABASE AYARLARI (configs/supabase.js) ---

// 1. Supabase Kütüphanesini Çağır (CDN)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 2. Senin Proje Anahtarların (PANELDEN ALIP BURAYA YAPIŞTIR)
const supabaseUrl = 'https://nczumwgjoxhschrotfds.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jenVtd2dqb3hoc2Nocm90ZmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzI4NzUsImV4cCI6MjA4NjIwODg3NX0.b2FDUvm2pz_XKij9iP7mGmlSRuZ315YlZvUa2udZ1ck'

// 3. Bağlantıyı Kur
const supabase = createClient(supabaseUrl, supabaseKey)

// 4. Dışarı Aktar
export { supabase }