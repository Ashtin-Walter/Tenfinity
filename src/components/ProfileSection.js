import React from 'react';
import PropTypes from 'prop-types';

const ProfileSection = ({ user, onSignIn, onSignOut }) => {
  return (
    <div className="profile-section">
      <h3 className="panel-group-title">Profile</h3>
      {user ? (
        <div className="profile-info">
          <img src={user.photoURL || '/default-avatar.png'} alt="Avatar" className="profile-avatar" />
          <div className="profile-details">
            <div className="profile-name">{user.displayName || user.email}</div>
            <div className="profile-email">{user.email}</div>
            <button className="menu-btn signout-btn" onClick={onSignOut}>Sign Out</button>
          </div>
        </div>
      ) : (
        <button className="menu-btn signin-btn" onClick={onSignIn}>
          <span className="btn-icon" aria-hidden="true">🔑</span> Sign In with Google
        </button>
      )}
    </div>
  );
};

ProfileSection.propTypes = {
  user: PropTypes.object,
  onSignIn: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
};

export default React.memo(ProfileSection);
