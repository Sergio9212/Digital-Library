import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { accountService } from '../services/api';
import { UpdateProfileRequest, ChangePasswordRequest, DeleteAccountRequest } from '../types';

const AccountSettings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para el perfil
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  });

  // Estados para eliminar cuenta
  const [deleteData, setDeleteData] = useState<DeleteAccountRequest>({
    password: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      });
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedUser = await accountService.updateProfile(profileData);
      // Actualizar el contexto de autenticación con los nuevos datos
      updateUser(updatedUser);
      showMessage('success', 'Perfil actualizado exitosamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      showMessage('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await accountService.changePassword(passwordData);
      showMessage('success', 'Contraseña actualizada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      showMessage('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await accountService.deleteAccount(deleteData);
      showMessage('success', 'Cuenta eliminada exitosamente');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar cuenta';
      showMessage('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #A060C0 0%, #B070D0 25%, #E05090 75%, #F060A0 100%)',
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6A1B9A 0%, #8A2BE2 50%, #C060D0 100%)',
          padding: '40px',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: '0.3'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-30%',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: '0.2'
          }}></div>
          
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{ fontSize: '32px' }}>👤</span>
          </div>
          
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 1
          }}>
            Mi Cuenta
          </h1>
          <p style={{
            fontSize: '18px',
            margin: '0',
            opacity: '0.9',
            fontWeight: '400',
            position: 'relative',
            zIndex: 1
          }}>
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fafafa'
        }}>
          {[
            { id: 'profile', label: 'Perfil', icon: '👤' },
            { id: 'password', label: 'Contraseña', icon: '🔒' },
            { id: 'delete', label: 'Eliminar Cuenta', icon: '🗑️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '20px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#8A2BE2' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '15px',
                borderRadius: activeTab === tab.id ? '12px 12px 0 0' : '0',
                boxShadow: activeTab === tab.id ? '0 -2px 8px rgba(138, 43, 226, 0.1)' : 'none',
                letterSpacing: '-0.2px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f0f0f0';
                  (e.target as HTMLButtonElement).style.color = '#8A2BE2';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLButtonElement).style.color = '#6b7280';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '40px' }}>
          {/* Message */}
          {message && (
            <div style={{
              backgroundColor: message.type === 'success' ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${message.type === 'success' ? '#bae6fd' : '#fecaca'}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>
                {message.type === 'success' ? '✅' : '⚠️'}
              </span>
              <p style={{
                color: message.type === 'success' ? '#0369a1' : '#dc2626',
                fontSize: '14px',
                margin: '0',
                fontWeight: '500'
              }}>
                {message.text}
              </p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
                Información Personal
              </h2>
              
              {/* ID del Usuario */}
              <div style={{
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #d1d5db',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #A060C0 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    #
                  </div>
                  <div>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ID de Usuario
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937',
                      fontFamily: 'monospace'
                    }}>
                      {user?.id}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '10px',
                    letterSpacing: '-0.2px'
                  }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profileData.nombre}
                    onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#fafafa',
                      fontWeight: '400'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8A2BE2';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 43, 226, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '10px',
                    letterSpacing: '-0.2px'
                  }}>
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={profileData.apellido}
                    onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#fafafa',
                      fontWeight: '400'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8A2BE2';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(138, 43, 226, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #8A2BE2 0%, #C060D0 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)',
                  letterSpacing: '-0.2px'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Perfil'
                )}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
                Cambiar Contraseña
              </h2>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #8A2BE2 0%, #C060D0 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)',
                  letterSpacing: '-0.2px'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </form>
          )}

          {/* Delete Account Tab */}
          {activeTab === 'delete' && (
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#dc2626', fontSize: '16px' }}>⚠️</span>
                  <h3 style={{ color: '#dc2626', fontSize: '16px', fontWeight: '600', margin: '0' }}>
                    Eliminar Cuenta
                  </h3>
                </div>
                <p style={{ color: '#dc2626', fontSize: '14px', margin: '0' }}>
                  Esta acción es irreversible. Se eliminarán todos tus datos, incluyendo tu biblioteca de libros.
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Confirma tu contraseña para eliminar la cuenta
                </label>
                <input
                  type="password"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData({ password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isLoading ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Cuenta Permanentemente'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;
