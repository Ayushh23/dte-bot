import React, { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, Database, Edit3, Save, RefreshCw, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = ({ adminAuth, setAdminAuth }) => {
    const [view, setView] = useState('login');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (adminAuth.isAuthenticated) setView('dashboard');
    }, [adminAuth]);

    const handleLogin = async () => {
        try {
            const res = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                setAdminAuth({ isAuthenticated: true, collegeId: data.college_id });
                setView('dashboard');
                setErrorMsg('');
            } else {
                setErrorMsg(data.message || 'Login failed');
            }
        } catch (e) { setErrorMsg('Connection error'); }
    };

    const inputStyle = {
        width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px',
        color: 'white', marginBottom: '15px', outline: 'none', fontFamily: 'inherit',
        colorScheme: 'dark'
    };
    const btnStyle = {
        width: '100%', padding: '15px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-pink))',
        border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    };

    if (view === 'login') {
        return (
            <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: '40px' }}>
                <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <Lock size={24} /> Admin Access
                </h2>
                {errorMsg && <p style={{ color: 'var(--accent-pink)', textAlign: 'center', marginBottom: '15px' }}>{errorMsg}</p>}
                <input style={inputStyle} type="text" placeholder="Username" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} />
                <input style={inputStyle} type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} onKeyPress={e => e.key === 'Enter' && handleLogin()} />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={btnStyle} onClick={handleLogin}>
                    Sign In
                </motion.button>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a href="#" onClick={() => setView('signup')} style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.9rem' }}>Register New College Portal</a>
                </div>
            </div>
        );
    }

    if (view === 'signup') {
        return <AdminSignup setView={setView} setAdminAuth={setAdminAuth} />;
    }

    return <AdminDashboard adminAuth={adminAuth} setAdminAuth={setAdminAuth} />;
};

const ENTRANCE_EXAMS = ['JEE Main', 'JEE Advanced', 'REAP', 'CET Rajasthan', 'BITSAT', 'VITEEE', 'Rajasthan PTET', 'MAT', 'CAT', 'State Merit Based'];
const CUTOFF_OPTIONS = ['Open Merit (No cutoff)', '>50% in PCM', '>60% in PCM', '>65% in PCM', '>70% in PCM', '>75% in PCM', '>80% in PCM', '>85% in PCM', '>90% in PCM', 'Rank Based (Exam Score)'];
const HOSTEL_OPTIONS = ['Boys & Girls hostels available', 'Boys hostel only', 'Girls hostel only', 'No hostel facility'];

