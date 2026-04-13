import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, Zap, Search, MapPin, GraduationCap, Building, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatMessage = (text) => {
    let formatted = text.replace(/\n/g, '<br/>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent-cyan);">$1</strong>');
    return `<div style="line-height: 1.6; font-size: 1.1rem; letter-spacing: 0.2px;">${formatted}</div>`;
};

const ChatWindow = () => {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: "Initializing **DTE BOT** Systems...\n\nWelcome to the student service portal! Please select your college from the dropdown above, then ask about admissions, courses, placements, and more."
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const messagesEndRef = useRef(null);

    // Searchable dropdown state
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Fetch colleges list
    useEffect(() => {
        fetch('/api/colleges')
            .then(r => r.json())
            .then(data => {
                if (data.status === 'success') setColleges(data.colleges);
            })
            .catch(console.error);
    }, []);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isDropdownOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isDropdownOpen]);

    // Filter colleges based on search
    const filteredColleges = colleges.filter(col => {
        const q = searchQuery.toLowerCase();
        return col.name.toLowerCase().includes(q) || (col.city || '').toLowerCase().includes(q);
    });

    const handleCollegeSelect = async (college) => {
        if (!college || selectedCollege?.id === college.id) {
            setIsDropdownOpen(false);
            return;
        }
        setSelectedCollege(college);
        setIsDropdownOpen(false);
        setSearchQuery('');
        setIsTyping(true);

        try {
            const res = await fetch('/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'set_college', college_id: college.id, message: '' })
            });
            const data = await res.json();
            setTimeout(() => {
                setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
                setIsTyping(false);
            }, 500);
        } catch (err) {
            console.error(err);
            setIsTyping(false);
        }
    };

    const handleSend = async (overrideText = null) => {
        const text = overrideText || input;
        if (!text.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text }]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    college_id: selectedCollege ? selectedCollege.id : null
                })
            });
            const data = await res.json();

            if (data.selected_college && colleges.length > 0) {
                const found = colleges.find(c => c.id === data.selected_college);
                if (found) setSelectedCollege(found);
            }

            setTimeout(() => {
                setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
                setIsTyping(false);
            }, 600 + Math.random() * 400);

        } catch (err) {
            console.error(err);
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'bot', text: 'Error connecting to DTE Assistant. Please try again.' }]);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && filteredColleges.length > 0) {
            handleCollegeSelect(filteredColleges[0]);
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
        }
    };

    const QuickAction = ({ icon: Icon, label, query }) => (
        <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(59, 130, 246, 0.15)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend(query)}
            style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-cyan)',
                padding: '12px 18px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500
            }}
        >
            <Icon size={18} />
            {label}
        </motion.button>
    );

    return (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* College Selector Bar */}
            <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(59,130,246,0.12)',
                background: 'rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    Select College:
                </span>

                {/* Searchable Dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '480px' }}>
                    {/* Trigger / Search Input */}
                    <div
                        onClick={() => setIsDropdownOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            background: 'rgba(30,41,59,0.8)',
                            border: isDropdownOpen
                                ? '1px solid rgba(59,130,246,0.6)'
                                : selectedCollege
                                    ? '1px solid rgba(59,130,246,0.4)'
                                    : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: isDropdownOpen ? '10px 10px 0 0' : '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Search size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        {isDropdownOpen ? (
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Search by college name or city..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    padding: 0
                                }}
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <span style={{
                                flex: 1,
                                color: selectedCollege ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontSize: '0.95rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {selectedCollege
                                    ? `${selectedCollege.name}${selectedCollege.city ? ` — ${selectedCollege.city}` : ''}`
                                    : '— Search & select a college —'}
                            </span>
                        )}
                        {selectedCollege && !isDropdownOpen ? (
                            <X
                                size={16}
                                style={{ color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCollege(null);
                                    setSearchQuery('');
                                }}
                            />
                        ) : (
                            <ChevronDown
                                size={16}
                                style={{
                                    color: 'var(--text-secondary)',
                                    flexShrink: 0,
                                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        )}
                    </div>

                    {/* Dropdown List */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(15, 23, 42, 0.98)',
                                    border: '1px solid rgba(59,130,246,0.4)',
                                    borderTop: 'none',
                                    borderRadius: '0 0 10px 10px',
                                    maxHeight: '240px',
                                    overflowY: 'auto',
                                    zIndex: 100,
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
                                }}
                            >
                                {filteredColleges.length > 0 ? filteredColleges.map(col => (
                                    <div
                                        key={col.id}
                                        onClick={() => handleCollegeSelect(col)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px',
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            background: selectedCollege?.id === col.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = selectedCollege?.id === col.id ? 'rgba(59,130,246,0.12)' : 'transparent'}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                color: 'var(--text-primary)',
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {col.name}
                                            </div>
                                            {col.city && (
                                                <div style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    marginTop: '2px'
                                                }}>
                                                    <MapPin size={11} />
                                                    {col.city}
                                                </div>
                                            )}
                                        </div>
                                        {selectedCollege?.id === col.id && (
                                            <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                                        )}
                                    </div>
                                )) : (
                                    <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        No colleges found matching "{searchQuery}"
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Active College Badge */}
                <AnimatePresence>
                    {selectedCollege && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(59,130,246,0.12)',
                                border: '1px solid rgba(59,130,246,0.3)',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                color: 'var(--accent-cyan)',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <CheckCircle2 size={14} />
                            {selectedCollege.city ? `${selectedCollege.city}` : 'Active'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        style={{
                            alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            gap: '12px',
                            flexDirection: msg.type === 'user' ? 'row-reverse' : 'row'
                        }}
                    >
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                            background: msg.type === 'user' ? 'var(--bg-user)' : 'var(--bg-bot)',
                            border: `1px solid ${msg.type === 'user' ? 'var(--accent-pink)' : 'var(--accent-cyan)'}`,
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            {msg.type === 'user' ? <Zap size={18} color="var(--accent-pink)" /> : <Cpu size={18} color="var(--accent-cyan)" />}
                        </div>
                        <div
                            style={{
                                background: msg.type === 'user' ? 'rgba(139,92,246,0.08)' : 'rgba(59,130,246,0.05)',
                                padding: '16px 22px',
                                borderRadius: '16px',
                                borderTopRightRadius: msg.type === 'user' ? '4px' : '16px',
                                borderTopLeftRadius: msg.type === 'bot' ? '4px' : '16px',
                                border: `1px solid ${msg.type === 'user' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.1)'}`,
                                color: '#e0e0e0'
                            }}
                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                        />
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--accent-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Cpu size={18} color="var(--accent-cyan)" />
                        </div>
                        <div style={{ padding: '16px 22px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div style={{ padding: '0 30px 15px 30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <QuickAction icon={GraduationCap} label="Admissions 2026" query="What are the admission dates?" />
                <QuickAction icon={Search} label="Courses & Fees" query="What courses are offered?" />
                <QuickAction icon={Building} label="Placements" query="Tell me about placements" />
                <QuickAction icon={MapPin} label="Contact" query="How to contact?" />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px 30px', borderTop: '1px solid rgba(59,130,246,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={selectedCollege ? `Ask about ${selectedCollege.name}...` : "Select a college above, then ask a question..."}
                        style={{
                            width: '100%',
                            padding: '18px 22px',
                            paddingRight: '65px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(139,92,246,0.2)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1.1rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
                    />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSend()}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-pink))',
                            border: 'none',
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <Send size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
