// src/pagesAdmin/AdminProfs.jsx
import { useState, useEffect } from 'react';
import { profService } from '../services/api';
import { Plus, Edit2, Trash2, Search, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminProfs() {
  const [profs, setProfs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ name: '', email: '', specialite: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadProfs(); }, []);

  const loadProfs = async () => {
    setLoading(true);
    try { const response = await profService.getAll(); setProfs(response.data || []); }
    catch (error) { console.error('Erreur:', error); showNotification('error', 'Erreur de chargement'); }
    finally { setLoading(false); }
  };

  const showNotification = (type, message) => { setNotification({ show: true, type, message }); setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000); };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Nom requis';
    if (!form.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide';
    if (!editId && !form.password) newErrors.password = 'Mot de passe requis';
    else if (!editId && form.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (editId) await profService.update(editId, form);
      else await profService.create(form);
      await loadProfs();
      setShowModal(false);
      resetForm();
      showNotification('success', editId ? 'Professeur modifié' : 'Professeur ajouté');
    } catch (error) { console.error('Erreur:', error); showNotification('error', 'Erreur lors de la sauvegarde'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce professeur ?')) {
      setLoading(true);
      try { await profService.delete(id); await loadProfs(); showNotification('success', 'Professeur supprimé'); }
      catch (error) { showNotification('error', 'Erreur lors de la suppression'); }
      finally { setLoading(false); }
    }
  };

  const handleEdit = (prof) => { setEditId(prof.id); setForm({ name: prof.name, email: prof.email, specialite: prof.specialite || '', password: '' }); setShowModal(true); };
  const resetForm = () => { setEditId(null); setForm({ name: '', email: '', specialite: '', password: '' }); setErrors({}); };

  const filteredProfs = profs.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      {notification.show && <div style={{ ...styles.notification, background: notification.type === 'success' ? '#10b981' : '#ef4444' }}>{notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{notification.message}</span></div>}

      <div style={styles.header}><h1 style={styles.title}>👨‍🏫 Gestion des professeurs</h1><button onClick={() => setShowModal(true)} style={styles.addButton}><Plus size={18} /> Ajouter</button></div>

      <div style={styles.searchBar}><Search size={18} style={styles.searchIcon} /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} /></div>

      <div style={styles.tableContainer}>
        <table style={styles.table}><thead><tr><th>Nom</th><th>Email</th><th>Spécialité</th><th>Actions</th></tr></thead>
          <tbody>{filteredProfs.map(p => <tr key={p.id}><td><User size={14} /> {p.name}</td><td><Mail size={14} /> {p.email}</td><td>{p.specialite || '—'}</td><td><button onClick={() => handleEdit(p)} style={styles.editBtn}>✏️</button><button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>🗑️</button></td></tr>)}
          {filteredProfs.length === 0 && <tr><td colSpan="4" style={styles.emptyRow}>Aucun professeur</td></tr>}</tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Modifier' : 'Ajouter'} un professeur</h3>
            <input type="text" placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ ...styles.input, borderColor: errors.name ? '#ef4444' : '#e2e8f0' }} />
            {errors.name && <div style={styles.fieldError}>{errors.name}</div>}
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ ...styles.input, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }} />
            {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
            <input type="text" placeholder="Spécialité" value={form.specialite} onChange={e => setForm({...form, specialite: e.target.value})} style={styles.input} />
            {!editId && <><input type="password" placeholder="Mot de passe" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ ...styles.input, borderColor: errors.password ? '#ef4444' : '#e2e8f0' }} />{errors.password && <div style={styles.fieldError}>{errors.password}</div>}</>}
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