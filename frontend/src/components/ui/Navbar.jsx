import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Tag, 
  Bookmark, 
  List, 
  ShieldCheck, 
  LogOut, 
  MapPin, 
  MessageCircle, 
  Settings, 
  Camera, 
  X, 
  Loader2,
  Search,
  Zap,
  Menu,
  Shirt,
  Gavel,
  RotateCcw,
  Home,
  HelpCircle,
  Scale,
  Compass,
  Layers,
  DoorOpen
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../config';

const FallbackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='50' fill='%23e2e8f0'/><circle cx='50' cy='38' r='18' fill='%2394a3b8'/><path d='M20 80 C 20 62, 35 55, 50 55 C 65 55, 80 62, 80 80' stroke='%2394a3b8' stroke-width='6' stroke-linecap='round'/></svg>";

export default function Navbar() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings form states
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    college: '',
    hostel: '',
    room: '',
    wing: '',
    floor: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Sync settings form with user object when opening modal
  const openSettings = () => {
    setSettingsForm({
      name: user?.name || '',
      college: user?.college || 'Chandigarh University',
      hostel: user?.hostel || '',
      room: user?.room || '',
      wing: user?.wing || '',
      floor: user?.floor || ''
    });
    setProfilePreview(user?.profileImage || '');
    setProfileImageFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setIsSettingsOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB');
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!settingsForm.name.trim() || !settingsForm.college.trim() || !settingsForm.hostel.trim()) {
      setErrorMsg('Name, University, and Hostel Name are required');
      return;
    }

    setSaveLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('name', settingsForm.name.trim());
      formData.append('college', settingsForm.college.trim());
      formData.append('hostel', settingsForm.hostel.trim());
      formData.append('room', settingsForm.room.trim());
      formData.append('wing', settingsForm.wing?.trim() || '');
      formData.append('floor', settingsForm.floor?.trim() || '');
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update in global Context
      updateProfile({
        name: data.name,
        college: data.college,
        hostel: data.hostel,
        room: data.room,
        wing: data.wing,
        floor: data.floor,
        profileImage: data.profileImage
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsSettingsOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Unread Messages Count Sync & Sockets
  useEffect(() => {
    if (!user?.token) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/chats/unread`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        setUnreadCount(data.unread || 0);
      } catch (e) { /* quiet fail */ }
    };
    fetchUnread();
    
    const interval = setInterval(fetchUnread, 12000);

    const sock = io(BACKEND_URL);
    sock.emit('setup', user);
    sock.on('messages read', () => fetchUnread());
    sock.on('message received', () => fetchUnread());

    return () => {
      clearInterval(interval);
      sock.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', path: '/dashboard', icon: <Home className="w-4.5 h-4.5" /> },
    { label: 'Marketplace', path: '/marketplace', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
    { label: 'Lost & Found', path: '/lost-found', icon: <Search className="w-4.5 h-4.5" /> },
    { label: 'Temporary Rentals', path: '/rentals', icon: <RotateCcw className="w-4.5 h-4.5" /> },
    { label: 'Auction Terminal', path: '/auctions', icon: <Gavel className="w-4.5 h-4.5" /> },
    { label: 'Rent Your Vibe', path: '/fashion', icon: <Shirt className="w-4.5 h-4.5" /> },
    { label: 'My Listings', path: '/my-listings', icon: <List className="w-4.5 h-4.5" /> },
    { label: 'Saved Items', path: '/saved', icon: <Bookmark className="w-4.5 h-4.5" /> },
    { label: 'About Us', path: '/about', icon: <Compass className="w-4.5 h-4.5" /> },
    { label: 'Help Center', path: '/help', icon: <HelpCircle className="w-4.5 h-4.5" /> },
    { label: 'Privacy Policy', path: '/privacy-policy', icon: <ShieldCheck className="w-4.5 h-4.5" /> },
    { label: 'Terms of Service', path: '/terms', icon: <Scale className="w-4.5 h-4.5" /> }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-900/60 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition">
          <span className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            HostelX
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Chat / Messages Button */}
          <button
            onClick={() => navigate('/chat')}
            className={`relative p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer text-zinc-600 dark:text-zinc-400 ${
              location.pathname === '/chat' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : ''
            }`}
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-bounce leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Menu Drawer Hamburger Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer text-zinc-600 dark:text-zinc-400"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-out mobile-first hamburger menu drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-md"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-80 h-full bg-white/95 dark:bg-[#07090e]/95 border-l border-zinc-200/60 dark:border-zinc-900/60 shadow-2xl p-6 flex flex-col justify-between backdrop-blur-xl z-10 overflow-y-auto font-sans"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Navigation Menu
                  </span>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition active:scale-95 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Card Summary */}
                {user && (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900/60 rounded-2xl mb-6 flex items-center gap-3">
                    <img
                      src={user.profileImage || FallbackAvatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white truncate leading-tight">{user.name}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold truncate mt-0.5">{user.college}</p>
                      <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black tracking-wider uppercase mt-0.5">{user.hostel}</p>
                    </div>
                  </div>
                )}

                {/* Navigation Items List */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setIsDrawerOpen(false);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition text-left cursor-pointer ${
                          isActive 
                            ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/5 dark:text-blue-400' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="space-y-2 pt-6 border-t border-zinc-200/60 dark:border-zinc-900/60 mt-6">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    openSettings();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-900/50 text-xs font-black text-zinc-900 dark:text-white transition text-left cursor-pointer"
                >
                  <Settings className="w-4.5 h-4.5 text-zinc-400" />
                  Profile Settings
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-xs font-black text-red-600 dark:text-red-400 transition text-left cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Logout Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Profile Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saveLoading && setIsSettingsOpen(false)}
              className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-white dark:bg-[#07090e] border border-zinc-200/60 dark:border-zinc-900/60 shadow-2xl rounded-3xl p-6 backdrop-blur-lg overflow-hidden z-10 font-sans"
            >
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                disabled={saveLoading}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Profile Settings</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">
                  Keep your hostel and contact information up-to-date
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                
                {/* DP upload section */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img
                      src={profilePreview || FallbackAvatar}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Change Profile Picture
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-extrabold text-zinc-950 dark:text-white"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      University Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.college}
                      onChange={(e) => setSettingsForm({ ...settingsForm, college: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-extrabold text-zinc-950 dark:text-white"
                      placeholder="e.g. Chandigarh University"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Hostel Block
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.hostel}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hostel: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-extrabold text-zinc-950 dark:text-white"
                      placeholder="e.g. Zakir B"
                    />
                  </div>

                  {/* Optional grid fields */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 flex items-center gap-0.5">
                        <Compass className="w-3 h-3" /> Wing
                      </label>
                      <input
                        type="text"
                        value={settingsForm.wing}
                        onChange={(e) => setSettingsForm({ ...settingsForm, wing: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-extrabold text-zinc-950 dark:text-white"
                        placeholder="A Wing"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 flex items-center gap-0.5">
                        <Layers className="w-3 h-3" /> Floor
                      </label>
                      <input
                        type="text"
                        value={settingsForm.floor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, floor: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-extrabold text-zinc-950 dark:text-white"
                        placeholder="3rd Floor"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 flex items-center gap-0.5">
                        <DoorOpen className="w-3 h-3" /> Room
                      </label>
                      <input
                        type="text"
                        value={settingsForm.room}
                        onChange={(e) => setSettingsForm({ ...settingsForm, room: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xs font-extrabold text-zinc-950 dark:text-white"
                        placeholder="308"
                      />
                    </div>
                  </div>
                </div>

                {/* Info banners */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-[10px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-center font-bold"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center font-bold"
                  >
                    {successMsg}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    disabled={saveLoading}
                    className="flex-1 px-4 py-2.5 border border-zinc-200/60 dark:border-zinc-900/60 rounded-xl text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

