// src/pages/ProfPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dispoService } from '../services/api';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ProfPage() {
  const { user } = useAuth();
  const [dispos,  setDispos]  = useState([]);
  const [form,    setForm]    = useState({ jour: 'Lundi', heure_debut: '08:00', heure_fin: '10:00' });
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState('');

  useEffect(() => { loadDispos(); }, []);

  const loadDispos = async () => {
    const { data } = await dispoService.getMyDispos();
    setDispos(data);
  };

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await dispoService.create(form);
      await loadDispos();
      notify('✅ Disponibilité ajoutée.');
    } catch (err) {
      notify('❌ ' + (err.response?.data?.message || 'Erreur.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette disponibilité ?')) return;
    await dispoService.delete(id);
    await loadDispos();
    notify('🗑️ Supprimée.');
  };

  // Grouper par jour
  const parJour = JOURS.reduce((acc, j) => {
    acc[j] = dispos.filter(d => d.jour === j);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 700, fontSize: 24, color: '#1a3a6e', margin: 0 }}>
          👨‍🏫 Espace Professeur
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
          Bonjour <strong>{user?.name}</strong> — Gérez vos disponibilités hebdomadaires
        </p>
        {user?.specialite && (
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {user.specialite}
          </span>
        )}
      </div>

      {msg && (
        <div style={{
          background: msg.startsWith('❌') ? '#fee2e2' : '#dcfce7',
          color: msg.startsWith('❌') ? '#991b1b' : '#166534',
          padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14
        }}>{msg}</div>
      )}

      {/* Formulaire ajout disponibilité */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: 24, marginBottom: 28
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#1e293b' }}>
          ➕ Ajouter une disponibilité
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          <div>
            <label style={labelStyle}>Jour</label>
            <select style={inputStyle} value={form.jour} onChange={e => setForm({...form, jour: e.target.value})}>
              {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Heure de début</label>
            <input type="time" style={inputStyle} value={form.heure_debut}
              onChange={e => setForm({...form, heure_debut: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>Heure de fin</label>
            <input type="time" style={inputStyle} value={form.heure_fin}
              onChange={e => setForm({...form, heure_fin: e.target.value})} />
          </div>
        </div>
        <button onClick={handleAdd} disabled={loading} style={{
          marginTop: 16, padding: '10px 24px', background: '#1a3a6e', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
        }}>
          {loading ? 'Ajout...' : 'Ajouter la disponibilité'}
        </button>
      </div>

      {/* Vue disponibilités par jour */}
      <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#1e293b' }}>
        📅 Mes disponibilités ({dispos.length} créneaux)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {JOURS.map(jour => {
          const items = parJour[jour] || [];
          return (
            <div key={jour} style={{
              border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
              background: '#fff'
            }}>
              <div style={{
                background: items.length > 0 ? '#dbeafe' : '#f9fafb',
                padding: '8px 14px', borderBottom: '1px solid #e5e7eb',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <strong style={{ fontSize: 14, color: '#1e293b' }}>{jour}</strong>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                  background: items.length > 0 ? '#1a3a6e' : '#e5e7eb',
                  color: items.length > 0 ? '#fff' : '#6b7280'
                }}>{items.length}</span>
              </div>
              <div style={{ padding: 10 }}>
                {items.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', margin: '10px 0' }}>
                    Non disponible
                  </p>
                ) : items.map(d => (
                  <div key={d.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 10px', background: '#f0f7ff', borderRadius: 6, marginBottom: 6,
                    border: '1px solid #bfdbfe'
                  }}>
                    <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
                      {d.heure_debut} – {d.heure_fin}
                    </span>
                    <button onClick={() => handleDelete(d.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14
                    }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, boxSizing: 'border-box' };
