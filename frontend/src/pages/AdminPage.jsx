// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profService, salleService, etudiantService, edtService, dispoService } from '../services/api';

const NIVEAUX  = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', 'Systèmes d\'Information', 'Sécurité Informatique'];
const JOURS    = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AdminPage() {
  const [tab, setTab] = useState('edt');

  // Données
  const [profs,    setProfs]    = useState([]);
  const [salles,   setSalles]   = useState([]);
  const [etudiants,setEtudiants]= useState([]);
  const [edts,     setEdts]     = useState([]);
  const [dispos,   setDispos]   = useState([]);
  const [selectedProf, setSelectedProf] = useState('');

  // Formulaire courant
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (selectedProf) dispoService.getByProf(selectedProf).then(r => setDispos(r.data));
  }, [selectedProf]);

  const loadAll = async () => {
    const [p, s, e, ed] = await Promise.all([
      profService.getAll(), salleService.getAll(),
      etudiantService.getAll(), edtService.getAll(),
    ]);
    setProfs(p.data); setSalles(s.data); setEtudiants(e.data); setEdts(ed.data);
  };

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  // ── CRUD générique ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    try {
      if (tab === 'profs') {
        if (editId) await profService.update(editId, form);
        else        await profService.create(form);
      } else if (tab === 'salles') {
        if (editId) await salleService.update(editId, form);
        else        await salleService.create(form);
      } else if (tab === 'etudiants') {
        if (editId) await etudiantService.update(editId, form);
        else        await etudiantService.create(form);
      } else if (tab === 'edt') {
        if (editId) await edtService.update(editId, form);
        else        await edtService.create(form);
      }
      await loadAll();
      setForm({}); setEditId(null);
      notify(editId ? '✅ Modifié avec succès.' : '✅ Créé avec succès.');
    } catch (err) {
      notify('❌ ' + (err.response?.data?.message || 'Erreur.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;
    if (tab === 'profs')     await profService.delete(id);
    if (tab === 'salles')    await salleService.delete(id);
    if (tab === 'etudiants') await etudiantService.delete(id);
    if (tab === 'edt')       await edtService.delete(id);
    await loadAll();
    notify('🗑️ Supprimé.');
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    if (tab === 'edt') setForm({ ...item, user_id: item.user_id || item.prof?.id, salle_id: item.salle_id || item.salle?.id });
    else setForm({ ...item });
  };

  // ── Envoi email ───────────────────────────────────────────────────────────
  const envoyerEmail = async (niveau, parcours) => {
    try {
      const { data } = await edtService.envoyerEtudiants({ niveau, parcours });
      notify('📧 ' + data.message);
    } catch (err) {
      notify('❌ ' + (err.response?.data?.message || 'Erreur envoi email.'));
    }
  };

  const envoyerEmailProfs = async () => {
    try {
      const { data } = await edtService.envoyerProfs();
      notify('📧 ' + data.message);
    } catch (err) {
      notify('❌ Erreur envoi email profs.');
    }
  };

  const tabs = [
    { id: 'edt',      label: '📅 Emploi du temps' },
    { id: 'profs',    label: '👨‍🏫 Professeurs' },
    { id: 'salles',   label: '🏫 Salles' },
    { id: 'etudiants',label: '🎓 Étudiants' },
    { id: 'dispos',   label: '📋 Disponibilités' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontWeight: 700, fontSize: 24, color: '#1a3a6e', marginBottom: 24 }}>
        Tableau de bord Admin
      </h1>

      {msg && (
        <div style={{
          background: msg.startsWith('❌') ? '#fee2e2' : '#dcfce7',
          color: msg.startsWith('❌') ? '#991b1b' : '#166534',
          padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14
        }}>{msg}</div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setForm({}); setEditId(null); }}
            style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: tab === t.id ? '#1a3a6e' : '#f3f4f6',
              color:      tab === t.id ? '#fff'     : '#374151',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EMPLOI DU TEMPS ─────────────────────────────────────── */}
      {tab === 'edt' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Emploi du temps</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={envoyerEmailProfs} style={btnSecondary}>
                📧 Envoyer aux profs
              </button>
            </div>
          </div>

          {/* Formulaire EDT */}
          <div style={cardStyle}>
            <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
              {editId ? 'Modifier un cours' : 'Ajouter un cours'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={labelStyle}>Professeur</label>
                <select style={inputStyle} value={form.user_id || ''} onChange={e => setForm({...form, user_id: e.target.value})}>
                  <option value="">Choisir...</option>
                  {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Salle</label>
                <select style={inputStyle} value={form.salle_id || ''} onChange={e => setForm({...form, salle_id: e.target.value})}>
                  <option value="">Choisir...</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Matière</label>
                <input style={inputStyle} value={form.matiere || ''} onChange={e => setForm({...form, matiere: e.target.value})} placeholder="Ex: Algorithmique" />
              </div>
              <div>
                <label style={labelStyle}>Niveau</label>
                <select style={inputStyle} value={form.niveau || ''} onChange={e => setForm({...form, niveau: e.target.value})}>
                  <option value="">Choisir...</option>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Parcours</label>
                <select style={inputStyle} value={form.parcours || ''} onChange={e => setForm({...form, parcours: e.target.value})}>
                  <option value="">Choisir...</option>
                  {PARCOURS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Jour</label>
                <select style={inputStyle} value={form.jour || ''} onChange={e => setForm({...form, jour: e.target.value})}>
                  <option value="">Choisir...</option>
                  {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Heure début</label>
                <input type="time" style={inputStyle} value={form.heure_debut || ''} onChange={e => setForm({...form, heure_debut: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Heure fin</label>
                <input type="time" style={inputStyle} value={form.heure_fin || ''} onChange={e => setForm({...form, heure_fin: e.target.value})} />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button onClick={handleSave} disabled={loading} style={btnPrimary}>
                {loading ? '...' : editId ? 'Modifier' : 'Ajouter'}
              </button>
              {editId && <button onClick={() => { setForm({}); setEditId(null); }} style={btnSecondary}>Annuler</button>}
            </div>
          </div>

          {/* Liste EDT */}
          <Table
            headers={['Matière', 'Niveau', 'Parcours', 'Jour', 'Horaire', 'Professeur', 'Salle', 'Actions']}
            rows={edts.map(e => [
              e.matiere, e.niveau, e.parcours, e.jour,
              `${e.heure_debut} – ${e.heure_fin}`,
              e.prof?.name || '—', e.salle?.nom || '—',
              <Actions key={e.id} onEdit={() => handleEdit(e)} onDelete={() => handleDelete(e.id)}
                extraBtn={
                  <button style={{ ...btnSecondary, fontSize: 11, padding: '4px 8px' }}
                    onClick={() => envoyerEmail(e.niveau, e.parcours)}>
                    📧
                  </button>
                }
              />
            ])}
          />
        </div>
      )}

      {/* ── PROFESSEURS ────────────────────────────────────────── */}
      {tab === 'profs' && (
        <CrudSection
          title="Professeurs" items={profs} editId={editId} form={form}
          setForm={setForm} onSave={handleSave} onEdit={handleEdit}
          onDelete={handleDelete} onCancel={() => { setForm({}); setEditId(null); }}
          loading={loading}
          fields={[
            { key: 'name',       label: 'Nom complet',  type: 'text', placeholder: 'Dr. Rakoto Jean' },
            { key: 'email',      label: 'Email',         type: 'email', placeholder: 'prof@eni.mg' },
            { key: 'password',   label: 'Mot de passe',  type: 'password', placeholder: '••••••' },
            { key: 'specialite', label: 'Spécialité',    type: 'text', placeholder: 'Algorithmique' },
          ]}
          headers={['Nom', 'Email', 'Spécialité', 'Actions']}
          rowMapper={p => [p.name, p.email, p.specialite || '—']}
        />
      )}

      {/* ── SALLES ─────────────────────────────────────────────── */}
      {tab === 'salles' && (
        <CrudSection
          title="Salles" items={salles} editId={editId} form={form}
          setForm={setForm} onSave={handleSave} onEdit={handleEdit}
          onDelete={handleDelete} onCancel={() => { setForm({}); setEditId(null); }}
          loading={loading}
          fields={[
            { key: 'nom',          label: 'Nom de la salle', type: 'text', placeholder: 'Salle 101' },
            { key: 'capacite',     label: 'Capacité',         type: 'number', placeholder: '40' },
            { key: 'type',         label: 'Type',             type: 'text', placeholder: 'salle cours / amphi / TP' },
            { key: 'localisation', label: 'Localisation',     type: 'text', placeholder: 'Bâtiment A' },
          ]}
          headers={['Nom', 'Capacité', 'Type', 'Localisation', 'Actions']}
          rowMapper={s => [s.nom, s.capacite, s.type || '—', s.localisation || '—']}
        />
      )}

      {/* ── ÉTUDIANTS ──────────────────────────────────────────── */}
      {tab === 'etudiants' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Étudiants</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {NIVEAUX.map(n => PARCOURS.map(p => null)).flat()}
              <button onClick={() => {
                const niveau  = prompt('Niveau (L1/L2/L3/M1/M2) ?');
                const parcours = prompt('Parcours ?');
                if (niveau && parcours) envoyerEmail(niveau, parcours);
              }} style={btnSecondary}>📧 Envoyer EDT par email</button>
            </div>
          </div>
          <CrudSection
            title="" items={etudiants} editId={editId} form={form}
            setForm={setForm} onSave={handleSave} onEdit={handleEdit}
            onDelete={handleDelete} onCancel={() => { setForm({}); setEditId(null); }}
            loading={loading}
            fields={[
              { key: 'nom',     label: 'Nom',     type: 'text',  placeholder: 'Rakoto Marie' },
              { key: 'email',   label: 'Email',   type: 'email', placeholder: 'etudiant@eni.mg' },
              { key: 'niveau',  label: 'Niveau',  type: 'select', options: NIVEAUX },
              { key: 'parcours',label: 'Parcours',type: 'select', options: PARCOURS },
            ]}
            headers={['Nom', 'Email', 'Niveau', 'Parcours', 'Actions']}
            rowMapper={e => [e.nom, e.email, e.niveau, e.parcours]}
          />
        </div>
      )}

      {/* ── DISPONIBILITÉS ─────────────────────────────────────── */}
      {tab === 'dispos' && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Disponibilités des profs</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Sélectionner un professeur</label>
            <select style={inputStyle} value={selectedProf} onChange={e => setSelectedProf(e.target.value)}>
              <option value="">Choisir...</option>
              {profs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {selectedProf && (
            <Table
              headers={['Jour', 'Heure début', 'Heure fin']}
              rows={dispos.map(d => [d.jour, d.heure_debut, d.heure_fin])}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function CrudSection({ title, items, editId, form, setForm, onSave, onEdit, onDelete, onCancel, loading, fields, headers, rowMapper }) {
  return (
    <div>
      {title && <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{title}</h2>}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
          {editId ? 'Modifier' : 'Ajouter'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              {f.type === 'select' ? (
                <select style={inputStyle} value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})}>
                  <option value="">Choisir...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} style={inputStyle} value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder={f.placeholder} />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={loading} style={btnPrimary}>
            {loading ? '...' : editId ? 'Modifier' : 'Ajouter'}
          </button>
          {editId && <button onClick={onCancel} style={btnSecondary}>Annuler</button>}
        </div>
      </div>
      <Table
        headers={headers}
        rows={items.map(item => [...rowMapper(item), <Actions key={item.id} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />])}
      />
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1a3a6e' }}>
            {headers.map(h => (
              <th key={h} style={{ color: '#fff', padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Aucune donnée</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Actions({ onEdit, onDelete, extraBtn }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={onEdit}   style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px' }}>✏️ Modifier</button>
      <button onClick={onDelete} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>🗑️</button>
      {extraBtn}
    </div>
  );
}

const cardStyle   = { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 16 };
const labelStyle  = { display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 4 };
const inputStyle  = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary  = { padding: '8px 20px', background: '#1a3a6e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const btnSecondary= { padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
