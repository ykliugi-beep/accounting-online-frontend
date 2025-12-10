import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useAllCombos } from '../hooks/useCombos';
import { usePartnerAutocomplete, formatPartnerLabel } from '../hooks/usePartnerAutocomplete';
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

  // DOBAVLJAČ AUTOCOMPLETE - čeka 2+ karaktera
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerComboDto | null>(null);
  const { partners } = usePartnerAutocomplete(partnerSearchTerm);

  // ARTIKLI AUTOCOMPLETE
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [showArticleDropdown, setShowArticleDropdown] = useState(false);
  const [artikli, setArtikli] = useState<ArticleComboDto[]>([]);

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

  // UČITAJ ARTIKLE
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoadingData(true);
        const data = await api.lookup.getArticles();
        setArtikli(data);
        console.log(`✅ Loaded ${data.length} articles`);
      } catch (err) {
        console.error('❌ Failed to load articles:', err);
        setArtikli([]);
      } finally {
        setLoadingData(false);
      }
    };
    loadArticles();
  }, []);

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

  // FILTERIRANI DROPDOWN STAVKE
  const filteredPartners = partnerSearchTerm.length >= 2
    ? partners.filter(p => formatPartnerLabel(p).toLowerCase().includes(partnerSearchTerm.toLowerCase()))
    : [];

  const filteredArticles = articleSearchTerm.length >= 2
    ? artikli.filter(a => (a.nazivArtikla || a.name || '').toLowerCase().includes(articleSearchTerm.toLowerCase()))
    : [];

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
            <div className={styles.formSectionTitle}>🏢 DOBAVLJAČ I MAGACIN</div>
            <div className={styles.formRow}>
              {/* DOBAVLJAČ AUTOCOMPLETE */}
              <div className={styles.formGroup}>
                <label>Dobavljač:</label>
                <div className={styles.autocompleteContainer}>
                  <input
                    type="text"
                    className={styles.autocompleteInput}
                    value={partnerSearchTerm}
                    onChange={(e) => {
                      setPartnerSearchTerm(e.target.value);
                      setShowPartnerDropdown(e.target.value.length >= 2);
                    }}
                    onFocus={() => setShowPartnerDropdown(partnerSearchTerm.length >= 2)}
                    onBlur={() => setTimeout(() => setShowPartnerDropdown(false), 200)}
                    placeholder="Unesite bar 2 karaktera..."
                  />
                  {showPartnerDropdown && filteredPartners.length > 0 && (
                    <div className={`${styles.autocompleteDropdown} ${styles.show}`}>
                      {filteredPartners.map((partner) => (
                        <div
                          key={partner.idPartner || partner.id}
                          className={styles.autocompleteItem}
                          onClick={() => {
                            setSelectedPartner(partner);
                            setPartnerSearchTerm(formatPartnerLabel(partner));
                            setFormData({ ...formData, partnerId: partner.idPartner || partner.id });
                            setShowPartnerDropdown(false);
                          }}
                        >
                          {formatPartnerLabel(partner)}
                        </div>
                      ))}
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
        </div>
      )}

      {/* TAB 2: STAVKE */}
      {activeTab === 'stavke' && (
        <div className={styles.tabContent + ' ' + styles.active}>
          <div className={styles.btnGroup}>
            <button className={styles.btnSuccess} onClick={() => setStavke([...stavke, { idArtikal: 0, nazivArtikal: '', jedinicaMere: '', kolicina: 0, jedinicnaCena: 0, iznos: 0 }])}>
              ➕ Dodaj Stavku
            </button>
          </div>
          <StavkeDokumentaTable
            stavke={stavke}
            onAddRow={() => setStavke([...stavke, { idArtikal: 0, nazivArtikal: '', jedinicaMere: '', kolicina: 0, jedinicnaCena: 0, iznos: 0 }])}
            onDeleteRow={(idx) => setStavke(stavke.filter((_, i) => i !== idx))}
            onUpdateRow={(idx, s) => {
              const updated = [...stavke];
              updated[idx] = s;
              setStavke(updated);
            }}
            artikli={artikli}
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
