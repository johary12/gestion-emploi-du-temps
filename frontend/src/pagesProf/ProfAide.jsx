// src/pagesProf/ProfAide.jsx
import { useState, useEffect } from 'react';
import {
  HelpCircle, Search, Mail, Phone, MessageCircle,
  BookOpen, Users, Settings, Calendar, Clock,
  ChevronDown, ChevronUp, CheckCircle,
  X, Link, Award, AlertCircle,
  User
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ProfAide() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const isDark = theme === 'dark';

  const categories = [
    { id: 'all', name: 'Tous', icon: HelpCircle, color: '#059669' },
    { id: 'disponibilites', name: 'Disponibilités', icon: Clock, color: '#059669' },
    { id: 'edt', name: 'Emploi du temps', icon: Calendar, color: '#3b82f6' },
    { id: 'cours', name: 'Cours', icon: BookOpen, color: '#7c3aed' },
    { id: 'compte', name: 'Compte', icon: User, color: '#f59e0b' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'disponibilites',
      question: "Comment ajouter une disponibilité ?",
      answer: "Pour ajouter une disponibilité, allez dans la section 'Mes disponibilités' puis cliquez sur le bouton 'Ajouter'. Sélectionnez le jour et les horaires souhaités, puis validez. Vos disponibilités seront visibles par l'administration pour la planification des cours.",
      steps: [
        "Allez dans le menu latéral → Mes disponibilités",
        "Cliquez sur 'Ajouter'",
        "Sélectionnez le jour de la semaine",
        "Choisissez l'heure de début et de fin",
        "Cliquez sur 'Enregistrer'"
      ],
      tags: ['disponibilité', 'ajout', 'horaire']
    },
    {
      id: 2,
      category: 'edt',
      question: "Comment consulter mon emploi du temps ?",
      answer: "Rendez-vous dans la section 'Emploi du temps' du menu latéral. Vous y verrez votre planning hebdomadaire avec tous vos cours. Vous pouvez naviguer entre les semaines et exporter votre emploi du temps au format PDF.",
      steps: [
        "Allez dans le menu latéral → Emploi du temps",
        "Naviguez entre les semaines avec les boutons",
        "Cliquez sur 'Exporter PDF' pour télécharger",
        "Utilisez 'Imprimer' pour une version papier"
      ],
      tags: ['emploi', 'planning', 'cours']
    },
    {
      id: 3,
      category: 'cours',
      question: "Quelles informations sont affichées pour un cours ?",
      answer: "Chaque cours affiche : la matière, le niveau, le parcours, l'heure de début et fin, le professeur (vous) et la salle. Les cours sont organisés par jour de la semaine dans une grille claire et intuitive.",
      steps: [],
      tags: ['cours', 'matière', 'salle']
    },
    {
      id: 4,
      category: 'compte',
      question: "Comment changer mon mot de passe ?",
      answer: "Allez dans 'Paramètres' dans le menu latéral, puis dans la section 'Sécurité', cliquez sur 'Changer le mot de passe'. Saisissez votre mot de passe actuel puis votre nouveau mot de passe (minimum 6 caractères).",
      steps: [
        "Allez dans 'Paramètres'",
        "Section 'Sécurité'",
        "Cliquez sur 'Changer le mot de passe'",
        "Remplissez les champs et validez"
      ],
      tags: ['mot de passe', 'sécurité', 'compte']
    },
    {
      id: 5,
      category: 'disponibilites',
      question: "Comment supprimer une disponibilité ?",
      answer: "Dans la liste de vos disponibilités, chaque entrée possède un bouton de suppression (icône corbeille). Cliquez dessus pour supprimer la disponibilité. Une confirmation vous sera demandée avant la suppression définitive.",
      steps: [],
      tags: ['suppression', 'disponibilité']
    },
    {
      id: 6,
      category: 'edt',
      question: "Comment exporter mon emploi du temps en PDF ?",
      answer: "Dans la page 'Emploi du temps', utilisez le bouton 'Exporter PDF' dans l'en-tête. Le PDF généré contient tous vos cours de la semaine avec les détails (matière, horaires, niveau, salle, parcours).",
      steps: [
        "Allez dans 'Emploi du temps'",
        "Cliquez sur 'Exporter PDF'",
        "Attendez la génération",
        "Le fichier se télécharge automatiquement"
      ],
      tags: ['export', 'PDF', 'téléchargement']
    },
    {
      id: 7,
      category: 'compte',
      question: "Comment gérer mes notifications ?",
      answer: "Dans 'Paramètres', section 'Notifications', vous pouvez activer ou désactiver les notifications par email, les notifications push et le résumé quotidien de vos cours.",
      steps: [
        "Allez dans 'Paramètres'",
        "Section 'Notifications'",
        "Activez/désactivez les options souhaitées",
        "Les changements sont sauvegardés automatiquement"
      ],
      tags: ['notification', 'email', 'push']
    },
    {
      id: 8,
      category: 'cours',
      question: "Que faire si un cours n'apparaît pas dans mon emploi du temps ?",
      answer: "Contactez l'administration pour vérifier l'assignation des cours. Assurez-vous également que vous êtes bien sur la bonne semaine dans l'interface. Vous pouvez aussi rafraîchir la page ou vous déconnecter/reconnecter.",
      steps: [],
      tags: ['cours', 'manquant', 'problème']
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
    }}>
      {/* En-tête */}
      <div style={{
        ...styles.header,
        background: `linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)`,
      }}>
        <div style={styles.headerIcon}>
          <HelpCircle size={40} color="white" />
        </div>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Centre d'aide</h1>
          <p style={styles.subtitle}>Trouvez des réponses à vos questions</p>
        </div>
        <button onClick={handleCopyLink} style={styles.copyButton}>
          <Link size={16} />
          {copied ? 'Copié !' : 'Partager'}
        </button>
      </div>

      {/* Barre de recherche */}
      <div style={{
        ...styles.searchContainer,
        borderColor: searchFocused ? '#059669' : (isDark ? '#334155' : '#e2e8f0'),
        boxShadow: searchFocused ? '0 0 0 3px rgba(5, 150, 105, 0.15)' : 'none',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
      }}>
        <Search size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher dans l'aide..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            ...styles.searchInput,
            backgroundColor: 'transparent',
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}
          aria-label="Rechercher dans l'aide"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
            <X size={16} />
          </button>
        )}
        <kbd style={{
          ...styles.searchShortcut,
          backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
          color: isDark ? '#94a3b8' : '#64748b',
        }}>⌘K</kbd>
      </div>

      {/* Catégories */}
      <div style={styles.categories}>
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                ...styles.categoryButton,
                backgroundColor: isActive ? cat.color : (isDark ? '#1e293b' : '#ffffff'),
                color: isActive ? 'white' : (isDark ? '#94a3b8' : '#475569'),
                borderColor: isActive ? cat.color : (isDark ? '#334155' : '#e2e8f0'),
                boxShadow: isActive ? `0 4px 12px ${cat.color}40` : 'none'
              }}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Résultats de recherche */}
      {searchTerm && (
        <div style={{
          ...styles.searchResults,
          color: isDark ? '#94a3b8' : '#64748b',
        }}>
          <span>{filteredFaqs.length} résultat(s) trouvé(s)</span>
          {filteredFaqs.length === 0 && (
            <button onClick={() => setSearchTerm('')} style={{
              ...styles.clearButton,
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#94a3b8' : '#475569',
            }}>
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      <div style={styles.grid}>
        {/* Section FAQ */}
        <div style={{
          ...styles.section,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <div style={styles.sectionHeader}>
            <MessageCircle size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={{
                ...styles.sectionTitle,
                color: isDark ? '#f1f5f9' : '#1e293b',
              }}>Foire aux questions</h2>
              <p style={{
                ...styles.sectionDesc,
                color: isDark ? '#94a3b8' : '#64748b',
              }}>Les réponses aux questions les plus fréquentes</p>
            </div>
            <span style={styles.sectionBadge}>{filteredFaqs.length} questions</span>
          </div>

          <div style={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => {
                const category = categories.find(c => c.id === faq.category);
                return (
                  <div key={faq.id} style={{
                    ...styles.faqItem,
                    borderColor: isDark ? '#334155' : '#f1f5f9',
                  }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      style={styles.faqQuestion}
                    >
                      <div style={styles.faqQuestionContent}>
                        <span style={{
                          ...styles.faqQuestionText,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>{faq.question}</span>
                        {faq.tags && (
                          <div style={styles.faqTags}>
                            {faq.tags.slice(0, 2).map(tag => (
                              <span key={tag} style={{
                                ...styles.faqTag,
                                backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                                color: isDark ? '#94a3b8' : '#64748b',
                              }}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {openFaq === faq.id ? 
                        <ChevronUp size={20} style={styles.faqIcon} /> : 
                        <ChevronDown size={20} style={styles.faqIcon} />
                      }
                    </button>
                    {openFaq === faq.id && (
                      <div style={{
                        ...styles.faqAnswer,
                        color: isDark ? '#94a3b8' : '#475569',
                      }}>
                        <p>{faq.answer}</p>
                        {faq.steps && faq.steps.length > 0 && (
                          <div style={{
                            ...styles.steps,
                            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                            borderColor: isDark ? '#334155' : '#e2e8f0',
                          }}>
                            <p style={{
                              ...styles.stepsTitle,
                              color: isDark ? '#f1f5f9' : '#1e293b',
                            }}>📝 Étapes à suivre :</p>
                            <ol style={{
                              ...styles.stepsList,
                              color: isDark ? '#94a3b8' : '#64748b',
                            }}>
                              {faq.steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        <div style={styles.faqMeta}>
                          <span style={{
                            ...styles.faqCategory,
                            color: isDark ? '#94a3b8' : '#94a3b8',
                          }}>
                            <Users size={12} />
                            {category?.name || 'Général'}
                          </span>
                          <button style={{
                            ...styles.faqUseful,
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#94a3b8' : '#475569',
                          }}>👍 Utile</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={styles.noResults}>
                <HelpCircle size={48} style={styles.noResultsIcon} />
                <p style={{
                  ...styles.noResultsTitle,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}>Aucun résultat trouvé</p>
                <p style={{
                  ...styles.noResultsDesc,
                  color: isDark ? '#94a3b8' : '#94a3b8',
                }}>Aucune question ne correspond à "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} style={{
                  ...styles.clearButton,
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  color: isDark ? '#94a3b8' : '#475569',
                }}>
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div style={{
          ...styles.supportSection,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}>
          <div style={styles.sectionHeader}>
            <Mail size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={{
                ...styles.sectionTitle,
                color: isDark ? '#f1f5f9' : '#1e293b',
              }}>Contacter le support</h2>
              <p style={{
                ...styles.sectionDesc,
                color: isDark ? '#94a3b8' : '#64748b',
              }}>Besoin d'aide supplémentaire ?</p>
            </div>
            <span style={styles.supportStatus}>🟢 Disponible</span>
          </div>

          <div style={styles.contactMethods}>
            <div style={{
              ...styles.contactCard,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }}>
              <Mail size={20} style={styles.contactIcon} />
              <div>
                <div style={{
                  ...styles.contactLabel,
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>Email</div>
                <div style={{
                  ...styles.contactValue,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}>support@eni-fianarantsoa.mg</div>
                <div style={{
                  ...styles.contactDesc,
                  color: isDark ? '#64748b' : '#94a3b8',
                }}>Réponse sous 24h</div>
              </div>
            </div>

            <div style={{
              ...styles.contactCard,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }}>
              <Phone size={20} style={styles.contactIcon} />
              <div>
                <div style={{
                  ...styles.contactLabel,
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>Téléphone</div>
                <div style={{
                  ...styles.contactValue,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                }}>+261 34 00 000 00</div>
                <div style={{
                  ...styles.contactDesc,
                  color: isDark ? '#64748b' : '#94a3b8',
                }}>Lun-Ven, 9h-17h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .category-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .faq-question:hover {
          color: #059669;
        }
        .contact-card:hover {
          border-color: #059669 !important;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.08);
        }
        .copy-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        .clear-search:hover {
          background: var(--hover-bg, #f1f5f9);
        }
        .clear-button:hover {
          background: var(--hover-bg, #e2e8f0);
        }
        
        @media (max-width: 768px) {
          .container { padding: 16px; }
          .header { flex-direction: column; text-align: center; padding: 20px; }
          .header-content { width: 100%; }
          .copy-button { align-self: center; }
          .categories { justify-content: center; }
          .contact-methods { grid-template-columns: 1fr; }
          .section-header { flex-direction: column; align-items: flex-start; }
          .section-badge, .popular-icon, .support-status { margin-left: 0; }
          .faq-question-content { flex-direction: column; align-items: flex-start; gap: 6px; }
          .faq-meta { flex-wrap: wrap; }
          .search-shortcut { display: none; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 32px',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    minHeight: '100vh',
    transition: 'all 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '28px 32px',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(5, 150, 105, 0.3)',
  },
  headerIcon: {
    background: 'rgba(255,255,255,0.2)',
    padding: '14px',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
  },
  headerContent: { flex: 1 },
  title: { fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', fontFamily: '"Poppins", "Inter", sans-serif' },
  subtitle: { fontSize: '14px', margin: 0, opacity: 0.9 },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '24px',
    borderRadius: '14px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    padding: '14px 50px 14px 48px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    outline: 'none',
    background: 'transparent',
  },
  clearSearch: {
    position: 'absolute',
    right: '60px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  searchShortcut: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: 500,
  },
  categories: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '13px',
    fontWeight: 500,
  },
  searchResults: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontSize: '13px',
  },
  clearButton: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  grid: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: {
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9',
    flexWrap: 'wrap',
  },
  sectionIcon: { color: '#059669' },
  sectionTitle: { fontSize: '20px', fontWeight: 600, margin: 0 },
  sectionDesc: { fontSize: '13px', margin: '2px 0 0 0' },
  sectionBadge: {
    marginLeft: 'auto',
    padding: '4px 12px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  supportStatus: {
    marginLeft: 'auto',
    padding: '4px 12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  faqList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  faqItem: { borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s ease' },
  faqQuestion: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all 0.2s ease',
    color: '#1e293b',
  },
  faqQuestionContent: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  faqQuestionText: { flex: 1 },
  faqTags: { display: 'flex', gap: '6px' },
  faqTag: { fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 400 },
  faqIcon: { color: '#94a3b8', flexShrink: 0 },
  faqAnswer: { padding: '0 0 16px 0', lineHeight: '1.7', fontSize: '14px' },
  steps: { marginTop: '12px', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  stepsTitle: { fontSize: '13px', fontWeight: 600, marginBottom: '8px' },
  stepsList: { margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' },
  faqMeta: { display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', alignItems: 'center' },
  faqCategory: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' },
  faqUseful: { padding: '4px 12px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease', marginLeft: 'auto' },
  noResults: { textAlign: 'center', padding: '40px 20px' },
  noResultsIcon: { color: '#cbd5e1', marginBottom: '16px' },
  noResultsTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '8px' },
  noResultsDesc: { fontSize: '14px', marginBottom: '16px' },
  supportSection: {
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  contactMethods: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  contactIcon: { color: '#059669', flexShrink: 0 },
  contactLabel: { fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  contactValue: { fontSize: '14px', fontWeight: 600 },
  contactDesc: { fontSize: '11px', marginTop: '4px' },
};