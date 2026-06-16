// src/pagesAdmin/AdminEtudiants.jsx
import { useState, useEffect } from 'react';
import { etudiantService } from '../services/api';
import { Plus, Edit2, Trash2, Search, Mail, Users, AlertCircle, CheckCircle } from 'lucide-react';

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const PARCOURS = ['Génie Logiciel', 'Réseaux & Télécoms', "Systèmes d'Information", 'Sécurité Informatique'];

export default function AdminEtudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ nom: '', email: '', niveau: 'L1', parcours: 'Génie Logiciel' });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadEtudiants(); }, []);

  const loadEtudiants = async () => {
    setLoading(true);
    try { const response = await etudiantService.getAll(); setEtudiants(response.data || []); }
    catch (error) { showNotification('error', 'Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const showNotification = (type, message) => { setNotification({ show: true, type, message }); setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000); };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nom) newErrors.nom = 'Nom requis';
    if (!form.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (editId) await etudiantService.update(editId, form);
      else await etudiantService.create(form);
      await loadEtudiants();
      setShowModal(false);
      resetForm();
      showNotification('success', editId ? 'Étudiant modifié' : 'Étudiant ajouté');
    } catch (error) { showNotification('error', 'Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet étudiant ?')) {
      setLoading(true);
      try { await etudiantService.delete(id); await loadEtudiants(); showNotification('success', 'Étudiant supprimé'); }
      catch (error) { showNotification('error', 'Erreur lors de la suppression'); }
      finally { setLoading(false); }
    }
  };

  const handleEdit = (etudiant) => { setEditId(etudiant.id); setForm({ nom: etudiant.nom, email: etudiant.email, niveau: etudiant.niveau, parcours: etudiant.parcours }); setShowModal(true); };
  const resetForm = () => { setEditId(null); setForm({ nom: '', email: '', niveau: 'L1', parcours: 'Génie Logiciel' }); setErrors({}); };

  const filteredEtudiants = etudiants.filter(e => e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || e.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      {notification.show && <div style={{ ...styles.notification, background: notification.type === 'success' ? '#10b981' : '#ef4444' }}>{notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{notification.message}</span></div>}

      <div style={styles.header}><h1 style={styles.title}>👨‍🎓 Gestion des étudiants</h1><button onClick={() => setShowModal(true)} style={styles.addButton}><Plus size={18} /> Ajouter</button></div>

      <div style={styles.searchBar}><Search size={18} style={styles.searchIcon} /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /></div>

      <div style={styles.tableContainer}>
        <table style={styles.table}><thead><tr><th>Nom</th><th>Email</th><th>Niveau</th><th>Parcours</th><th>Actions</th></tr></thead>
          <tbody>{filteredEtudiants.map(e => <tr key={e.id}><td><Users size={14} /> {e.nom}</td><td><Mail size={14} /> {e.email}</td><td><span style={styles.badge}>{e.niveau}</span></td><td><span style={styles.badge}>{e.parcours}</span></td><td><button onClick={() => handleEdit(e)} style={styles.editBtn}>✏️</button><button onClick={() => handleDelete(e.id)} style={styles.deleteBtn}>🗑️</button></td></tr>)}
          {filteredEtudiants.length === 0 && <tr><td colSpan="5" style={styles.emptyRow}>Aucun étudiant</td></tr>}</tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Modifier' : 'Ajouter'} un étudiant</h3>
            <input type="text" placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} style={{ ...styles.input, borderColor: errors.nom ? '#ef4444' : '#e2e8f0' }} />
            {errors.nom && <div style={styles.fieldError}>{errors.nom}</div>}
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ ...styles.input, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} />
            {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
            <select value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})} style={styles.input}>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select>
            <select value={form.parcours} onChange={e => setForm({...form, parcours: e.target.value})} style={styles.input}>{PARCOURS.map(p => <option key={p}>{p}</option>)}</select>
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
  tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }, table: { width: '100%', borderCollapse: 'collapse' },
  badge: { display: 'inline-block', padding: '2px 8px', background: '#e0e7ff', borderRadius: '12px', fontSize: '12px', color: '#4f46e5' },
  editBtn: { padding: '4px 8px', background: '#eef2ff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '4px 8px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer' }, emptyRow: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '16px', padding: '24px', width: '450px', maxWidth: '90%' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' },
  fieldError: { fontSize: '12px', color: '#ef4444', marginTop: '-8px', marginBottom: '10px' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' },
  cancelBtn: { padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};