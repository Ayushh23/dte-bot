import { useState, useEffect } from 'react'
import { Bot, ShieldAlert, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatWindow from './components/ChatWindow'
import AdminPanel from './components/AdminPanel'
import './index.css'

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState({ isAuthenticated: false, collegeId: null });

  useEffect(() => {
    // Check if admin is currently authenticated session
    fetch('/admin/check_auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAdminAuth({ isAuthenticated: true, collegeId: data.college_id });
        }
      })
      .catch(err => console.error("Could not check auth", err));
  }, []);

  return (
    <div className="app-container">
      {/* Dynamic Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 40px', borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-panel)', backdropFilter: 'blur(12px)', zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ 
              width: '45px', height: '45px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Bot size={28} color="#ffffff" />
          </motion.div>
          <div>
            <h1 className="premium-text" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              DTE BOT <Sparkles size={16} color="var(--accent-secondary)"/>
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500 }}>
              Department of Technical Education
            </p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(37, 99, 235, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontFamily: 'inherit',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          <ShieldAlert size={18} />
          {isAdminOpen ? 'Close Admin' : 'Admin Portal'}
        </motion.button>
      </motion.header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', padding: '30px', gap: '30px', position: 'relative', overflow: 'hidden' }}>
        
        <AnimatePresence mode="wait">
          {!isAdminOpen ? (
            <motion.div 
              key="chat"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <ChatWindow />
            </motion.div>
          ) : (
            <motion.div 
              key="admin"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <AdminPanel adminAuth={adminAuth} setAdminAuth={setAdminAuth} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}

export default App
