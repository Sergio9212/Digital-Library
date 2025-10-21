import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book, CreateBookRequest, UpdateBookRequest } from '../types';
import { bookService } from '../services/api';
import BookCard from './BookCard';
import BookForm from './BookForm';
import AccountSettings from './AccountSettings';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const booksData = await bookService.getBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setShowForm(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleSubmitBook = async (bookData: CreateBookRequest | UpdateBookRequest) => {
    try {
      setIsSubmitting(true);
      if (editingBook) {
        await bookService.updateBook(editingBook.id, bookData as UpdateBookRequest);
      } else {
        await bookService.createBook(bookData as CreateBookRequest);
      }
      setShowForm(false);
      setEditingBook(null);
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    console.log('handleDeleteBook called with id:', id);
    const book = books.find(b => b.id === id);
    if (book) {
      console.log('Book found:', book.title);
      setBookToDelete(book);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    
    try {
      setDeletingId(bookToDelete.id);
      await bookService.deleteBook(bookToDelete.id);
      loadBooks();
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBook(null);
  };

  // Si se está mostrando la configuración de cuenta, renderizar solo ese componente
  if (showAccountSettings) {
    return (
      <div>
        <AccountSettings />
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowAccountSettings(false)}
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: '#1f2937',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'white';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.9)';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span>←</span>
            Volver a Biblioteca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #A060C0 0%, #B070D0 25%, #E05090 75%, #F060A0 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 0'
          }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                letterSpacing: '-0.5px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <span style={{ fontSize: '24px' }}>📚</span>
                </div>
                Mi Biblioteca Digital
                {books.length > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginLeft: '16px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    {books.length} libro{books.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.95)',
                margin: '0 0 6px 0',
                fontSize: '18px',
                fontWeight: '500'
              }}>
                Bienvenido, {user?.nombre} {user?.apellido}
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 4px 0',
                fontSize: '15px',
                fontWeight: '400'
              }}>{user?.email}</p>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
                fontSize: '13px',
                fontWeight: '400',
                background: 'rgba(255,255,255,0.1)',
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                ID: {user?.id}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAccountSettings(true)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <span>👤</span>
                Mi Cuenta
              </button>
              <button
                onClick={logout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <span>🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>📖</span>
            Mis Libros
          </h2>
          <button
            onClick={handleAddBook}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <span>➕</span>
            Agregar Libro
          </button>
        </div>

        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #667eea',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0'
            }}>Cargando libros...</p>
          </div>
        ) : books.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '24px'
            }}>📚</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>No tienes libros aún</h3>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0 0 32px 0',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>Comienza agregando tu primer libro a tu biblioteca digital.</p>
            <button
              onClick={handleAddBook}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              <span>📖</span>
              Agregar Mi Primer Libro
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
                isDeleting={deletingId === book.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Book Form Modal */}
      {showForm && (
        <BookForm
          book={editingBook || undefined}
          onSubmit={handleSubmitBook}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
            }}>
              <span style={{ fontSize: '28px' }}>🗑️</span>
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 12px 0',
              letterSpacing: '-0.3px'
            }}>
              ¿Eliminar libro?
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              ¿Estás seguro de que quieres eliminar <strong>"{bookToDelete.title}"</strong> de tu biblioteca? Esta acción no se puede deshacer.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBookToDelete(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  letterSpacing: '-0.2px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#e5e7eb';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#f3f4f6';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={confirmDeleteBook}
                disabled={deletingId === bookToDelete.id}
                style={{
                  padding: '12px 24px',
                  background: deletingId === bookToDelete.id ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: deletingId === bookToDelete.id ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  letterSpacing: '-0.2px',
                  boxShadow: deletingId === bookToDelete.id ? 'none' : '0 4px 15px rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (deletingId !== bookToDelete.id) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletingId !== bookToDelete.id) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                  }
                }}
              >
                {deletingId === bookToDelete.id ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Eliminando...
                  </>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
