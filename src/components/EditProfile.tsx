import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Language } from '../types';
import { t } from '../i18n';

interface EditProfileProps {
  user: UserProfile;
  language: Language;
  onSave: (updatedUser: UserProfile) => void;
  onClose: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, language, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ ...user, name, avatar });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">{t('editProfile', language)}</h2>
          <button onClick={onClose} className="text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <img 
                src={avatar} 
                alt="Avatar" 
                className="size-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="text-xs text-slate-400">{t('uploadAvatar', language)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('name', language)}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder={t('name', language)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('avatarUrl', language)}</label>
            <input 
              type="text" 
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {t('cancel', language)}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-primary shadow-lg shadow-primary/20"
          >
            {t('save', language)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
