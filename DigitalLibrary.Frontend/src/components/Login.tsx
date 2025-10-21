import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';

interface LoginProps {
  onToggleMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  // Usar useRef para preservar el estado del formulario
  const formDataRef = useRef<LoginRequest>(formData);
  const errorRef = useRef<string>('');
  
  // Sincronizar el ref con el estado
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  
  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formDataRef.current,
      [e.target.name]: e.target.value,
    };
    setFormData(newFormData);
    // NO limpiar el error automáticamente
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formDataRef.current);
      // Solo limpiar el error cuando el login sea exitoso
      setError('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      // NO usar setTimeout - mantener el error hasta que sea exitoso
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #A060C0 0%, #B070D0 25%, #E05090 75%, #F060A0 100%)',
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
        padding: '48px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #6A1B9A 0%, #8A2BE2 50%, #C060D0 100%)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(106, 27, 154, 0.3)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #E1BEE7 0%, #81C784 50%, #FFB3BA 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-5deg)'
            }}>
              <span style={{ fontSize: '24px' }}>📚</span>
            </div>
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Bienvenido de vuelta
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            fontWeight: '400'
          }}>
            Accede a tu biblioteca digital
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '10px',
              letterSpacing: '-0.2px'
            }}>
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
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
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
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
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
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

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.3s ease-in-out',
              animation: 'shake 0.5s ease-in-out'
            }}>
              <span style={{ color: '#dc2626', fontSize: '18px' }}>⚠️</span>
              <p style={{ color: '#dc2626', fontSize: '15px', margin: '0', fontWeight: '500' }}>{error}</p>
            </div>
          )}

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
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(138, 43, 226, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.3)';
              }
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
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onToggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#8A2BE2',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                padding: '8px 0'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = '#6A1B9A';
                (e.target as HTMLButtonElement).style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = '#8A2BE2';
                (e.target as HTMLButtonElement).style.textDecoration = 'none';
              }}
            >
              ¿No tienes cuenta? <span style={{ fontWeight: '600' }}>Regístrate aquí</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
