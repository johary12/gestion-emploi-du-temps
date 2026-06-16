// src/pagesProf/ProfDisponibilites.jsx
import { useState, useEffect } from 'react';
import { dispoService } from '../services/api';
import { Plus, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ProfDisponibilites() {
  const [dispos, setDispos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ jour: 'Lundi', heure_debut: '08:00', heure_fin: '12:00' });

  useEffect(() => { loadDispos(); }, []);

  const loadDispos = async () => {
    setLoading(true);
    try { const response = await dispoService.getMyDispos(); setDispos(response.data || []); }
    catch (error) { showNotification('error', 'Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const showNotification = (type, message) => { setNotification({ show: true, type, message }); setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000); };

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispoService.create(form);
      await loadDispos();
      setShowModal(false);
      setForm({ jour: 'Lundi', heure_debut: '08:00', heure_fin: '12:00' });
      showNotification('success', 'Disponibilité ajoutée');
    } catch (error) { showNotification('error', 'Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette disponibilité ?')) {
      setLoading(true);
      try { await dispoService.delete(id); await loadDispos(); showNotification('success', 'Disponibilité supprimée'); }
      catch (error) { showNotification('error', 'Erreur lors de la suppression'); }
      finally { setLoading(false); }
    }
  };

  return (
    <div style={styles.container}>
      {notification.show && <div style={{ ...styles.notification, background: notification.type === 'success' ? '#10b981' : '#ef4444' }}>{notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{notification.message}</span></div>}

      <div style={styles.header}><h1 style={styles.title}>⏰ Mes disponibilités</h1><button onClick={() => setShowModal(true)} style={styles.addButton}><Plus size={18} /> Ajouter</button></div>

      <div style={styles.tableContainer}>
        <table style={styles.table}><thead><tr><th>Jour</th><th>Heure début</th><th>Heure fin</th><th>Actions</th></tr></thead>
          <tbody>{dispos.map(d => <tr key={d.id}><td>{d.jour}</td><td>{d.heure_debut?.substring(0,5)}</td><td>{d.heure_fin?.substring(0,5)}</td><td><button onClick={() => handleDelete(d.id)} style={styles.deleteBtn}>🗑️</button></td></tr>)}
          {dispos.length === 0 && <tr><td colSpan="4" style={styles.emptyRow}>Aucune disponibilité</td></tr>}</tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Ajouter une disponibilité</h3>
            <select value={form.jour} onChange={e => setForm({...form, jour: e.target.value})} style={styles.input}>{JOURS.map(j => <option key={j}>{j}</option>)}</select>
            <div style={{ display: 'flex', gap: '10px' }}><input type="time" value={form.heure_debut} onChange={e => setForm({...form, heure_debut: e.target.value})} style={{ ...styles.input, flex: 1 }} /><input type="time" value={form.heure_fin} onChange={e => setForm({...form, heure_fin: e.target.value})} style={{ ...styles.input, flex: 1 }} /></div>
            <div style={styles.modalActions}><button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Annuler</button><button onClick={handleSave} style={styles.saveBtn} disabled={loading}>{loading ? 'Chargement...' : 'Enregistrer'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px 32px', maxWidth: '1000px', margin: '0 auto' },
  notification: { position: 'fixed', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', color: 'white', zIndex: 2000 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: 700 }, addButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
  tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }, table: { width: '100%', borderCollapse: 'collapse' },
  deleteBtn: { padding: '4px 8px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer' }, emptyRow: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '16px', padding: '24px', width: '400px', maxWidth: '90%' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' },
  cancelBtn: { padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};