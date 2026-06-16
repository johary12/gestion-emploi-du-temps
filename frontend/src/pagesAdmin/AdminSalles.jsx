// src/pagesAdmin/AdminSalles.jsx
import { useState, useEffect } from 'react';
import { salleService } from '../services/api';
import { Plus, Edit2, Trash2, Search, MapPin, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSalles() {
  const [salles, setSalles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ nom: '', capacite: '', type: '', localisation: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadSalles(); }, []);

  const loadSalles = async () => {
    setLoading(true);
    try { const response = await salleService.getAll(); setSalles(response.data || []); }
    catch (error) { showNotification('error', 'Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const showNotification = (type, message) => { setNotification({ show: true, type, message }); setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000); };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nom) newErrors.nom = 'Nom requis';
    if (!form.capacite) newErrors.capacite = 'Capacité requise';
    else if (form.capacite < 1) newErrors.capacite = 'Capacité doit être > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (editId) await salleService.update(editId, form);
      else await salleService.create(form);
      await loadSalles();
      setShowModal(false);
      resetForm();
      showNotification('success', editId ? 'Salle modifiée' : 'Salle ajoutée');
    } catch (error) { showNotification('error', 'Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette salle ?')) {
      setLoading(true);
      try { await salleService.delete(id); await loadSalles(); showNotification('success', 'Salle supprimée'); }
      catch (error) { showNotification('error', 'Erreur lors de la suppression'); }
      finally { setLoading(false); }
    }
  };

  const handleEdit = (salle) => { setEditId(salle.id); setForm({ nom: salle.nom, capacite: salle.capacite, type: salle.type || '', localisation: salle.localisation || '' }); setShowModal(true); };
  const resetForm = () => { setEditId(null); setForm({ nom: '', capacite: '', type: '', localisation: '' }); setErrors({}); };

  const filteredSalles = salles.filter(s => s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || s.type?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      {notification.show && <div style={{ ...styles.notification, background: notification.type === 'success' ? '#10b981' : '#ef4444' }}>{notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{notification.message}</span></div>}

      <div style={styles.header}><h1 style={styles.title}>🚪 Gestion des salles</h1><button onClick={() => setShowModal(true)} style={styles.addButton}><Plus size={18} /> Ajouter</button></div>

      <div style={styles.searchBar}><Search size={18} style={styles.searchIcon} /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /></div>

      <div style={styles.grid}>{filteredSalles.map(salle => (
        <div key={salle.id} style={styles.card}>
          <div style={styles.cardHeader}><h3>{salle.nom}</h3><div><button onClick={() => handleEdit(salle)} style={styles.editBtn}>✏️</button><button onClick={() => handleDelete(salle.id)} style={styles.deleteBtn}>🗑️</button></div></div>
          <div style={styles.cardBody}><p><Users size={14} /> Capacité: {salle.capacite} places</p><p><MapPin size={14} /> Type: {salle.type || '—'}</p><p>📍 Localisation: {salle.localisation || '—'}</p></div>
        </div>
      ))}
      {filteredSalles.length === 0 && <div style={styles.emptyState}>Aucune salle trouvée</div>}</div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Modifier' : 'Ajouter'} une salle</h3>
            <input type="text" placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} style={{ ...styles.input, borderColor: errors.nom ? '#ef4444' : '#e2e8f0' }} />
            {errors.nom && <div style={styles.fieldError}>{errors.nom}</div>}
            <input type="number" placeholder="Capacité" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} style={{ ...styles.input, borderColor: errors.capacite ? '#ef4444' : '#e2e8f0' }} />
            {errors.capacite && <div style={styles.fieldError}>{errors.capacite}</div>}
            <input type="text" placeholder="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={styles.input} />
            <input type="text" placeholder="Localisation" value={form.localisation} onChange={e => setForm({...form, localisation: e.target.value})} style={styles.input} />
            <div style={styles.modalActions}><button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Annuler</button><button onClick={handleSave} style={styles.saveBtn} disabled={loading}>{loading ? 'Chargement...' : 'Enregistrer'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' },
  notification: { position: 'fixed', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', color: 'white', zIndex: 2000 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: 700 }, addButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
  searchBar: { position: 'relative', marginBottom: '20px' }, searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardHeader: { padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  editBtn: { padding: '4px 8px', background: '#eef2ff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '4px 8px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer' }, emptyState: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '16px', padding: '24px', width: '450px', maxWidth: '90%' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' },
  fieldError: { fontSize: '12px', color: '#ef4444', marginTop: '-8px', marginBottom: '10px' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' },
  cancelBtn: { padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};