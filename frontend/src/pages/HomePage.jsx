// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { publicService } from '../services/api';

const NIVEAUX   = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS  = ['Génie Logiciel', 'Réseaux & Télécoms', 'Systèmes d\'Information', 'Sécurité Informatique'];
const JOURS     = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const COULEURS_JOURS = {
  Lundi:    '#dbeafe', Mardi: '#dcfce7', Mercredi: '#fef9c3',
  Jeudi:    '#fce7f3', Vendredi: '#ede9fe', Samedi: '#ffedd5',
};

export default function HomePage() {
  const [niveau,   setNiveau]   = useState('L1');
  const [parcours, setParcours] = useState(PARCOURS[0]);
  const [emplois,  setEmplois]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    fetchEmplois();
  }, [niveau, parcours]);

  const fetchEmplois = async () => {
    setLoading(true);
    try {
      const { data } = await publicService.getEmploi(niveau, parcours);
      setEmplois(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Grouper par jour
  const parJour = JOURS.reduce((acc, jour) => {
    acc[jour] = emplois.filter(e => e.jour === jour);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a3a6e', marginBottom: 4 }}>
          🎓 ENI Fianarantsoa
        </h1>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          École Nationale d'Informatique — Emploi du temps hebdomadaire
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 4 }}>
            Niveau
          </label>
          <select
            value={niveau}
            onChange={e => setNiveau(e.target.value)}
            style={selectStyle}
          >
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 4 }}>
            Parcours
          </label>
          <select
            value={parcours}
            onChange={e => setParcours(e.target.value)}
            style={selectStyle}
          >
            {PARCOURS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Badge info */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 16px', borderRadius: 20, fontWeight: 600, fontSize: 13 }}>
          {niveau} — {parcours}
        </span>
      </div>

      {/* Grille emploi du temps */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {JOURS.map(jour => {
            const cours = parJour[jour] || [];
            const bg = COULEURS_JOURS[jour];
            return (
              <div key={jour} style={{
                border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ background: bg, padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <strong style={{ fontSize: 15, color: '#1e293b' }}>{jour}</strong>
                  <span style={{ float: 'right', fontSize: 12, color: '#6b7280' }}>{cours.length} cours</span>
                </div>
                <div style={{ padding: 12, minHeight: 80 }}>
                  {cours.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', margin: '16px 0' }}>
                      Pas de cours
                    </p>
                  ) : (
                    cours.map(c => (
                      <div key={c.id} style={{
                        marginBottom: 10, padding: '10px 12px', background: '#fff',
                        border: '1px solid #e5e7eb', borderRadius: 8,
                        borderLeft: `4px solid ${bg === '#dbeafe' ? '#3b82f6' : bg === '#dcfce7' ? '#22c55e' : bg === '#fef9c3' ? '#eab308' : bg === '#fce7f3' ? '#ec4899' : bg === '#ede9fe' ? '#8b5cf6' : '#f97316'}`
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{c.matiere}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          🕐 {c.heure_debut} – {c.heure_fin}
                        </div>
                        <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>
                          👨‍🏫 {c.prof || '—'} &nbsp;|&nbsp; 📍 {c.salle || '—'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 14, background: '#fff', cursor: 'pointer', minWidth: 200
};
