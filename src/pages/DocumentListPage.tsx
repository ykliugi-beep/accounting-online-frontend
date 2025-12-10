import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import styles from './DocumentListPage.module.css';

interface SearchParams {
  brojDok: string;
  dobavljac: string;
  magacin: string;
  status: string;
}

export const DocumentListPage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ Inicijalno, pretraga nije izvršena
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Samo parametri, bez logike
  const [searchParams, setSearchParams] = useState<SearchParams>({
    brojDok: '',
    dobavljac: '',
    magacin: '',
    status: '',
  });

  // ✅ Combo data - magacini
  const { data: organizationalUnits = [] } = useQuery({
    queryKey: ['org-units-combo'],
    queryFn: () => api.document.getOrganizationalUnitsCombo(),
  });

  // ✅ KLJUČNO: `enabled: hasSearched` - fetch SAMO ako je korisnik kliknuo
  const { data: searchResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['documents-search', searchParams],
    queryFn: async () => {
      return api.document.list({
        pageNumber: 1,
        pageSize: 50,
        // Šalji parametre pretrage na backend (ako je implementiran)
      });
    },
    enabled: hasSearched, // ✅ KLJUČNO: Ne poziva se dok korisnik ne klikne
  });

  // ✅ Dugme "Pretraži" - klik aktivira fetch
  const handleSearchClick = () => {
    setHasSearched(true);
  };

  // ✅ Dugme "Očisti" - resetuje sve
  const handleClearSearch = () => {
    setSearchParams({
      brojDok: '',
      dobavljac: '',
      magacin: '',
      status: '',
    });
    setHasSearched(false);
  };

  const documents = searchResults?.items || [];
  const totalCount = searchResults?.totalCount || 0;

  return (
    <div className={styles.pageContent}>
      <div className={styles.searchContainer}>
        <h2>🔍 Pretraga Dokumenata</h2>

        {/* ✅ Samo 4 input polja - bez real-time onChange */}
        <div className={styles.searchRow}>
          <div className={styles.formGroup}>
            <label htmlFor="brojDok">Broj dokumenta:</label>
            <input
              id="brojDok"
              type="text"
              placeholder="npr. DOK-001"
              value={searchParams.brojDok}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  brojDok: e.target.value,
                }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dobavljac">Dobavljač:</label>
            <input
              id="dobavljac"
              type="text"
              placeholder="Unesite dobavljača"
              value={searchParams.dobavljac}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  dobavljac: e.target.value,
                }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="magacin">Magacin:</label>
            <select
              id="magacin"
              value={searchParams.magacin}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  magacin: e.target.value,
                }))
              }
            >
              <option value="">-- Svi magacini --</option>
              {organizationalUnits?.map((ou: any) => (
                <option key={ou.id} value={ou.id}>
                  {ou.naziv}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={searchParams.status}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="">-- Svi statusi --</option>
              <option value="Otvorena">Otvorena</option>
              <option value="Pauzirana">Pauzirana</option>
              <option value="Završena">Završena</option>
            </select>
          </div>
        </div>

        {/* ✅ KLJUČNO: Tri dugmeta - Pretraži, Očisti, Novi */}
        <div className={styles.btnGroup}>
          <button className={styles.btnPrimary} onClick={handleSearchClick}>
            🔍 Pretraži
          </button>
          <button onClick={handleClearSearch}>
            🗑️ Očisti
          </button>
          <button
            className={styles.btnSuccess}
            onClick={() => navigate('/documents/new')}
          >
            ➕ Novi Dokument
          </button>
        </div>
      </div>

      {/* ✅ KLJUČNO: Tabela se prikazuje SAMO nakon pretraga */}
      {hasSearched ? (
        <>
          {resultsLoading ? (
            <div className={styles.loading}>⏳ Učitavam rezultate...</div>
          ) : documents.length === 0 ? (
            <div className={styles.noSearch}>
              <p>❌ Nema pronađenih dokumenata prema zadatim kriterijumima</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Broj</th>
                    <th>Dobavljač</th>
                    <th>Magacin</th>
                    <th>Datum</th>
                    <th>Iznos (RSD)</th>
                    <th>Status</th>
                    <th style={{ width: '150px' }}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc: any) => (
                    <tr key={doc.id}>
                      <td>{doc.documentNumber}</td>
                      <td>{doc.partnerName || '-'}</td>
                      <td>{doc.organizationalUnitName}</td>
                      <td>
                        {new Date(doc.date).toLocaleDateString('sr-RS')}
                      </td>
                      <td align="right">
                        {doc.totalAmountGross?.toFixed(2)}
                      </td>
                      <td>{doc.status || 'Otvorena'}</td>
                      <td align="center">
                        <button
                          className={styles.actionBtn}
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          title="Prikazi detalje"
                        >
                          👁️ Prikazi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.statusBar}>
                <span>
                  Ukupno dokumenata: <strong>{totalCount}</strong>
                </span>
                <span>
                  Prikazano: <strong>{documents.length}</strong>
                </span>
              </div>
            </>
          )}
        </>
      ) : (
        // ✅ KLJUČNO: Poruka "Unesite parametre..." dok se ne izvrši pretraga
        <div className={styles.noSearch}>
          <p>📋 Unesite parametre pretraga i kliknite na "Pretraži"</p>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
