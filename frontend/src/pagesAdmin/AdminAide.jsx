// src/pagesAdmin/AdminAide.jsx - Version avec charte graphique
import { useState, useEffect } from 'react';
import {
  HelpCircle, Search, Mail, Phone, MessageCircle, FileText,
  Video, BookOpen, Users, Settings, Shield, Calendar, Clock,
  ChevronDown, ChevronUp, Send, CheckCircle, ArrowRight,
  Download, Printer, ExternalLink, X, Filter, Star, ThumbsUp,
  ThumbsDown, Link, Copy, Award, Zap
} from 'lucide-react';

export default function AdminAide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const categories = [
    { id: 'all', name: 'Tous', icon: HelpCircle, color: '#2563eb' },
    { id: 'profs', name: 'Professeurs', icon: Users, color: '#7c3aed' },
    { id: 'edt', name: 'Emploi du temps', icon: Calendar, color: '#059669' },
    { id: 'securite', name: 'Sécurité', icon: Shield, color: '#dc2626' },
    { id: 'parametres', name: 'Paramètres', icon: Settings, color: '#f59e0b' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'profs',
      question: "Comment ajouter un nouveau professeur ?",
      answer: "Pour ajouter un nouveau professeur, allez dans la section 'Professeurs' puis cliquez sur 'Ajouter un professeur'. Remplissez les informations requises (nom, email, spécialité) et validez. Le professeur recevra un email avec ses identifiants de connexion.",
      steps: [
        "Allez dans le menu latéral → Professeurs",
        "Cliquez sur le bouton 'Ajouter un professeur'",
        "Remplissez le formulaire avec les informations",
        "Cliquez sur 'Enregistrer' pour finaliser"
      ],
      tags: ['ajout', 'professeur', 'inscription']
    },
    {
      id: 2,
      category: 'edt',
      question: "Comment gérer les disponibilités des professeurs ?",
      answer: "Dans la section 'Disponibilités', vous pouvez visualiser toutes les disponibilités des professeurs. Vous pouvez filtrer par professeur, par jour ou par matière. Pour modifier une disponibilité, cliquez dessus et ajustez les horaires.",
      steps: [
        "Accédez à la section 'Disponibilités'",
        "Utilisez les filtres pour rechercher",
        "Cliquez sur une disponibilité pour la modifier",
        "Confirmez les changements"
      ],
      tags: ['disponibilité', 'professeur', 'horaire']
    },
    {
      id: 3,
      category: 'edt',
      question: "Comment créer un emploi du temps ?",
      answer: "Rendez-vous dans 'Emploi du temps', sélectionnez un niveau et une période. Utilisez l'interface intuitive pour assigner les cours aux créneaux horaires. Le système vérifiera automatiquement les conflits de disponibilité.",
      steps: [
        "Allez dans 'Emploi du temps'",
        "Sélectionnez le niveau et la semaine",
        "Assignez les cours dans les créneaux",
        "Vérifiez les conflits",
        "Publiez l'emploi du temps"
      ],
      tags: ['emploi', 'cours', 'planification']
    },
    {
      id: 4,
      category: 'profs',
      question: "Comment gérer les salles et leurs ressources ?",
      answer: "Dans 'Salles', vous pouvez ajouter, modifier ou supprimer des salles. Chaque salle peut avoir des ressources spécifiques (projecteur, tableau interactif, etc.). Vous pouvez également vérifier la disponibilité des salles en temps réel.",
      steps: [
        "Accédez à 'Salles'",
        "Ajoutez une nouvelle salle",
        "Configurez les ressources",
        "Vérifiez les disponibilités"
      ],
      tags: ['salle', 'ressource', 'disponibilité']
    },
    {
      id: 5,
      category: 'edt',
      question: "Comment exporter les données ?",
      answer: "Dans chaque section (Professeurs, Étudiants, Emploi du temps), vous trouverez un bouton 'Exporter' en haut à droite. Vous pouvez exporter au format Excel, PDF ou CSV selon vos besoins.",
      steps: [
        "Allez dans la section souhaitée",
        "Cliquez sur 'Exporter'",
        "Choisissez le format souhaité",
        "Téléchargez le fichier"
      ],
      tags: ['export', 'données', 'PDF']
    },
    {
      id: 6,
      category: 'securite',
      question: "Comment réinitialiser un mot de passe utilisateur ?",
      answer: "Allez dans le profil de l'utilisateur concerné, cliquez sur 'Réinitialiser le mot de passe'. Un email automatique sera envoyé avec un lien de réinitialisation sécurisé et valable 24h.",
      steps: [
        "Trouvez l'utilisateur dans la liste",
        "Cliquez sur son profil",
        "Sélectionnez 'Réinitialiser mot de passe'",
        "Confirmez l'action"
      ],
      tags: ['mot de passe', 'réinitialisation', 'sécurité']
    },
    {
      id: 7,
      category: 'parametres',
      question: "Comment configurer les notifications ?",
      answer: "Dans 'Paramètres', allez dans la section 'Notifications'. Vous pouvez activer ou désactiver les notifications par email, les notifications push et le résumé quotidien selon vos préférences.",
      steps: [
        "Allez dans 'Paramètres'",
        "Cliquez sur 'Notifications'",
        "Activez/désactivez les options",
        "Sauvegardez les changements"
      ],
      tags: ['notification', 'email', 'push']
    },
    {
      id: 8,
      category: 'securite',
      question: "Comment activer l'authentification à deux facteurs ?",
      answer: "Dans 'Paramètres', section 'Sécurité', activez l'option 'Authentification à deux facteurs'. Vous devrez scanner un QR code avec une application d'authentification comme Google Authenticator.",
      steps: [
        "Allez dans 'Paramètres' → 'Sécurité'",
        "Activez l'authentification à deux facteurs",
        "Scannez le QR code",
        "Confirmez le code de vérification"
      ],
      tags: ['2FA', 'sécurité', 'authentification']
    }
  ];

  const tutorials = [
    {
      title: "Guide d'administration complet",
      icon: BookOpen,
      duration: "25 min",
      type: "PDF",
      size: "2.4 MB",
      link: "#",
      popular: true
    },
    {
      title: "Gestion des utilisateurs",
      icon: Users,
      duration: "10 min",
      type: "Vidéo",
      link: "#",
      popular: false
    },
    {
      title: "Configuration de la sécurité",
      icon: Shield,
      duration: "8 min",
      type: "Article",
      link: "#",
      popular: false
    },
    {
      title: "Planification des cours",
      icon: Calendar,
      duration: "12 min",
      type: "Vidéo",
      link: "#",
      popular: true
    },
    {
      title: "Export et rapports",
      icon: Download,
      duration: "5 min",
      type: "Tutoriel",
      link: "#",
      popular: false
    },
    {
      title: "API et intégrations",
      icon: Settings,
      duration: "15 min",
      type: "Documentation",
      link: "#",
      popular: false
    }
  ];

  const popularFaqs = faqs.filter(f => f.tags?.includes('professeur') || f.tags?.includes('emploi'));

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSendSupport = () => {
    if (supportMessage.trim()) {
      setMessageSent(true);
      setSupportMessage("");
      setTimeout(() => setMessageSent(false), 3000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    setFeedbackGiven(type);
    setTimeout(() => setFeedbackGiven(null), 3000);
  };

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <HelpCircle size={40} style={styles.icon} />
        </div>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Centre d'aide</h1>
          <p style={styles.subtitle}>Trouvez des réponses et du support pour vos questions</p>
        </div>
        <button onClick={handleCopyLink} style={styles.copyButton}>
          <Link size={16} />
          {copied ? 'Copié !' : 'Partager'}
        </button>
      </div>

      {/* Barre de recherche */}
      <div style={styles.searchContainer}>
        <Search size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher dans l'aide..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          aria-label="Rechercher dans l'aide"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
            <X size={16} />
          </button>
        )}
        <kbd style={styles.searchShortcut}>⌘K</kbd>
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
                backgroundColor: isActive ? cat.color : 'white',
                color: isActive ? 'white' : '#475569',
                borderColor: isActive ? cat.color : '#e2e8f0',
                boxShadow: isActive ? `0 4px 12px ${cat.color}40` : 'none'
              }}
            >
              <Icon size={16} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Résultats */}
      {searchTerm && (
        <div style={styles.searchResults}>
          <span>{filteredFaqs.length} résultat(s) trouvé(s)</span>
          {filteredFaqs.length === 0 && (
            <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      <div style={styles.grid}>
        {/* Section FAQ */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <MessageCircle size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Foire aux questions</h2>
              <p style={styles.sectionDesc}>Les réponses aux questions les plus fréquentes</p>
            </div>
            <span style={styles.sectionBadge}>{filteredFaqs.length} questions</span>
          </div>

          <div style={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => {
                const category = categories.find(c => c.id === faq.category);
                return (
                  <div key={faq.id} style={styles.faqItem}>
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      style={styles.faqQuestion}
                    >
                      <div style={styles.faqQuestionContent}>
                        <span style={styles.faqQuestionText}>{faq.question}</span>
                        {faq.tags && (
                          <div style={styles.faqTags}>
                            {faq.tags.slice(0, 2).map(tag => (
                              <span key={tag} style={styles.faqTag}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {openFaq === faq.id ? <ChevronUp size={20} style={styles.faqIcon} /> : <ChevronDown size={20} style={styles.faqIcon} />}
                    </button>
                    {openFaq === faq.id && (
                      <div style={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                        {faq.steps && (
                          <div style={styles.steps}>
                            <p style={styles.stepsTitle}>📝 Étapes à suivre :</p>
                            <ol style={styles.stepsList}>
                              {faq.steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        <div style={styles.faqMeta}>
                          <span style={styles.faqCategory}>
                            <Users size={12} />
                            {category?.name || 'Général'}
                          </span>
                          <button style={styles.faqUseful}>👍 Utile</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={styles.noResults}>
                <HelpCircle size={48} style={styles.noResultsIcon} />
                <p style={styles.noResultsTitle}>Aucun résultat trouvé</p>
                <p style={styles.noResultsDesc}>Aucune question ne correspond à "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tutoriels populaires */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <BookOpen size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Tutoriels et guides</h2>
              <p style={styles.sectionDesc}>Ressources pour vous accompagner</p>
            </div>
            <Award size={16} style={styles.popularIcon} />
          </div>

          <div style={styles.tutorialsGrid}>
            {tutorials.map((tutorial, index) => {
              const Icon = tutorial.icon;
              return (
                <div key={index} style={styles.tutorialCard}>
                  <div style={styles.tutorialIcon}>
                    <Icon size={24} />
                  </div>
                  <div style={styles.tutorialContent}>
                    <h3 style={styles.tutorialTitle}>
                      {tutorial.title}
                      {tutorial.popular && <span style={styles.popularBadge}>⭐ Populaire</span>}
                    </h3>
                    <div style={styles.tutorialMeta}>
                      <span style={styles.tutorialType}>{tutorial.type}</span>
                      <span style={styles.tutorialDuration}>
                        <Clock size={12} />
                        {tutorial.duration}
                      </span>
                      {tutorial.size && (
                        <span style={styles.tutorialSize}>{tutorial.size}</span>
                      )}
                    </div>
                  </div>
                  <button style={styles.tutorialButton}>
                    <ExternalLink size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div style={styles.supportSection}>
          <div style={styles.sectionHeader}>
            <Mail size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Contacter le support</h2>
              <p style={styles.sectionDesc}>Besoin d'aide supplémentaire ?</p>
            </div>
            <span style={styles.supportStatus}>🟢 Disponible</span>
          </div>

          <div style={styles.contactMethods}>
            <div style={styles.contactCard}>
              <Mail size={20} style={styles.contactIcon} />
              <div>
                <div style={styles.contactLabel}>Email</div>
                <div style={styles.contactValue}>support@eni-fianarantsoa.mg</div>
                <div style={styles.contactDesc}>Réponse sous 24h</div>
              </div>
            </div>

            <div style={styles.contactCard}>
              <Phone size={20} style={styles.contactIcon} />
              <div>
                <div style={styles.contactLabel}>Téléphone</div>
                <div style={styles.contactValue}>+261 34 00 000 00</div>
                <div style={styles.contactDesc}>Lun-Ven, 9h-17h</div>
              </div>
            </div>

            <div style={styles.contactCard}>
              <MessageCircle size={20} style={styles.contactIcon} />
              <div>
                <div style={styles.contactLabel}>Chat en direct</div>
                <div style={styles.contactValue}>Disponible maintenant</div>
                <div style={styles.contactDesc}>Temps de réponse : 5 min</div>
              </div>
            </div>
          </div>

          <div style={styles.supportForm}>
            <h3 style={styles.formTitle}>Envoyer un message</h3>
            <textarea
              placeholder="Décrivez votre problème ou votre question en détail..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              style={styles.textarea}
              rows="4"
            />
            <div style={styles.formActions}>
              <button onClick={handleSendSupport} style={styles.sendButton}>
                <Send size={16} />
                Envoyer
              </button>
              <button style={styles.printButton}>
                <Printer size={16} />
                Imprimer
              </button>
            </div>
            {messageSent && (
              <div style={styles.successMessage}>
                <CheckCircle size={16} />
                Message envoyé avec succès ! Nous vous répondrons rapidement.
              </div>
            )}
          </div>
        </div>

        {/* Ressources utiles */}
        <div style={styles.resourcesSection}>
          <div style={styles.sectionHeader}>
            <Zap size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Ressources utiles</h2>
              <p style={styles.sectionDesc}>Liens et documents pour aller plus loin</p>
            </div>
          </div>

          <div style={styles.resourcesList}>
            <a href="#" style={styles.resourceLink}>
              <FileText size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Documentation technique</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Video size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Tutoriels vidéo complets</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Users size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Communauté d'utilisateurs</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Settings size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Notes de mise à jour</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Download size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Télécharger le guide PDF</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
          </div>

          <div style={styles.feedbackCard}>
            <p style={styles.feedbackText}>Cette page vous a-t-elle été utile ?</p>
            <div style={styles.feedbackButtons}>
              <button 
                onClick={() => handleFeedback('yes')} 
                style={{
                  ...styles.feedbackButton,
                  backgroundColor: feedbackGiven === 'yes' ? '#10b981' : 'white',
                  color: feedbackGiven === 'yes' ? 'white' : '#475569'
                }}
              >
                <ThumbsUp size={14} />
                Oui
              </button>
              <button 
                onClick={() => handleFeedback('no')} 
                style={{
                  ...styles.feedbackButton,
                  backgroundColor: feedbackGiven === 'no' ? '#ef4444' : 'white',
                  color: feedbackGiven === 'no' ? 'white' : '#475569'
                }}
              >
                <ThumbsDown size={14} />
                Non
              </button>
            </div>
            {feedbackGiven && (
              <p style={styles.feedbackThankYou}>
                Merci pour votre retour !
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 32px',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '28px 32px',
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #7c3aed 100%)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
  },
  headerIcon: {
    background: 'rgba(255,255,255,0.2)',
    padding: '14px',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
  },
  icon: {
    color: 'white',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: '0 0 4px 0',
    fontFamily: '"Poppins", "Inter", sans-serif',
  },
  subtitle: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '40px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  },

  // Search
  searchContainer: {
    position: 'relative',
    marginBottom: '24px',
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
    border: '2px solid #e2e8f0',
    borderRadius: '14px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    color: '#1e293b',
    outline: 'none',
  },
  clearSearch: {
    position: 'absolute',
    right: '60px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
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
    background: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#64748b',
    fontFamily: 'monospace',
    fontWeight: 500,
  },

  // Categories
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
    backgroundColor: 'white',
    color: '#475569',
  },

  // Results
  searchResults: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#64748b',
  },
  clearButton: {
    padding: '6px 14px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#475569',
    transition: 'all 0.2s ease',
  },

  // Grid
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // Section
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
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
  sectionIcon: {
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },
  sectionBadge: {
    marginLeft: 'auto',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  popularIcon: {
    marginLeft: 'auto',
    color: '#f59e0b',
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

  // FAQ
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  faqItem: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s ease',
  },
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
    color: '#1e293b',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  faqQuestionContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  faqQuestionText: {
    flex: 1,
  },
  faqTags: {
    display: 'flex',
    gap: '6px',
  },
  faqTag: {
    fontSize: '10px',
    padding: '2px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    color: '#64748b',
    fontWeight: 400,
  },
  faqIcon: {
    color: '#94a3b8',
    flexShrink: 0,
  },
  faqAnswer: {
    padding: '0 0 16px 0',
    color: '#475569',
    lineHeight: '1.7',
    fontSize: '14px',
  },
  steps: {
    marginTop: '12px',
    padding: '14px 18px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  stepsTitle: {
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#1e293b',
  },
  stepsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.8',
  },
  faqMeta: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
    alignItems: 'center',
  },
  faqCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  faqUseful: {
    padding: '4px 12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#475569',
    transition: 'all 0.2s ease',
    marginLeft: 'auto',
  },

  // No Results
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
  },
  noResultsIcon: {
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  noResultsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '8px',
  },
  noResultsDesc: {
    fontSize: '14px',
    marginBottom: '16px',
  },

  // Tutorials
  tutorialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  tutorialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: '#f8fafc',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  tutorialIcon: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eff6ff',
    borderRadius: '10px',
    color: '#2563eb',
    flexShrink: 0,
  },
  tutorialContent: {
    flex: 1,
    minWidth: 0,
  },
  tutorialTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  popularBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    backgroundColor: '#fef3c7',
    color: '#d97706',
    borderRadius: '12px',
    fontWeight: 500,
  },
  tutorialMeta: {
    display: 'flex',
    gap: '10px',
    fontSize: '11px',
    color: '#64748b',
    flexWrap: 'wrap',
  },
  tutorialType: {
    padding: '2px 8px',
    background: '#e2e8f0',
    borderRadius: '4px',
  },
  tutorialDuration: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  tutorialSize: {
    color: '#94a3b8',
  },
  tutorialButton: {
    padding: '6px 10px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    color: '#475569',
    flexShrink: 0,
  },

  // Support
  supportSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  contactMethods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  contactIcon: {
    color: '#2563eb',
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contactValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  contactDesc: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },

  // Support Form
  supportForm: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '12px',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  printButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    transition: 'all 0.2s ease',
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    background: '#d1fae5',
    borderRadius: '10px',
    marginTop: '12px',
    fontSize: '13px',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },

  // Resources
  resourcesSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  resourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
  },
  resourceLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#1e293b',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  resourceIcon: {
    color: '#2563eb',
  },
  resourceText: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
  },
  resourceArrow: {
    color: '#94a3b8',
    transition: 'all 0.2s ease',
  },

  // Feedback
  feedbackCard: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  feedbackText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '12px',
  },
  feedbackButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  feedbackButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    color: '#475569',
  },
  feedbackThankYou: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#10b981',
    fontWeight: 500,
  },
};

// Animations et styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .search-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    }

    .category-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .faq-question:hover {
      color: #2563eb;
    }

    .faq-question:hover .faq-icon {
      color: #2563eb;
    }

    .tutorial-card:hover {
      background: white;
      border-color: #2563eb;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
      transform: translateY(-2px);
    }

    .tutorial-button:hover {
      background: #eff6ff;
      color: #2563eb;
      border-color: #2563eb;
    }

    .contact-card:hover {
      background: white;
      border-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    }

    .resource-link:hover {
      background: white;
      border-color: #2563eb;
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    }

    .resource-link:hover .resource-arrow {
      color: #2563eb;
      transform: translateX(4px);
    }

    .send-button:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .print-button:hover {
      background: #f1f5f9;
    }

    .copy-button:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }

    .clear-search:hover {
      background: #f1f5f9;
    }

    .clear-button:hover {
      background: #e2e8f0;
    }

    .faq-useful:hover {
      background: #e2e8f0;
    }

    .feedback-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      background-color: white;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .header {
        flex-direction: column;
        text-align: center;
        padding: 20px;
      }
      
      .header-content {
        width: 100%;
      }
      
      .copy-button {
        align-self: center;
      }
      
      .categories {
        justify-content: center;
      }
      
      .contact-methods {
        grid-template-columns: 1fr;
      }
      
      .tutorials-grid {
        grid-template-columns: 1fr;
      }
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .section-badge, .popular-icon, .support-status {
        margin-left: 0;
      }
      
      .faq-question-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      
      .faq-meta {
        flex-wrap: wrap;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .search-shortcut {
        display: none;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}