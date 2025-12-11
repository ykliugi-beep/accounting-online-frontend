import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useAllCombos } from '../hooks/useCombos';
import type { DocumentSearchDto, DocumentSearchResultDto } from '../types/api.types';
import styles from './DocumentCreatePage.module.css';

export const DocumentSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: combosData } = useAllCombos('UR');

  const [searchFilters, setSearchFilters] = useState<DocumentSearchDto>({
    documentNumber: '',
    partnerId: null,
    dateFrom: null,
    dateTo: null,
    statusId: null,
    documentTypeCode: '',
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'DocumentDate',
    sortDirection: 'desc',
  });

  const [searchResults, setSearchResults] = useState<DocumentSearchResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: (filters: DocumentSearchDto) => api.document.search(filters),
    onSuccess: (data) => {
      setSearchResults(data);
      setError(null);
      console.log(`✅ Search completed: ${data.totalCount} documents found`);
    },
    onError: (err: any) => {
      console.error('❌ Search error:', err);
      setError(err?.response?.data?.message || err?.message || 'Greška pri pretrazi dokumenata');
      setSearchResults(null);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validacija: Bar jedan filter mora biti unet
    if (
      !searchFilters.documentNumber &&
      !searchFilters.partnerId &&
      !searchFilters.dateFrom &&
      !searchFilters.dateTo &&
      !searchFilters.statusId &&
      !searchFilters.documentTypeCode
    ) {
      setError('Unesite bar jedan filter za pretragu');
      return;
    }

    searchMutation.mutate(searchFilters);
  };

  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...searchFilters, pageNumber: newPage };
    setSearchFilters(updatedFilters);
    searchMutation.mutate(updatedFilters);
  };

  const handleReset = () => {
    setSearchFilters({
      documentNumber: '',
      partnerId: null,
      dateFrom: null,
      dateTo: null,
      statusId: null,
      documentTypeCode: '',
      pageNumber: 1,
      pageSize: 20,
      sortBy: 'DocumentDate',
      sortDirection: 'desc',
    });
    setSearchResults(null);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔍 Pretraga Dokumenata</h1>
        <button onClick={() => navigate(-1)} className={styles.btnPrimary}>
          ← Nazad
        </button>
      </div>

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          {error}
        </div>
      )}

      {/* SEARCH FORMA */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>📋 PARAMETRI PRETRAGE</div>
        <form onSubmit={handleSearch}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Broj dokumenta:</label>
              <input
                type="text"
                value={searchFilters.documentNumber || ''}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, documentNumber: e.target.value || '' })
                }
                placeholder="npr. DOK-001"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Partner:</label>
              <select
                value={searchFilters.partnerId || ''}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    partnerId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">-- Svi partneri --</option>
                {combosData?.organizationalUnits?.map((partner: any) => (
                  <option key={partner.idPartner || partner.id} value={partner.idPartner || partner.id}>
                    {partner.nazivPartnera || partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Tip dokumenta:</label>
              <select
                value={searchFilters.documentTypeCode || ''}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, documentTypeCode: e.target.value || '' })
                }
              >
                <option value="">-- Svi tipovi --</option>
                <option value="UR">Ulazna Kalkulacija VP</option>
                <option value="RO">Račun Otpremnica</option>
                <option value="FO">Finansijsko Odobrenje</option>
                <option value="AR">Avansni Račun</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Datum od:</label>
              <input
                type="date"
                value={searchFilters.dateFrom || ''}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, dateFrom: e.target.value || null })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Datum do:</label>
              <input
                type="date"
                value={searchFilters.dateTo || ''}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, dateTo: e.target.value || null })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status:</label>
              <select
                value={searchFilters.statusId || ''}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    statusId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">-- Svi statusi --</option>
                <option value="1">Draft</option>
                <option value="2">Active</option>
                <option value="3">Closed</option>
              </select>
            </div>
          </div>

          <div className={styles.btnGroup}>
            <button
              type="submit"
              className={styles.btnSuccess}
              disabled={searchMutation.isPending}
            >
              🔍 {searchMutation.isPending ? 'Pretražujem...' : 'Traži'}
            </button>
            <button type="button" className={styles.btnPrimary} onClick={handleReset}>
              ❌ Resetuj
            </button>
          </div>
        </form>
      </div>

      {/* REZULTATI */}
      {searchResults && searchResults.documents.length > 0 && (
        <div className={styles.formSection}>
          <div className={styles.formSectionTitle}>
            📊 REZULTATI PRETRAGE ({searchResults.totalCount} dokumenata)
          </div>

          <table>
            <thead>
              <tr>
                <th>R.B.</th>
                <th>Broj Dokumenta</th>
                <th>Datum</th>
                <th>Tip</th>
                <th>Partner</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.documents.map((doc, idx) => (
                <tr key={doc.id}>
                  <td>{(searchResults.pageNumber - 1) * searchResults.pageSize + idx + 1}</td>
                  <td>{doc.documentNumber}</td>
                  <td>{new Date(doc.date).toLocaleDateString('sr-RS')}</td>
                  <td>{doc.documentTypeCode}</td>
                  <td>{doc.partnerId || '-'}</td>
                  <td>{doc.statusId === 1 ? 'Draft' : doc.statusId === 2 ? 'Active' : 'Closed'}</td>
                  <td>
                    <button
                      className={styles.btnPrimary}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      title="Otvori dokument"
                    >
                      📄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINACIJA */}
          {(searchResults.totalPages ?? 0) > 1 && (
            <div className={styles.btnGroup} style={{ marginTop: '20px' }}>
              <button
                className={styles.btnPrimary}
                onClick={() => handlePageChange(searchResults.pageNumber - 1)}
                disabled={!searchResults.hasPreviousPage}
              >
                ← Prethodna
              </button>
              <span style={{ padding: '10px', color: '#666' }}>
                Stranica {searchResults.pageNumber} od {searchResults.totalPages ?? 1}
              </span>
              <button
                className={styles.btnPrimary}
                onClick={() => handlePageChange(searchResults.pageNumber + 1)}
                disabled={!searchResults.hasNextPage}
              >
                Sleđeća →
              </button>
            </div>
          )}
        </div>
      )}

      {searchResults && searchResults.documents.length === 0 && (
        <div className={styles.formSection}>
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            Nema dokumenata koji odgovaraju kriterijumima pretrage.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentSearchPage;
