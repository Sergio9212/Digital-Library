import React, { useEffect, useMemo, useState } from 'react';
import { CreateBookRequest, GraphQLBook, UpdateBookRequest } from '../types';
import { graphqlBookService } from '../services/api';

const initialFormState: CreateBookRequest = {
  title: '',
  author: '',
  year: new Date().getFullYear(),
  rating: 3,
  review: '',
  coverImageUrl: '',
};

const GraphQLSandbox: React.FC = () => {
  const [books, setBooks] = useState<GraphQLBook[]>([]);
  const [formData, setFormData] = useState<CreateBookRequest>(initialFormState);
  const [selectedBook, setSelectedBook] = useState<GraphQLBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBooks = useMemo(() => books.length > 0, [books]);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const data = await graphqlBookService.getBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los libros de GraphQL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' || name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedBook) {
        const payload: UpdateBookRequest = {
          ...formData,
        };
        await graphqlBookService.updateBook(selectedBook.id, payload);
      } else {
        await graphqlBookService.createBook(formData);
      }

      setFormData(initialFormState);
      setSelectedBook(null);
      loadBooks();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el libro mediante GraphQL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book: GraphQLBook) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      year: book.year,
      rating: book.rating,
      review: book.review ?? '',
      coverImageUrl: book.coverImageUrl ?? '',
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await graphqlBookService.deleteBook(id);
      loadBooks();
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar el libro.');
    }
  };

  const handleCancel = () => {
    setSelectedBook(null);
    setFormData(initialFormState);
  };

  return (
    <section
      style={{
        marginTop: '48px',
        padding: '32px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>Panel GraphQL + MongoDB</h2>
          <p style={{ margin: '8px 0 0', color: '#475569', maxWidth: '640px' }}>
            Este bloque consume el endpoint <strong>/graphql</strong> directamente con Axios, persistiendo la
            información en MongoDB. Es un entorno seguro para experimentar sin afectar los datos del panel principal.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#2563eb', fontWeight: 600 }}>Datos en MongoDB</p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            {hasBooks ? `${books.length} libro(s) sincronizado(s)` : 'Sin registros aún'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginTop: '32px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            background: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3 style={{ margin: 0, color: '#0f172a' }}>{selectedBook ? 'Editar Libro' : 'Agregar Libro'}</h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
            Los cambios se reflejarán únicamente en la colección de MongoDB.
          </p>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontSize: '14px' }}>
            Título
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyles}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontSize: '14px' }}>
            Autor
            <input
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              style={inputStyles}
            />
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontSize: '14px' }}>
              Año
              <input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                min={1000}
                max={3000}
                required
                style={inputStyles}
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontSize: '14px' }}>
              Rating
              <input
                name="rating"
                type="number"
                value={formData.rating}
                onChange={handleChange}
                min={1}
                max={5}
                required
                style={inputStyles}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontSize: '14px' }}>
            URL Portada
            <input
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              placeholder="https://..."
              style={inputStyles}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontSize: '14px' }}>
            Reseña
            <textarea
              name="review"
              value={formData.review}
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyles, resize: 'vertical' }}
            />
          </label>

          {error && (
            <p style={{ margin: 0, color: '#dc2626', fontSize: '14px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Guardando...' : selectedBook ? 'Actualizar' : 'Crear'}
            </button>
            {selectedBook && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div
          style={{
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'white',
            minHeight: '320px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Registros actuales</h3>
          {isLoading ? (
            <p style={{ color: '#94a3b8' }}>Cargando datos desde GraphQL...</p>
          ) : !hasBooks ? (
            <p style={{ color: '#94a3b8' }}>Aún no hay libros guardados en MongoDB.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {books.map((book) => (
                <article
                  key={book.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>{book.title}</h4>
                      <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                        {book.author} · {book.year} · ⭐ {book.rating}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(book)}
                        style={secondaryButtonStyles}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        style={dangerButtonStyles}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {book.review && (
                    <p style={{ margin: '12px 0 0', color: '#475569', fontSize: '14px' }}>
                      “{book.review}”
                    </p>
                  )}
                  <p style={{ margin: '12px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                    MongoId: {book.id}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(148, 163, 184, 0.6)',
  background: '#fff',
  fontSize: '14px',
  color: '#0f172a',
};

const secondaryButtonStyles: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#e2e8f0',
  color: '#475569',
  fontWeight: 600,
  cursor: 'pointer',
};

const dangerButtonStyles: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '10px',
  border: 'none',
  background: '#ef4444',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
};

export default GraphQLSandbox;

