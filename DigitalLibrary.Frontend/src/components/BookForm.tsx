import React, { useState, useEffect } from 'react';
import { Book, CreateBookRequest, UpdateBookRequest } from '../types';

interface BookFormProps {
  book?: Book;
  onSubmit: (bookData: CreateBookRequest | UpdateBookRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    coverImageUrl: '',
    rating: 1,
    review: '',
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        year: book.year,
        coverImageUrl: book.coverImageUrl || '',
        rating: book.rating,
        review: book.review || '',
      });
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'rating' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '20px 20px 0 0',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '24px' }}>
              {book ? '✏️' : '📖'}
            </span>
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0'
          }}>
            {book ? `Editar Libro #${book.id}` : 'Agregar Libro'}
          </h3>
          {book && (
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              margin: '8px 0 0 0',
              fontWeight: '400'
            }}>
              ID: {book.id} • {book.title}
            </p>
          )}
        </div>

        {/* Form */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Título *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
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
                placeholder="Título del libro"
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
                Autor *
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
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
                placeholder="Nombre del autor"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Año *
                </label>
                <input
                  type="number"
                  name="year"
                  min="1000"
                  max="3000"
                  required
                  value={formData.year}
                  onChange={handleChange}
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
                  Calificación
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value={1}>1 ⭐</option>
                  <option value={2}>2 ⭐⭐</option>
                  <option value={3}>3 ⭐⭐⭐</option>
                  <option value={4}>4 ⭐⭐⭐⭐</option>
                  <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                </select>
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
                URL de Portada (opcional)
              </label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
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
                placeholder="https://ejemplo.com/imagen.jpg"
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
                Reseña (opcional)
              </label>
              <textarea
                name="review"
                rows={3}
                value={formData.review}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Escribe tu reseña aquí..."
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = 'none';
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>{book ? '💾' : '➕'}</span>
                    {book ? 'Actualizar' : 'Agregar'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#e5e7eb';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#f3f4f6';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <span>❌</span>
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookForm;
