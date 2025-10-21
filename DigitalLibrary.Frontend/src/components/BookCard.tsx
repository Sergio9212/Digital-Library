import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete, isDeleting }) => {
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      padding: '24px',
      transition: 'all 0.3s ease',
      border: '1px solid #f1f5f9',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    }}>
      {/* Header with gradient accent */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        height: '4px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
      }}></div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <div style={{ flex: 1, marginRight: '16px' }}>
          {/* ID Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ marginRight: '4px' }}>📚</span>
            ID: {book.id}
          </div>
          
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0',
            lineHeight: '1.3'
          }}>{book.title}</h3>
          <p style={{
            color: '#6b7280',
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: '500'
          }}>por {book.author}</p>
          <p style={{
            color: '#9ca3af',
            margin: '0 0 12px 0',
            fontSize: '12px'
          }}>Año: {book.year}</p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              color: '#fbbf24',
              fontSize: '16px',
              marginRight: '8px'
            }}>{renderStars(book.rating)}</span>
            <span style={{
              color: '#6b7280',
              fontSize: '12px',
              fontWeight: '500'
            }}>({book.rating}/5)</span>
          </div>
        </div>
        <div style={{
          width: '80px',
          height: '112px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px'
        }}>
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`Portada de ${book.title}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Si la imagen falla, mostrar el ícono por defecto
                const container = e.currentTarget.parentElement;
                if (container) {
                  container.innerHTML = '📚';
                  container.style.fontSize = '24px';
                  container.style.color = 'white';
                  container.style.display = 'flex';
                  container.style.alignItems = 'center';
                  container.style.justifyContent = 'center';
                }
              }}
            />
          ) : (
            '📚'
          )}
        </div>
      </div>
      
      {book.review && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{
            color: '#374151',
            fontSize: '13px',
            fontStyle: 'italic',
            margin: '0',
            lineHeight: '1.4'
          }}>"{book.review}"</p>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => onEdit(book)}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.target as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <span>✏️</span>
          Editar
        </button>
        <button
          onClick={() => onDelete(book.id)}
          disabled={isDeleting}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: isDeleting ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }
          }}
        >
          {isDeleting ? (
            <>
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Eliminando...
            </>
          ) : (
            <>
              <span>🗑️</span>
              Eliminar
            </>
          )}
        </button>
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

export default BookCard;
