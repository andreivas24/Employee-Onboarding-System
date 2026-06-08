import { useEffect, useState } from 'react';
import { profileApi } from '../api/profileApi';
import type { AuthUser } from '../types/auth';
import type { UserProfile } from '../types/profile';
import '../styles/ProfilePage.css';

type Props = {
  user: AuthUser;
  onProfileUpdated: (profile: UserProfile) => void;
};

function ProfilePage({ user, onProfileUpdated }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const getImageUrl = (url?: string | null) => {
    if (!url) {
      return '';
    }

    return url.startsWith('http') ? url : `http://localhost:8080${url}`;
  };

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile(user.email);
      setProfile(data);
      setFullName(data.fullName);
    } catch {
      setMessage('Failed to load profile.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) {
      return;
    }

    try {
      let updatedProfile = profile;

      if (fullName !== profile.fullName) {
        updatedProfile = await profileApi.updateProfile(user.email, {
          fullName,
        });
      }

      if (profileImageFile) {
        updatedProfile = await profileApi.updateAvatar(user.email, profileImageFile);
      }

      setProfile(updatedProfile);
      onProfileUpdated(updatedProfile);
      setProfileImageFile(null);

      setMessage('Profile updated successfully.');
      setMessageType('success');
    } catch {
      setMessage('Failed to update profile.');
      setMessageType('error');
    }
  };

  if (!profile) {
    return <p className="profile-loading">Loading profile...</p>;
  }

  return (
    <section className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {profile.profileImageUrl ? (
              <img src={getImageUrl(profile.profileImageUrl)} alt={profile.fullName} />
            ) : (
              profile.fullName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <h2>{profile.fullName}</h2>
            <div className="profile-meta">
                <p>{profile.email}</p>

                <span className={`role-badge role-${profile.role.toLowerCase()}`}>
                    {profile.role}
                </span>
            </div>
          </div>
        </div>

        {message && (
          <p className={`profile-message profile-message-${messageType}`}>
            {message}
          </p>
        )}

        <div className="profile-form">
            <div className="profile-form-row">
                <div className="profile-form-group">
                    <label>Full Name</label>
                    <input
                        className="profile-name-input"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                    />
                </div>

                <div className="profile-form-group">
                    <label>Profile Image</label>

                    <label className="custom-file-upload">
                        Choose Image
                        <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            setProfileImageFile(event.target.files?.[0] ?? null)
                        }
                        />
                    </label>

                    {profileImageFile && (
                        <p className="selected-file-name">
                        Selected file: {profileImageFile.name}
                        </p>
                    )}
                </div>
            </div>

                <button className="profile-primary-button" onClick={handleSaveProfile}>
                    Save Changes
                </button>
            </div>
        </div>
    </section>
  );
}

export default ProfilePage;