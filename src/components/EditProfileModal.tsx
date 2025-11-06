'use client';

import { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import AnimatedInput from './AnimatedInput';
import AnimatedButton from './AnimatedButton';
import { formatPhoneNumber } from '../lib/formatPhone';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    phone?: string;
  };
  onSave: (data: { username: string; phone: string; password?: string }) => Promise<void>;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave
}: EditProfileModalProps) {
  const [username, setUsername] = useState(user.username);
  const [phone, setPhone] = useState(user.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(user.username);
      setPhone(user.phone || '');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');

      // Backdrop animation
      if (backdropRef.current) {
        animate(
          backdropRef.current,
          {
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutExpo',
          }
        );
      }

      // Modal animation
      if (modalRef.current) {
        animate(
          modalRef.current,
          {
            opacity: [0, 1],
            scale: [0.9, 1],
            translateY: [-20, 0],
            duration: 400,
            easing: 'easeOutElastic(1, .6)',
          }
        );
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (phone && !phone.match(/^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/)) {
      setError('Phone number must be in format: +998-XX-XXX-XX-XX');
      return;
    }
    if (password && password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        username: username.trim(),
        phone: phone.trim(),
        ...(password && { password }),
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Oddiy fade out - chiqib kelish animation'siz
    if (backdropRef.current) {
      animate(
        backdropRef.current,
        {
          opacity: [1, 0],
          duration: 150,
          easing: 'easeOutExpo',
          onComplete: () => {
            onClose();
          }
        }
      );
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ opacity: 0 }}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Edit Profile
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              required
              minLength={3}
              placeholder="Enter username"
              disabled={loading}
              error={error && error.includes('username') ? error : undefined}
            />

            <AnimatedInput
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setPhone(formatted);
                setError('');
              }}
              onBlur={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setPhone(formatted);
              }}
              placeholder="+998-93-078-80-47"
              disabled={loading}
              maxLength={18}
              error={error && error.includes('phone') ? error : undefined}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password (optional)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Leave empty to keep current password
              </p>
              <AnimatedInput
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                minLength={4}
                placeholder="Enter new password"
                disabled={loading}
                error={error && error.includes('password') ? error : undefined}
              />
            </div>

            {password && (
              <AnimatedInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                minLength={4}
                placeholder="Confirm new password"
                disabled={loading}
                error={error && error.includes('match') ? error : undefined}
              />
            )}

            <div className="flex gap-3 mt-6">
              <AnimatedButton
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </AnimatedButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

