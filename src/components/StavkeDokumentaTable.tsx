import React, { useState } from 'react';
import styles from './StavkeDokumentaTable.module.css';

export interface Stavka {
  id?: number;
  idArtikal: number;
  nazivArtikal: string;
  jedinicaMere: string;
  kolicina: number;
  jedinicnaCena: number;
  iznos: number;
}

interface Props {
  stavke: Stavka[];
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onUpdateRow: (index: number, stavka: Stavka) => void;
  artikli: any[];
}

export const StavkeDokumentaTable: React.FC<Props> = ({
  stavke,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  artikli,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const totalIznos = stavke.reduce((sum, s) => sum + (s.iznos || 0), 0);

  const handleEditRow = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveRow = (index: number) => {
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableTitle}>
        <h3>📋 STAVKE DOKUMENTA</h3>
        <button className={styles.btnAdd} onClick={onAddRow}>
          ➕ Dodaj Stavku
        </button>
      </div>

      {stavke.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>Nema dodate stavke. Kliknite na "Dodaj Stavku" da počnete.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>R.B.</th>
                  <th>Artikal</th>
                  <th style={{ width: '70px' }}>Jed. Mere</th>
                  <th style={{ width: '80px' }}>Količina</th>
                  <th style={{ width: '100px' }}>Jed. Cena</th>
                  <th style={{ width: '100px' }}>Iznos</th>
                  <th style={{ width: '80px' }}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {stavke.map((stavka, index) => (
                  <tr key={index} className={editingIndex === index ? styles.editingRow : ''}>
                    <td>{index + 1}</td>

                    {/* INLINE EDIT - Artikal */}
                    <td>
                      {editingIndex === index ? (
                        <select
                          value={stavka.idArtikal}
                          onChange={(e) => {
                            const selected = artikli.find(
                              (a) => a.id === parseInt(e.target.value),
                            );
                            onUpdateRow(index, {
                              ...stavka,
                              idArtikal: parseInt(e.target.value),
                              nazivArtikal: selected?.naziv || '',
                              jedinicaMere: selected?.jm || '',
                            });
                          }}
                          className={styles.selectInput}
                        >
                          <option value="">-- Izaberite --</option>
                          {artikli?.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.sifra} - {a.naziv}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{stavka.nazivArtikal || '-'}</span>
                      )}
                    </td>

                    <td>{stavka.jedinicaMere}</td>

                    {/* INLINE EDIT - Količina */}
                    <td className={styles.numberCell}>
                      {editingIndex === index ? (
                        <input
                          type="number"
                          value={stavka.kolicina}
                          onChange={(e) => {
                            const kolicina = parseFloat(e.target.value) || 0;
                            const iznos = kolicina * stavka.jedinicnaCena;
                            onUpdateRow(index, {
                              ...stavka,
                              kolicina,
                              iznos,
                            });
                          }}
                          className={styles.numberInput}
                        />
                      ) : (
                        <span>{stavka.kolicina}</span>
                      )}
                    </td>

                    {/* INLINE EDIT - Jed. Cena */}
                    <td className={styles.numberCell}>
                      {editingIndex === index ? (
                        <input
                          type="number"
                          value={stavka.jedinicnaCena}
                          onChange={(e) => {
                            const jedinicnaCena = parseFloat(e.target.value) || 0;
                            const iznos = stavka.kolicina * jedinicnaCena;
                            onUpdateRow(index, {
                              ...stavka,
                              jedinicnaCena,
                              iznos,
                            });
                          }}
                          className={styles.numberInput}
                        />
                      ) : (
                        <span>{stavka.jedinicnaCena.toFixed(2)}</span>
                      )}
                    </td>

                    {/* Auto-calculated Iznos */}
                    <td className={styles.numberCell}>
                      <strong>{stavka.iznos?.toFixed(2) || '0.00'}</strong>
                    </td>

                    {/* Akcije - Edit / Delete ili Save / Cancel */}
                    <td className={styles.actionCell}>
                      {editingIndex === index ? (
                        <>
                          <button
                            className={styles.btnSave}
                            onClick={() => handleSaveRow(index)}
                            title="Sačuvaj"
                          >
                            ✓
                          </button>
                          <button
                            className={styles.btnCancel}
                            onClick={handleCancelEdit}
                            title="Odustani"
                          >
                            ✗
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.btnEdit}
                            onClick={() => handleEditRow(index)}
                            title="Uredi"
                          >
                            ✏️
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => onDeleteRow(index)}
                            title="Obriši"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* UKUPNO Red */}
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={5} style={{ textAlign: 'right' }}>
                    <strong>UKUPNO:</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>{totalIznos.toFixed(2)} RSD</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StavkeDokumentaTable;
