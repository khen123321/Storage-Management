import React, { useState } from 'react'; // ✅ FIXED: Removed 'useEffect'
import './Profilescreen.css'; // ✅ FIXED: Changed 'ProfileScreen.css' to 'Profilescreen.css' to match file

const Profilescreen = () => {
  // Load saved data from LocalStorage OR use default Resume data
  const loadSavedData = () => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: "Khen Joshua G. Verson",
      role: "Administrator",
      email: "khenjoshua.verson@l.ustp.edu.ph",
      phone: "0968 651 5705",
      location: "Barra, Opol, Misamis Oriental",
      bio: "BS Information Technology student at USTP. Managing the P-Lament recycling system and storage operations."
    };
  };

  const [profile, setProfile] = useState(loadSavedData());
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile({ ...tempProfile, [name]: value });
  };

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('userProfile', JSON.stringify(tempProfile));
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="cover-photo"></div>
        <div className="profile-avatar-container">
          <div className="avatar-circle">
            <span className="avatar-initials">{profile.name.charAt(0)}</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-identity">
          <h1>{profile.name}</h1>
          <span className="role-badge">{profile.role}</span>
          <p className="profile-location">📍 {profile.location}</p>
        </div>

        <div className="details-card">
          <div className="card-header-row">
            <h2>Personal Information</h2>
            {!isEditing && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✎ Edit Profile
              </button>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              {isEditing ? (
                <input type="text" name="name" value={tempProfile.name} onChange={handleChange} />
              ) : (
                <p className="display-text">{profile.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Role / Title</label>
              {isEditing ? (
                <input type="text" name="role" value={tempProfile.role} onChange={handleChange} />
              ) : (
                <p className="display-text">{profile.role}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              {isEditing ? (
                <input type="email" name="email" value={tempProfile.email} onChange={handleChange} />
              ) : (
                <p className="display-text">{profile.email}</p>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              {isEditing ? (
                <input type="text" name="phone" value={tempProfile.phone} onChange={handleChange} />
              ) : (
                <p className="display-text">{profile.phone}</p>
              )}
            </div>

            <div className="form-group full-width">
              <label>Location</label>
              {isEditing ? (
                <input type="text" name="location" value={tempProfile.location} onChange={handleChange} />
              ) : (
                <p className="display-text">{profile.location}</p>
              )}
            </div>

            <div className="form-group full-width">
              <label>About Me</label>
              {isEditing ? (
                <textarea name="bio" rows="4" value={tempProfile.bio} onChange={handleChange} />
              ) : (
                <p className="display-text bio-text">{profile.bio}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="action-buttons">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profilescreen;