const AdminSignup = ({ setView, setAdminAuth }) => {
    const [formData, setFormData] = useState({
        username: '', password: '', college_name: '', city: '',
        adm_dates: '', adm_exam: 'N/A', adm_cutoff: 'N/A',
        phone: '', email: '', address: '', top_companies: '',
        highest_package: '', average_package: '',
        hostel_options: '', hostel_fees: ''
    });
    const [admStartDate, setAdmStartDate] = useState('');
    const [admEndDate, setAdmEndDate] = useState('');
    const [hasEntrance, setHasEntrance] = useState(false);
    const [selectedExam, setSelectedExam] = useState('');
    const [courses, setCourses] = useState([{ name: '', fee: '' }]);
    const [errorMsg, setErrorMsg] = useState('');

    const buildAdmDates = (start, end) => {
        if (!start && !end) return '';
        if (start && end) return `${new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} – ${new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        return start ? `From ${new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}` : `Until ${new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`;
    };

    const handleSignup = async () => {
        const payload = {
            ...formData,
            adm_dates: buildAdmDates(admStartDate, admEndDate) || formData.adm_dates,
            adm_exam: hasEntrance ? selectedExam : 'N/A',
            adm_cutoff: hasEntrance ? formData.adm_cutoff : 'N/A',
            courses: courses.filter(c => c.name || c.fee)
        };
        try {
            const res = await fetch('/admin/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                setAdminAuth({ isAuthenticated: true, collegeId: data.college_id });
            } else {
                setErrorMsg(data.message);
            }
        } catch (e) { setErrorMsg("Failed to connect"); }
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px',
        color: 'white', marginBottom: '10px', outline: 'none', fontFamily: 'inherit', fontSize: '1rem',
        colorScheme: 'dark'
    };
    const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px', display: 'block' };
    const sectionStyle = { color: 'var(--accent-cyan)', marginTop: '20px', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 };

    return (
        <div className="glass-panel" style={{ width: '640px', display: 'flex', flexDirection: 'column', padding: '40px', overflowY: 'auto', maxHeight: '90vh' }}>
            <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.5rem' }}>College Registration Form</h2>
            {errorMsg && <p style={{ color: 'var(--accent-pink)', textAlign: 'center', marginBottom: '10px' }}>{errorMsg}</p>}

            {/* Credentials */}
            <h4 style={sectionStyle}>🔐 Account Credentials</h4>
            <label style={labelStyle}>Username</label>
            <input style={inputStyle} type="text" placeholder="admin_username" onChange={e => setFormData({ ...formData, username: e.target.value })} />
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <label style={labelStyle}>College Name</label>
            <input style={inputStyle} type="text" placeholder="e.g. Gandhi Engineering College" onChange={e => setFormData({ ...formData, college_name: e.target.value })} />
            <label style={labelStyle}>City</label>
            <input style={inputStyle} type="text" placeholder="e.g. Jodhpur, Kota, Jaipur" onChange={e => setFormData({ ...formData, city: e.target.value })} />

            {/* Admissions */}
            <h4 style={sectionStyle}>📅 Admission Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                <div>
                    <label style={labelStyle}>Registration Start Date</label>
                    <input style={{ ...inputStyle, marginBottom: 0 }} type="date"
                        value={admStartDate} onChange={e => setAdmStartDate(e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Registration End Date</label>
                    <input style={{ ...inputStyle, marginBottom: 0 }} type="date"
                        value={admEndDate} onChange={e => setAdmEndDate(e.target.value)} />
                </div>
            </div>

            {/* Entrance Exam toggle */}
            <label style={{ ...labelStyle, marginTop: '12px' }}>Is there an Entrance Exam?</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                {['Yes', 'No'].map(opt => (
                    <motion.button
                        key={opt}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setHasEntrance(opt === 'Yes');
                            if (opt === 'No') {
                                setSelectedExam('');
                                setFormData(prev => ({ ...prev, adm_cutoff: 'N/A' }));
                            }
                        }}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600,
                            background: (opt === 'Yes' ? hasEntrance : !hasEntrance) ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.03)',
                            border: (opt === 'Yes' ? hasEntrance : !hasEntrance) ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                            color: (opt === 'Yes' ? hasEntrance : !hasEntrance) ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        }}
                    >{opt}</motion.button>
                ))}
            </div>

            {/* Exam dropdown + Cutoff — only shows when hasEntrance = true */}
            <AnimatePresence>
                {hasEntrance && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ overflow: 'visible', marginTop: '10px' }}>
                        <label style={labelStyle}>Select Entrance Exam</label>
                        <select style={inputStyle} value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                            <option value="">— Choose exam —</option>
                            {ENTRANCE_EXAMS.map(ex => <option key={ex} value={ex} style={{ background: '#0f172a' }}>{ex}</option>)}
                        </select>

                        {/* Cutoff only shows after exam is selected */}
                        <AnimatePresence>
                            {selectedExam && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ overflow: 'visible' }}>
                                    <label style={labelStyle}>Minimum Cutoff / Eligibility</label>
                                    <select style={inputStyle} value={formData.adm_cutoff} onChange={e => setFormData({ ...formData, adm_cutoff: e.target.value })}>
                                        <option value="">— Select cutoff —</option>
                                        {CUTOFF_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Courses */}
            <h4 style={sectionStyle}>📚 Courses & Fees</h4>
            {courses.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <input style={{ ...inputStyle, flex: 2 }} type="text" placeholder="Course Name (e.g. B.Tech CSE)" value={c.name}
                        onChange={e => { const n = [...courses]; n[i].name = e.target.value; setCourses(n); }} />
                    <input style={{ ...inputStyle, flex: 1 }} type="text" placeholder="Annual Fee" value={c.fee}
                        onChange={e => { const n = [...courses]; n[i].fee = e.target.value; setCourses(n); }} />
                    <button onClick={() => setCourses(courses.filter((_, idx) => idx !== i))}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', padding: '10px', marginTop: '2px' }}>
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <button onClick={() => setCourses([...courses, { name: '', fee: '' }])}
                style={{ background: 'transparent', border: '1px dashed var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '10px', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontFamily: 'inherit', fontSize: '1rem' }}>
                + Add Another Course
            </button>

            {/* Infrastructure */}
            <h4 style={sectionStyle}>🏢 Placements & Infrastructure</h4>
            <label style={labelStyle}>Top Recruiting Companies</label>
            <input style={inputStyle} type="text" placeholder="e.g. TCS, Infosys, Wipro" onChange={e => setFormData({ ...formData, top_companies: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                    <label style={labelStyle}>Highest Package</label>
                    <input style={{ ...inputStyle, marginBottom: 0 }} type="text" placeholder="e.g. 12 LPA" onChange={e => setFormData({ ...formData, highest_package: e.target.value })} />
                </div>
                <div>
                    <label style={labelStyle}>Average Package</label>
                    <input style={{ ...inputStyle, marginBottom: 0 }} type="text" placeholder="e.g. 4.5 LPA" onChange={e => setFormData({ ...formData, average_package: e.target.value })} />
                </div>
            </div>

            <h4 style={sectionStyle}>🏠 Hostel</h4>
            <label style={labelStyle}>Hostel Availability</label>
            <select style={inputStyle} value={formData.hostel_options} onChange={e => setFormData({ ...formData, hostel_options: e.target.value })}>
                <option value="">— Select option —</option>
                {HOSTEL_OPTIONS.map(opt => <option key={opt} style={{ background: '#0f172a' }} value={opt}>{opt}</option>)}
            </select>
            <label style={labelStyle}>Hostel Annual Fees</label>
            <input style={inputStyle} type="text" placeholder="e.g. ₹60,000/year including mess" onChange={e => setFormData({ ...formData, hostel_fees: e.target.value })} />

            <h4 style={sectionStyle}>📞 Contact Details</h4>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="text" placeholder="+91-XXXXXXXXXX" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="info@college.edu.in" onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} type="text" placeholder="City, District, Rajasthan" onChange={e => setFormData({ ...formData, address: e.target.value })} />

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSignup}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-pink))', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 700, marginTop: '24px', fontSize: '1.05rem', fontFamily: 'inherit' }}>
                ✅ Complete Registration
            </motion.button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <a href="#" onClick={() => setView('login')} style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '0.95rem' }}>Back to Login</a>
            </div>
        </div>
    );
}

// ─── Admin Dashboard with Edit Data tab ─────────────────────────
const AdminDashboard = ({ adminAuth, setAdminAuth }) => {
    const [tab, setTab] = useState('edit');
    const [newQ, setNewQ] = useState({ category: 'admissions', question_title: '', patterns: '', answer: '' });
    const [successMsg, setSuccessMsg] = useState('');

    const handleLogout = async () => {
        await fetch('/admin/logout', { method: 'POST' });
        setAdminAuth({ isAuthenticated: false, collegeId: null });
    };

    const handleAddQuestion = async () => {
        try {
            const res = await fetch('/admin/add_question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newQ, patterns: newQ.patterns.split(',').map(p => p.trim())
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setSuccessMsg('Question added successfully!');
                setNewQ({ ...newQ, question_title: '', patterns: '', answer: '' });
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (e) { }
    };

    const inputStyle = {
        width: '100%', padding: '12px 15px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px',
        color: 'white', marginBottom: '15px', outline: 'none', fontFamily: 'inherit', fontSize: '1rem',
        colorScheme: 'dark'
    };

    return (
        <div className="glass-panel" style={{ width: '900px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(59,130,246,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="neon-text" style={{ margin: 0, fontWeight: 600 }}>Admin Dashboard</h3>
                <button onClick={handleLogout} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid var(--accent-pink)', color: 'var(--accent-pink)', padding: '5px 15px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ width: '200px', borderRight: '1px solid rgba(59,130,246,0.1)', padding: '20px', flexShrink: 0 }}>
                    <SidebarTab icon={Edit3} label="Edit Data" active={tab === 'edit'} onClick={() => setTab('edit')} />
                    <SidebarTab icon={Database} label="Add Logic" active={tab === 'manage'} onClick={() => setTab('manage')} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    <AnimatePresence mode="wait">
                        {tab === 'edit' && (
                            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <EditDataTab adminAuth={adminAuth} />
                            </motion.div>
                        )}
                        {tab === 'manage' && (
                            <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Add Custom Bot Rules</h4>
                                {successMsg && <p style={{ color: 'var(--accent-cyan)', marginBottom: '15px' }}>{successMsg}</p>}

                                <select value={newQ.category} onChange={e => setNewQ({ ...newQ, category: e.target.value })} style={inputStyle}>
                                    <option style={{ background: '#0f172a' }} value="admissions">Admissions</option>
                                    <option style={{ background: '#0f172a' }} value="courses">Courses</option>
                                    <option style={{ background: '#0f172a' }} value="placements">Placements</option>
                                    <option style={{ background: '#0f172a' }} value="hostels">Hostels</option>
                                    <option style={{ background: '#0f172a' }} value="contact">Contact</option>
                                </select>

                                <input style={inputStyle} type="text" placeholder="Specific Question (e.g. Can we bring laptops?)" value={newQ.question_title} onChange={e => setNewQ({ ...newQ, question_title: e.target.value })} />
                                <input style={inputStyle} type="text" placeholder="Keywords (comma separated)" value={newQ.patterns} onChange={e => setNewQ({ ...newQ, patterns: e.target.value })} />
                                <textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }} placeholder="Detailed Response" value={newQ.answer} onChange={e => setNewQ({ ...newQ, answer: e.target.value })} />

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddQuestion} style={{ width: '100%', padding: '15px', background: 'var(--accent-cyan)', border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                                    Publish Logic
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Sidebar Tab Component
const SidebarTab = ({ icon: Icon, label, active, onClick }) => (
    <div onClick={onClick} style={{
        padding: '10px 12px', cursor: 'pointer',
        background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
        borderRadius: '8px',
        color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.15s'
    }}>
        <Icon size={18} /> {label}
    </div>
);

// ─── Edit Data Tab ──────────────────────────────────────────────
const EditDataTab = ({ adminAuth }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Editable fields
    const [city, setCity] = useState('');
    const [admDates, setAdmDates] = useState('');
    const [hasEntrance, setHasEntrance] = useState(false);
    const [admExam, setAdmExam] = useState('');
    const [admCutoff, setAdmCutoff] = useState('');
    const [courses, setCourses] = useState([{ name: '', fee: '' }]);
    const [topCompanies, setTopCompanies] = useState('');
    const [highestPackage, setHighestPackage] = useState('');
    const [averagePackage, setAveragePackage] = useState('');
    const [hostelOptions, setHostelOptions] = useState('');
    const [hostelFees, setHostelFees] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [collegeName, setCollegeName] = useState('');

    // Fetch current data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/admin/knowledge_base');
            const data = await res.json();

            setCollegeName(data.name || '');
            setCity(data.city || '');

            // Parse categories to extract structured data
            const cats = data.categories || [];
            for (const cat of cats) {
                const resp = cat.questions?.[0]?.responses?.[0] || '';
                switch (cat.name?.toLowerCase()) {
                    case 'admissions': {
                        // Try to extract dates
                        const datesMatch = resp.match(/dates are \*\*(.*?)\*\*/);
                        if (datesMatch) setAdmDates(datesMatch[1]);
                        // Check if has entrance exam
                        const examMatch = resp.match(/Entrance exam accepted is \*\*(.*?)\*\*/);
                        if (examMatch && examMatch[1] !== 'N/A') {
                            setHasEntrance(true);
                            setAdmExam(examMatch[1]);
                        }
                        const cutoffMatch = resp.match(/cutoff\/requirement of \*\*(.*?)\*\*/);
                        if (cutoffMatch && cutoffMatch[1] !== 'N/A') setAdmCutoff(cutoffMatch[1]);
                        // Check for merit/direct
                        if (resp.includes('merit/direct')) {
                            setHasEntrance(false);
                            setAdmExam('');
                            setAdmCutoff('');
                        }
                        break;
                    }
                    case 'contact': {
                        const phoneMatch = resp.match(/Phone: \*\*(.*?)\*\*/);
                        const emailMatch = resp.match(/Email: \*\*(.*?)\*\*/);
                        const addrMatch = resp.match(/Address: \*\*(.*?)\*\*/);
                        if (phoneMatch) setPhone(phoneMatch[1]);
                        if (emailMatch) setEmail(emailMatch[1]);
                        if (addrMatch) setAddress(addrMatch[1]);
                        break;
                    }
                    case 'placements': {
                        const compMatch = resp.match(/recruiters include \*\*(.*?)\*\*/);
                        const highMatch = resp.match(/highest package is \*\*(.*?)\*\*/);
                        const avgMatch = resp.match(/average package is \*\*(.*?)\*\*/);
                        if (compMatch) setTopCompanies(compMatch[1]);
                        if (highMatch) setHighestPackage(highMatch[1]);
                        if (avgMatch) setAveragePackage(avgMatch[1]);
                        break;
                    }
                    case 'courses & fees':
                    case 'courses': {
                        // Parse bullet courses
                        const courseMatches = [...resp.matchAll(/• \*\*(.*?)\*\*: (.*?)(?:\n|$|\\n)/g)];
                        if (courseMatches.length > 0) {
                            setCourses(courseMatches.map(m => ({ name: m[1], fee: m[2] })));
                        }
                        break;
                    }
                    case 'hostels': {
                        const optMatch = resp.match(/Hostel facilities: \*\*(.*?)\*\*/);
                        const feeMatch = resp.match(/hostel fees are \*\*(.*?)\*\*/);
                        if (optMatch) setHostelOptions(optMatch[1]);
                        if (feeMatch) setHostelFees(feeMatch[1]);
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch data:', e);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg({ text: '', type: '' });

        const payload = {
            city,
            admissions: {
                dates: admDates,
                exam: hasEntrance ? admExam : 'N/A',
                cutoff: hasEntrance ? admCutoff : 'N/A'
            },
            contact: { phone, email, address },
            placements: { top_companies: topCompanies, highest_package: highestPackage, average_package: averagePackage },
            courses: courses.filter(c => c.name || c.fee),
            hostel: { options: hostelOptions, fees: hostelFees }
        };

        try {
            const res = await fetch('/admin/update_college', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                setMsg({ text: '✅ Data saved successfully! Changes are live now.', type: 'success' });
            } else {
                setMsg({ text: `❌ ${data.message}`, type: 'error' });
            }
        } catch (e) {
            setMsg({ text: '❌ Connection error. Try again.', type: 'error' });
        }
        setSaving(false);
        setTimeout(() => setMsg({ text: '', type: '' }), 5000);
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px',
        color: 'white', marginBottom: '10px', outline: 'none', fontFamily: 'inherit', fontSize: '1rem',
        colorScheme: 'dark'
    };
    const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' };
    const sectionStyle = { color: 'var(--accent-cyan)', marginTop: '18px', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-secondary)' }}>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ marginLeft: '10px' }}>Loading college data...</span>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Edit College Data</h4>
                    {collegeName && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Editing: {collegeName}</p>}
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={fetchData}
                    style={{ background: 'transparent', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-cyan)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={14} /> Reload
                </motion.button>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
                {msg.text && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
                            background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            border: msg.type === 'success' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                            color: msg.type === 'success' ? '#22c55e' : '#ef4444',
                            fontSize: '0.9rem'
                        }}
                    >
                        {msg.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* City */}
            <h4 style={sectionStyle}><MapPin size={16} /> City</h4>
            <input style={inputStyle} type="text" placeholder="e.g. Kota, Jodhpur, Jaipur" value={city} onChange={e => setCity(e.target.value)} />

            {/* Admissions */}
            <h4 style={sectionStyle}>📅 Admission Details</h4>
            <label style={labelStyle}>Registration Dates</label>
            <input style={inputStyle} type="text" placeholder="e.g. 1st June – 30th August 2026" value={admDates} onChange={e => setAdmDates(e.target.value)} />

            <label style={labelStyle}>Is there an Entrance Exam?</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                {['Yes', 'No'].map(opt => (
                    <motion.button
                        key={opt}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setHasEntrance(opt === 'Yes');
                            if (opt === 'No') {
                                setAdmExam('');
                                setAdmCutoff('');
                            }
                        }}
                        style={{
                            flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600,
                            background: (opt === 'Yes' ? hasEntrance : !hasEntrance) ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.03)',
                            border: (opt === 'Yes' ? hasEntrance : !hasEntrance) ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                            color: (opt === 'Yes' ? hasEntrance : !hasEntrance) ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        }}
                    >{opt}</motion.button>
                ))}
            </div>

            <AnimatePresence>
                {hasEntrance && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ overflow: 'visible', marginTop: '10px' }}>
                        <label style={labelStyle}>Entrance Exam</label>
                        <select style={inputStyle} value={admExam} onChange={e => setAdmExam(e.target.value)}>
                            <option value="">— Choose exam —</option>
                            {ENTRANCE_EXAMS.map(ex => <option key={ex} value={ex} style={{ background: '#0f172a' }}>{ex}</option>)}
                        </select>

                        <AnimatePresence>
                            {admExam && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ overflow: 'visible' }}>
                                    <label style={labelStyle}>Minimum Cutoff</label>
                                    <select style={inputStyle} value={admCutoff} onChange={e => setAdmCutoff(e.target.value)}>
                                        <option value="">— Select cutoff —</option>
                                        {CUTOFF_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Courses & Fees */}
            <h4 style={sectionStyle}>📚 Courses & Fees</h4>
            {courses.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <input style={{ ...inputStyle, flex: 2 }} type="text" placeholder="Course Name" value={c.name}
                        onChange={e => { const n = [...courses]; n[i].name = e.target.value; setCourses(n); }} />
                    <input style={{ ...inputStyle, flex: 1 }} type="text" placeholder="Fee" value={c.fee}
                        onChange={e => { const n = [...courses]; n[i].fee = e.target.value; setCourses(n); }} />
                    <button onClick={() => setCourses(courses.filter((_, idx) => idx !== i))}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', padding: '10px' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            <button onClick={() => setCourses([...courses, { name: '', fee: '' }])}
                style={{ background: 'transparent', border: '1px dashed var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontFamily: 'inherit', fontSize: '0.9rem' }}>
                + Add Course
            </button>

            {/* Placements */}
            <h4 style={sectionStyle}>💼 Placements</h4>
            <label style={labelStyle}>Top Recruiting Companies</label>
            <input style={inputStyle} type="text" placeholder="e.g. TCS, Infosys" value={topCompanies} onChange={e => setTopCompanies(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                    <label style={labelStyle}>Highest Package</label>
                    <input style={{ ...inputStyle, marginBottom: 0 }} type="text" placeholder="e.g. 12 LPA" value={highestPackage} onChange={e => setHighestPackage(e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Average Package</label>
                    <input style={{ ...inputStyle, marginBottom: 0 }} type="text" placeholder="e.g. 4.5 LPA" value={averagePackage} onChange={e => setAveragePackage(e.target.value)} />
                </div>
            </div>

            {/* Hostels */}
            <h4 style={sectionStyle}>🏠 Hostels</h4>
            <label style={labelStyle}>Hostel Availability</label>
            <select style={inputStyle} value={hostelOptions} onChange={e => setHostelOptions(e.target.value)}>
                <option value="">— Select —</option>
                {HOSTEL_OPTIONS.map(opt => <option key={opt} value={opt} style={{ background: '#0f172a' }}>{opt}</option>)}
            </select>
            <label style={labelStyle}>Hostel Fees</label>
            <input style={inputStyle} type="text" placeholder="e.g. ₹60,000/year" value={hostelFees} onChange={e => setHostelFees(e.target.value)} />

            {/* Contact */}
            <h4 style={sectionStyle}>📞 Contact</h4>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="text" placeholder="+91-XXXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="info@college.edu.in" value={email} onChange={e => setEmail(e.target.value)} />
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} type="text" placeholder="Full address" value={address} onChange={e => setAddress(e.target.value)} />

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                    width: '100%', padding: '15px', marginTop: '24px',
                    background: saving ? 'rgba(59,130,246,0.3)' : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-pink))',
                    border: 'none', borderRadius: '8px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '1.05rem', fontFamily: 'inherit',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
            >
                {saving ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save All Changes</>}
            </motion.button>
        </div>
    );
};

export default AdminPanel;
