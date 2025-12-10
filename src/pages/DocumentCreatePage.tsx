import React, { useEffect, useState } from 'react';
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

  // PARTNERS (DOBAVLJACI)
  const [partners, setPartners] = useState<PartnerComboDto[]>([]);

  // ARTIKLI
  const [artikli, setArtikli] = useState<ArticleComboDto[]>([]);

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

  // UČITAJ SVE PODATKE
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingData(true);
        
        // Učitaj artikle
        const articlesData = await api.lookup.getArticles();
        setArtikli(articlesData);
        console.log(`✅ Loaded ${articlesData.length} articles`);
        
        // Učitaj dobavljache
        const partnersData = await api.lookup.getPartners();
        setPartners(partnersData);
        console.log(`✅ Loaded ${partnersData.length} partners`);
        
        // Učitaj poreske stope
        const taksData = await api.lookup.getTaxRates();
        setPoreskeStope(taksData);
        console.log(`✅ Loaded ${taksData.length} tax rates`);
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setArtikli([]);
        setPartners([]);
        setPoreskeStope([]);
      } finally {
        setLoadingData(false);
      }
    };
    loadAllData();
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
              {/* DOBAVLJAČ - SELECT DROPDOWN */}
              <div className={styles.formGroup}>
                <label>Dobavljač:</label>
                <select
                  value={formData.partnerId || ''}
                  onChange={(e) => {
                    const partnerId = e.target.value ? parseInt(e.target.value) : null;
                    setFormData({ ...formData, partnerId });
                  }}
                >
                  <option value="">-- Izaberite dobavljača --</option>
                  {partners.map((partner) => (
                    <option key={partner.idPartner || partner.id} value={partner.idPartner || partner.id}>
                      {partner.naziv || partner.name}
                    </option>
                  ))}
                </select>
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
