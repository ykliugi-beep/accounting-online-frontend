import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useAllCombos } from '../hooks/useCombos';
import StavkeDokumentaTable from '../components/Document/StavkeDokumentaTable';
import TroskoviTable from '../components/Document/TroskoviTable';
import type {
  CreateDocumentDto,
  PartnerComboDto,
  OrganizationalUnitComboDto,
  ReferentComboDto,
  ArticleComboDto,
} from '../types/api.types';
import type { Stavka } from '../components/Document/StavkeDokumentaTable';
import type { Trosak } from '../components/Document/TroskoviTable';
import styles from './DocumentCreatePage.module.css';

const DOCUMENT_TYPES = [
  { code: 'UR', label: 'Ulazna Kalkulacija VP' },
  { code: 'RO', label: 'Račun Otpremnica' },
  { code: 'FO', label: 'Finansijsko Odobrenje' },
  { code: 'AR', label: 'Avansni Račun' },
];

interface AvansPDVRow {
  poreskaStopaId: number;
  poreskaStopaVal: number;
  osnov: number;
  pdvIznos: number;
  ukupno: number;
}

interface DocumentCreatePageProps {
  docType?: string;
}

function toISODateTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T00:00:00`;
}

export const DocumentCreatePage: React.FC<DocumentCreatePageProps> = ({ docType }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('zaglavlje');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const defaultDocType = docType || 'UR';
  const { data: combosData, isLoading: combosLoading } = useAllCombos(defaultDocType);

  // PARTNERS (DOBAVLJACI) - PURE TYPING-BASED SEARCH
  const [partners, setPartners] = useState<PartnerComboDto[]>([]);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerComboDto | null>(null);
  const [partnerSearchLoading, setPartnerSearchLoading] = useState(false);
  const partnerDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ARTIKLI - PURE TYPING-BASED SEARCH (SAME AS PARTNERS)
  const [allArtikli, setAllArtikli] = useState<ArticleComboDto[]>([]);
  const [artikli, setArtikli] = useState<ArticleComboDto[]>([]);
  const [artikliSearchTerm, setArtikliSearchTerm] = useState('');
  const [showArtikliDropdown, setShowArtikliDropdown] = useState(false);
  const [artikliSearchLoading, setArtikliSearchLoading] = useState(false);
  const artikliDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [editingArticleIndex, setEditingArticleIndex] = useState<number | null>(null);

  // PORESKE STOPE ZA AVANSU
  const [poreskeStope, setPoreskeStope] = useState<any[]>([]);
  const [avansPDV, setAvansPDV] = useState<AvansPDVRow[]>([
    { poreskaStopaId: 0, poreskaStopaVal: 0, osnov: 0, pdvIznos: 0, ukupno: 0 }
  ]);

  // FORM DATA
  const [formData, setFormData] = useState<CreateDocumentDto>({
    documentTypeCode: defaultDocType,
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    partnerId: null,
    organizationalUnitId: 0,
    referentId: null,
    dueDate: null,
    currencyDate: null,
    partnerDocumentNumber: null,
    partnerDocumentDate: null,
    taxationMethodId: null,
    statusId: 1,
    currencyId: null,
    exchangeRate: null,
    notes: null,
  });

  // STAVKE I TROŠKOVI
  const [stavke, setStavke] = useState<Stavka[]>([]);
  const [troskovi, setTroskovi] = useState<Trosak[]>([]);

  // UČITAJ ARTIKLE NA INICIJALIZACIJI
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingData(true);
        
        // Učitaj artikle i spremi u cache
        const articlesData = await api.lookup.getArticles();
        setAllArtikli(articlesData);
        console.log(`✅ Loaded ${articlesData.length} articles (cached)`);
        
        // Učitaj poreske stope
        const taksData = await api.lookup.getTaxRates();
        setPoreskeStope(taksData);
        console.log(`✅ Loaded ${taksData.length} tax rates`);
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setAllArtikli([]);
        setPoreskeStope([]);
      } finally {
        setLoadingData(false);
      }
    };
    loadAllData();
  }, []);

  // PURE TYPING-BASED PARTNER SEARCH
  const handlePartnerSearchChange = useCallback((searchTerm: string) => {
    setPartnerSearchTerm(searchTerm);

    // Očisti prethodni timer
    if (partnerDebounceTimer.current) {
      clearTimeout(partnerDebounceTimer.current);
    }

    // SCENARIO 1: Prazno (0 karaktera)
    if (searchTerm.trim().length === 0) {
      console.log('🔍 Partner search: empty - hiding dropdown');
      setPartners([]);
      setShowPartnerDropdown(false);
      return;
    }

    // SCENARIO 2: 1 karakter - NEMA API, prikazuj helper
    if (searchTerm.trim().length === 1) {
      console.log(`🔍 Partner search: 1 char \"${searchTerm}\" - waiting for 2+`);
      setPartners([]);
      setShowPartnerDropdown(true); // ✅ PRIKAŽI dropdown sa porukom!
      return;
    }

    // SCENARIO 3: 2+ karaktera - API sa debounce
    console.log(`🔍 Partner search: preparing for \"${searchTerm}\" (500ms debounce)`);
    setPartnerSearchLoading(true);
    setShowPartnerDropdown(true); // ✅ Čim korisnik dostigne 2+ karaktera
    partnerDebounceTimer.current = setTimeout(async () => {
      try {
        console.log(`🔍 Partner search: API call for \"${searchTerm}\"...`);
        const searchResults = await api.lookup.searchPartners(searchTerm, 50);
        setPartners(searchResults);
        console.log(`✅ Partner search: found ${searchResults.length} results for \"${searchTerm}\"`);
      } catch (err) {
        console.error('❌ Partner search error:', err);
        setPartners([]);
      } finally {
        setPartnerSearchLoading(false);
      }
    }, 500);
  }, []);

  // PURE TYPING-BASED ARTICLE SEARCH (ISTO KAO PARTNERI)
  const handleArtikliSearchChange = useCallback((searchTerm: string, rowIndex: number) => {
    setArtikliSearchTerm(searchTerm);
    setEditingArticleIndex(rowIndex);

    // Očisti prethodni timer
    if (artikliDebounceTimer.current) {
      clearTimeout(artikliDebounceTimer.current);
    }

    // SCENARIO 1: Prazno (0 karaktera)
    if (searchTerm.trim().length === 0) {
      console.log('🔍 Article search: empty - hiding dropdown');
      setArtikli([]);
      setShowArtikliDropdown(false);
      return;
    }

    // SCENARIO 2: 1 karakter - NEMA API
    if (searchTerm.trim().length === 1) {
      console.log(`🔍 Article search: 1 char \"${searchTerm}\" - waiting for 2+`);
      setArtikli([]);
      setShowArtikliDropdown(true); // ✅ PRIKAŽI dropdown sa porukom!
      return;
    }

    // SCENARIO 3: 2+ karaktera - API sa debounce
    console.log(`🔍 Article search: preparing for \"${searchTerm}\" (500ms debounce)`);
    setArtikliSearchLoading(true);
    setShowArtikliDropdown(true);
    artikliDebounceTimer.current = setTimeout(async () => {
      try {
        console.log(`🔍 Article search: API call for \"${searchTerm}\"...`);
        const searchResults = await api.lookup.searchArticles(searchTerm, 50);
        setArtikli(searchResults);
        console.log(`✅ Article search: found ${searchResults.length} results for \"${searchTerm}\"`);
      } catch (err) {
        console.error('❌ Article search error:', err);
        setArtikli([]);
      } finally {
        setArtikliSearchLoading(false);
      }
    }, 500);
  }, []);

  const handlePartnerSelect = (partner: PartnerComboDto) => {
    setSelectedPartner(partner);
    setPartnerSearchTerm(partner.naziv || partner.name || '');
    setFormData({ ...formData, partnerId: partner.idPartner || partner.id });
    setShowPartnerDropdown(false);
    console.log(`✅ Partner selected: \"${partner.naziv || partner.name}\"`);
  };

  const handleArtikliSelect = (article: ArticleComboDto, rowIndex: number) => {
    const updated = [...stavke];
    updated[rowIndex] = {
      ...updated[rowIndex],
      idArtikal: article.idArticle || article.id,
      nazivArtikal: article.naziv || article.name || '',
      jedinicaMere: article.jedinicaMere || article.unitOfMeasure || 'kom',
    };
    setStavke(updated);
    setShowArtikliDropdown(false);
    setArtikliSearchTerm('');
    setEditingArticleIndex(null);
    console.log(`✅ Article selected: \"${article.naziv || article.name}\" for row ${rowIndex}`);
  };

  // KALKULACIJA PDV-a
  const handleAvansPDVChange = (index: number, field: keyof AvansPDVRow, value: any) => {
    const updated = [...avansPDV];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'poreskaStopaVal' || field === 'osnov') {
      const stopaVal = field === 'poreskaStopaVal' ? value : updated[index].poreskaStopaVal;
      const osnov = field === 'osnov' ? value : updated[index].osnov;
      updated[index].pdvIznos = (osnov * stopaVal) / 100;
      updated[index].ukupno = osnov + updated[index].pdvIznos;
    }
    
    setAvansPDV(updated);
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateDocumentDto) => {
      const payload: CreateDocumentDto = {
        ...data,
        date: toISODateTime(data.date) || data.date,
        dueDate: toISODateTime(data.dueDate),
        currencyDate: toISODateTime(data.currencyDate),
        partnerDocumentDate: toISODateTime(data.partnerDocumentDate),
      };
      return api.document.create(payload);
    },
    onSuccess: (newDocument) => {
      setSuccess('Dokument je uspešno sačuvan!');
      setTimeout(() => navigate(`/documents/${newDocument.id}`), 1000);
    },
    onError: (err: any) => {
      setError(err?.message || 'Greška pri kreiranju dokumenta');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentNumber) {
      setError('Broj dokumenta je obavezan');
      return;
    }
    if (!formData.organizationalUnitId) {
      setError('Magacin je obavezan');
      return;
    }
    createMutation.mutate(formData);
  };

  const docTypeLabel = DOCUMENT_TYPES.find(t => t.code === defaultDocType)?.label || 'Novi Dokument';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{docTypeLabel}</h1>
        <button onClick={() => navigate(-1)} className={styles.btnPrimary}>
          ← Nazad
        </button>
      </div>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
      {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

      <div className={styles.btnGroup}>
        <button className={styles.btnSuccess} onClick={handleSubmit} disabled={createMutation.isPending}>
          💾 {createMutation.isPending ? 'Čuvam...' : 'Sačuvaj Dokument'}
        </button>
        <button className={styles.btnPrimary} onClick={() => window.print()}>
          🖨️ Štampa
        </button>
      </div>

      {/* TABS */}
      <div className={styles.navTabs}>
        <button
          className={`${activeTab === 'zaglavlje' ? styles.active : ''}`}
          onClick={() => setActiveTab('zaglavlje')}
        >
          📋 Zaglavlje Dokumenta
        </button>
        <button
          className={`${activeTab === 'stavke' ? styles.active : ''}`}
          onClick={() => setActiveTab('stavke')}
        >
          📦 Stavke Dokumenta
        </button>
        <button
          className={`${activeTab === 'troskovi' ? styles.active : ''}`}
          onClick={() => setActiveTab('troskovi')}
        >
          💰 Zavisni Troškovi
        </button>
      </div>

      {/* TAB 1: ZAGLAVLJE */}
      {activeTab === 'zaglavlje' && (
        <div className={styles.tabContent + ' ' + styles.active}>
          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>📋 OSNOVNA POLJA DOKUMENTA</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Broj dokumenta:</label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  placeholder="npr. DOK-001"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Datum dokumenta:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status:</label>
                <select value="Otvorena" onChange={(e) => {}}>
                  <option>Otvorena</option>
                  <option>Pauzirana</option>
                  <option>Završena</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>🏢 DOBABLJAČ I MAGACIN</div>
            <div className={styles.formRow}>
              {/* DOBABLJAČ - PURE TYPING SEARCH */}
              <div className={styles.formGroup}>
                <label>Dobabljač (piši 2+ karaktera za pretragu):</label>
                <div className={styles.autocompleteContainer}>
                  <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className={styles.autocompleteInput}
                      value={partnerSearchTerm}
                      onChange={(e) => handlePartnerSearchChange(e.target.value)}
                      onBlur={() => setTimeout(() => setShowPartnerDropdown(false), 200)}
                      placeholder="Piši dobabljača (min. 2 karaktera)..."
                      autoComplete="off"
                    />
                    {partnerSearchLoading && (
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>⏳</span>
                    )}
                  </div>
                  {showPartnerDropdown && partners.length > 0 && (
                    <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
                      {partners.slice(0, 50).map((partner) => (
                        <div
                          key={partner.idPartner || partner.id}
                          className={styles.autocompleteItem}
                          onClick={() => handlePartnerSelect(partner)}
                        >
                          {partner.naziv || partner.name}
                        </div>
                      ))}
                      {partners.length > 50 && (
                        <div className={styles.autocompleteItem} style={{ fontStyle: 'italic', color: '#999' }}>
                          ... i još {partners.length - 50}
                        </div>
                      )}
                    </div>
                  )}
                  {showPartnerDropdown && partnerSearchTerm.trim().length >= 2 && !partnerSearchLoading && partners.length === 0 && (
                    <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
                      <div className={styles.autocompleteItem} style={{ color: '#999' }}>
                        Nema rezultata za "{partnerSearchTerm}"
                      </div>
                    </div>
                  )}
                  {showPartnerDropdown && partnerSearchLoading && (
                    <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
                      <div className={styles.autocompleteItem} style={{ color: '#999' }}>
                        Pretražujem...
                      </div>
                    </div>
                  )}
                  {showPartnerDropdown && partnerSearchTerm.trim().length === 1 && (
                    <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
                      <div className={styles.autocompleteItem} style={{ color: '#999' }}>
                        Unesite još 1 karakter...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MAGACIN */}
              <div className={styles.formGroup}>
                <label>Magacin:</label>
                <select
                  value={formData.organizationalUnitId || ''}
                  onChange={(e) => setFormData({ ...formData, organizationalUnitId: parseInt(e.target.value) })}
                >
                  <option value="">-- Izaberite magacin --</option>
                  {combosData?.orgUnits?.map((ou) => (
                    <option key={ou.idOrganizacionaJedinica || ou.id} value={ou.idOrganizacionaJedinica || ou.id}>
                      {ou.naziv || ou.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* REFERENT */}
              <div className={styles.formGroup}>
                <label>Referent:</label>
                <select
                  value={formData.referentId || ''}
                  onChange={(e) => setFormData({ ...formData, referentId: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">-- Izaberite referenta --</option>
                  {combosData?.referents?.map((ref) => (
                    <option key={ref.idRadnik || ref.id} value={ref.idRadnik || ref.id}>
                      {ref.imePrezime || ref.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>💰 FINANSIJSKI PARAMETRI</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Valuta:</label>
                <select value={formData.currencyId || 'RSD'} onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}>
                  <option>RSD</option>
                  <option>EUR</option>
                  <option>USD</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Oporezivanje:</label>
                <select value={formData.taxationMethodId || 'PDV na nabavci'} onChange={(e) => setFormData({ ...formData, taxationMethodId: e.target.value })}>
                  <option>PDV na uvozu</option>
                  <option>PDV na nabavci</option>
                  <option>Bez PDV-a</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Narudžbenica (Ref.):</label>
                <input
                  type="text"
                  value={formData.partnerDocumentNumber || ''}
                  onChange={(e) => setFormData({ ...formData, partnerDocumentNumber: e.target.value || null })}
                  placeholder="npr. NAR-2024-001"
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>📝 DODATNE NAPOMENE</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Napomene:</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  rows={4}
                  placeholder="Unesite sve relevantne napomene..."
                />
              </div>
            </div>
          </div>

          {/* PORESKE TARIFE (AVANSI) */}
          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>📊 PORESKE TARIFE (AVANSI)</div>
            <table>
              <thead>
                <tr>
                  <th>Poreska Stopa</th>
                  <th>Osnov</th>
                  <th>PDV Iznos</th>
                  <th>Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {avansPDV.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        value={row.poreskaStopaVal}
                        onChange={(e) => handleAvansPDVChange(idx, 'poreskaStopaVal', parseInt(e.target.value))}
                      >
                        <option value="0">0%</option>
                        <option value="10">10%</option>
                        <option value="20">20%</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.osnov}
                        onChange={(e) => handleAvansPDVChange(idx, 'osnov', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.pdvIznos.toFixed(2)}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.ukupno.toFixed(2)}
                        disabled
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STAVKE */}
      {activeTab === 'stavke' && (
        <div className={styles.tabContent + ' ' + styles.active}>
          <div className={styles.btnGroup}>
            <button 
              className={styles.btnSuccess} 
              onClick={() => {
                const newStavka = { idArtikal: 0, nazivArtikal: '', jedinicaMere: '', kolicina: 0, jedinicnaCena: 0, iznos: 0 };
                setStavke([...stavke, newStavka]);
                setEditingArticleIndex(stavke.length); // ✅ Odmah je editabilna!
              }}
            >
              ➕ Dodaj Stavku
            </button>
          </div>

          {/* STAVKE TABELA SA ARTICLE SEARCH */}
          {stavke.length > 0 && (
            <div className={styles.formSection}>
              <table>
                <thead>
                  <tr>
                    <th>R.B.</th>
                    <th>Artikal</th>
                    <th>Jed.Mere</th>
                    <th>Količina</th>
                    <th>Cena</th>
                    <th>Iznos</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {stavke.map((stavka, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ position: 'relative', minWidth: '200px' }}>
                        {editingArticleIndex === idx ? (
                          <div>
                            <input
                              type="text"
                              value={artikliSearchTerm}
                              onChange={(e) => handleArtikliSearchChange(e.target.value, idx)}
                              placeholder="Piši (min 2 znaka)..."
                              autoFocus
                              autoComplete="off"
                              style={{ width: '100%' }}
                            />
                            {showArtikliDropdown && editingArticleIndex === idx && (
                              <div className={`${styles.autocompleteDropdown} ${styles.show}`} style={{ position: 'absolute', top: '100%', width: '100%', zIndex: 1000 }}>
                                {artikli.length > 0 && (
                                  artikli.slice(0, 10).map((art) => (
                                    <div
                                      key={art.idArticle || art.id}
                                      className={styles.autocompleteItem}
                                      onClick={() => handleArtikliSelect(art, idx)}
                                    >
                                      {art.naziv || art.name}
                                    </div>
                                  ))
                                )}
                                {artikliSearchTerm.trim().length === 1 && (
                                  <div className={styles.autocompleteItem} style={{ color: '#999' }}>
                                    Unesite još 1 karakter...
                                  </div>
                                )}
                                {artikliSearchTerm.trim().length >= 2 && !artikliSearchLoading && artikli.length === 0 && (
                                  <div className={styles.autocompleteItem} style={{ color: '#999' }}>
                                    Nema rezultata
                                  </div>
                                )}
                                {artikliSearchLoading && (
                                  <div className={styles.autocompleteItem} style={{ color: '#999' }}>
                                    Pretražujem...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingArticleIndex(idx);
                              setArtikliSearchTerm('');
                            }}
                            style={{ cursor: 'pointer', padding: '8px', backgroundColor: '#f5f5f5' }}
                          >
                            {stavka.nazivArtikal || '🔍 Klikni za izbor'}
                          </div>
                        )}
                      </td>
                      <td>{stavka.jedinicaMere}</td>
                      <td>
                        <input
                          type="number"
                          value={stavka.kolicina}
                          onChange={(e) => {
                            const updated = [...stavke];
                            updated[idx].kolicina = parseFloat(e.target.value) || 0;
                            updated[idx].iznos = updated[idx].kolicina * updated[idx].jedinicnaCena;
                            setStavke(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={stavka.jedinicnaCena}
                          onChange={(e) => {
                            const updated = [...stavke];
                            updated[idx].jedinicnaCena = parseFloat(e.target.value) || 0;
                            updated[idx].iznos = updated[idx].kolicina * updated[idx].jedinicnaCena;
                            setStavke(updated);
                          }}
                        />
                      </td>
                      <td>{stavka.iznos.toFixed(2)}</td>
                      <td>
                        <button
                          className={styles.btnDanger}
                          onClick={() => setStavke(stavke.filter((_, i) => i !== idx))}
                          title="Obriši stavku"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {stavke.length === 0 && (
            <div className={styles.formSection}>
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                Nema dodanih stavki. Klikni \"Dodaj Stavku\" da počneš.
              </p>
            </div>
          )}

          <StavkeDokumentaTable
            stavke={stavke}
            onAddRow={() => setStavke([...stavke, { idArtikal: 0, nazivArtikal: '', jedinicaMere: '', kolicina: 0, jedinicnaCena: 0, iznos: 0 }])}
            onDeleteRow={(idx) => setStavke(stavke.filter((_, i) => i !== idx))}
            onUpdateRow={(idx, s) => {
              const updated = [...stavke];
              updated[idx] = s;
              setStavke(updated);
            }}
            artikli={allArtikli}
          />
        </div>
      )}

      {/* TAB 3: TROŠKOVI */}
      {activeTab === 'troskovi' && (
        <div className={styles.tabContent + ' ' + styles.active}>
          <div className={styles.btnGroup}>
            <button className={styles.btnSuccess} onClick={() => setTroskovi([...troskovi, { idVrstaTroska: 0, nazivVrstaTroska: '', opis: '', iznos: 0, nacin: 1 }])}>
              ➕ Dodaj Trošak
            </button>
          </div>
          <TroskoviTable
            troskovi={troskovi}
            stavke={stavke}
            onAddRow={() => setTroskovi([...troskovi, { idVrstaTroska: 0, nazivVrstaTroska: '', opis: '', iznos: 0, nacin: 1 }])}
            onDeleteRow={(idx) => setTroskovi(troskovi.filter((_, i) => i !== idx))}
            onUpdateRow={(idx, t) => {
              const updated = [...troskovi];
              updated[idx] = t;
              setTroskovi(updated);
            }}
            costTypes={combosData?.costTypes || []}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentCreatePage;
