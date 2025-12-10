import React, { useState } from 'react';
import { Stavka } from './StavkeDokumentaTable';
import styles from './TroskoviTable.module.css';

export interface Trosak {
  id?: number;
  idVrstaTroska: number;
  nazivVrstaTroska: string;
  opis: string;
  iznos: number;
  nacin: number; // 1 = Po količini, 2 = Po vrednosti, 3 = Ručna
}

interface Props {
  troskovi: Trosak[];
  stavke: Stavka[];
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onUpdateRow: (index: number, trosak: Trosak) => void;
  costTypes: any[];
}

export const TroskoviTable: React.FC<Props> = ({
  troskovi,
  stavke,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  costTypes,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedTrosak, setExpandedTrosak] = useState<number | null>(null);

  const totalTroskovi = troskovi.reduce((sum, t) => sum + (t.iznos || 0), 0);

  // Metoda 1: Raspodela po količini stavki
  const raspodelivUzPoKolicinu = (trosak: Trosak) => {
    const ukupnaKolicina = stavke.reduce((sum, s) => sum + s.kolicina, 0);
    if (ukupnaKolicina === 0) return [];
    return stavke.map((s) => ({
      stavka: s,
      iznosRaspodele: (s.kolicina / ukupnaKolicina) * trosak.iznos,
    }));
  };

  // Metoda 2: Raspodela po vrednosti stavki
  const raspodelivUzPoVrednosti = (trosak: Trosak) => {
    const ukupnaVrednost = stavke.reduce((sum, s) => sum + s.iznos, 0);
    if (ukupnaVrednost === 0) return [];
    return stavke.map((s) => ({
      stavka: s,
      iznosRaspodele: (s.iznos / ukupnaVrednost) * trosak.iznos,
    }));
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableTitle}>
        <h3>📉 ZAVISNI TROŠKOVI</h3>
        <button className={styles.btnAdd} onClick={onAddRow}>
          ➕ Dodaj Trošak
        </button>
      </div>

      {troskovi.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>Nema dodati troškova. Kliknite na "Dodaj Trošak" da počnete.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>R.B.</th>
                  <th>Vrsta Troška</th>
                  <th>Opis</th>
                  <th style={{ width: '100px' }}>Iznos</th>
                  <th style={{ width: '100px' }}>Raspodela</th>
                  <th style={{ width: '80px' }}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {troskovi.map((trosak, index) => {
                  const raspodelivUz =
                    trosak.nacin === 1
                      ? raspodelivUzPoKolicinu(trosak)
                      : raspodelivUzPoVrednosti(trosak);

                  return (
                    <React.Fragment key={index}>
                      <tr
                        className={editingIndex === index ? styles.editingRow : ''}
                      >
                        <td>{index + 1}</td>

                        {/* INLINE EDIT - Vrsta Troška */}
                        <td>
                          {editingIndex === index ? (
                            <select
                              value={trosak.idVrstaTroska}
                              onChange={(e) => {
                                const selected = costTypes.find(
                                  (t) => t.id === parseInt(e.target.value),
                                );
                                onUpdateRow(index, {
                                  ...trosak,
                                  idVrstaTroska: parseInt(e.target.value),
                                  nazivVrstaTroska: selected?.naziv || '',
                                });
                              }}
                              className={styles.selectInput}
                            >
                              <option value="">-- Izaberite --</option>
                              {costTypes?.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.naziv}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>{trosak.nazivVrstaTroska || '-'}</span>
                          )}
                        </td>

                        {/* INLINE EDIT - Opis */}
                        <td>
                          {editingIndex === index ? (
                            <input
                              type="text"
                              value={trosak.opis}
                              onChange={(e) =>
                                onUpdateRow(index, {
                                  ...trosak,
                                  opis: e.target.value,
                                })
                              }
                              className={styles.textInput}
                            />
                          ) : (
                            <span>{trosak.opis || '-'}</span>
                          )}
                        </td>

                        {/* INLINE EDIT - Iznos */}
                        <td className={styles.numberCell}>
                          {editingIndex === index ? (
                            <input
                              type="number"
                              value={trosak.iznos}
                              onChange={(e) =>
                                onUpdateRow(index, {
                                  ...trosak,
                                  iznos: parseFloat(e.target.value) || 0,
                                })
                              }
                              className={styles.numberInput}
                            />
                          ) : (
                            <span>{trosak.iznos.toFixed(2)}</span>
                          )}
                        </td>

                        {/* Raspodela - Metoda */}
                        <td>
                          {editingIndex === index ? (
                            <select
                              value={trosak.nacin}
                              onChange={(e) =>
                                onUpdateRow(index, {
                                  ...trosak,
                                  nacin: parseInt(e.target.value),
                                })
                              }
                              className={styles.selectInput}
                            >
                              <option value="1">Po količini</option>
                              <option value="2">Po vrednosti</option>
                              <option value="3">Ručna</option>
                            </select>
                          ) : (
                            <span>
                              {trosak.nacin === 1
                                ? 'Količina'
                                : trosak.nacin === 2
                                  ? 'Vrednost'
                                  : 'Ručna'}
                            </span>
                          )}
                        </td>

                        {/* Akcije */}
                        <td className={styles.actionCell}>
                          {editingIndex === index ? (
                            <>
                              <button
                                className={styles.btnSave}
                                onClick={() => setEditingIndex(null)}
                                title="Sačuvaj"
                              >
                                ✓
                              </button>
                              <button
                                className={styles.btnCancel}
                                onClick={() => setEditingIndex(null)}
                                title="Odustani"
                              >
                                ✗
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className={styles.btnEdit}
                                onClick={() => setEditingIndex(index)}
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
                          <button
                            className={styles.btnExpand}
                            onClick={() =>
                              setExpandedTrosak(
                                expandedTrosak === index ? null : index,
                              )
                            }
                            title="Prikaži rasporedelu"
                          >
                            {expandedTrosak === index ? '▲' : '▼'}
                          </button>
                        </td>
                      </tr>

                      {/* Raspodela Details Row */}
                      {expandedTrosak === index && (
                        <tr className={styles.expandedRow}>
                          <td colSpan={6}>
                            <div className={styles.rasporedView}>
                              <strong>
Raspodela ({trosak.nacin === 1 ? 'Po količini' : 'Po vrednosti'}):</strong>
                              <table className={styles.rasporedTable}>
                                <thead>
                                  <tr>
                                    <th>Artikel</th>
                                    <th>Količina</th>
                                    <th>Iznos Raspodele</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {raspodelivUz.map((item, i) => (
                                    <tr key={i}>
                                      <td>{item.stavka.nazivArtikal}</td>
                                      <td align="right">{item.stavka.kolicina}</td>
                                      <td align="right">
                                        {item.iznosRaspodele.toFixed(2)} RSD
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* UKUPNO Red */}
              <tfoot>
                <tr className={styles.totalRow}>
                  <td colSpan={3} style={{ textAlign: 'right' }}>
                    <strong>UKUPNO TROSCI:</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>{totalTroskovi.toFixed(2)} RSD</strong>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TroskoviTable;
