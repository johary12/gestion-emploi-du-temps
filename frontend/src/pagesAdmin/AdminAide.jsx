// src/pagesAdmin/AdminAide.jsx
import { useState } from 'react';
import {
  HelpCircle, Search, Mail, Phone, MessageCircle, FileText,
  Video, BookOpen, Users, Settings, Shield, Calendar, Clock,
  ChevronDown, ChevronUp, Send, CheckCircle, ArrowRight,
  Download, Printer, ExternalLink
} from 'lucide-react';

export default function AdminAide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous', icon: HelpCircle },
    { id: 'profs', name: 'Professeurs', icon: Users },
    { id: 'edt', name: 'Emploi du temps', icon: Calendar },
    { id: 'securite', name: 'Sécurité', icon: Shield },
    { id: 'parametres', name: 'Paramètres', icon: Settings }
  ];

  const faqs = [
    {
      id: 1,
      category: 'profs',
      question: "Comment ajouter un nouveau professeur ?",
      answer: "Pour ajouter un nouveau professeur, allez dans la section 'Professeurs' puis cliquez sur 'Ajouter un professeur'. Remplissez les informations requises (nom, email, matière) et validez. Le professeur recevra un email avec ses identifiants de connexion.",
      steps: [
        "Allez dans le menu latéral → Professeurs",
        "Cliquez sur le bouton 'Ajouter un professeur'",
        "Remplissez le formulaire",
        "Cliquez sur 'Enregistrer'"
      ]
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
      ]
    },
    {
      id: 3,
      category: 'edt',
      question: "Comment créer un emploi du temps ?",
      answer: "Rendez-vous dans 'Emploi du temps', sélectionnez une classe et une période. Utilisez l'interface drag-and-drop pour assigner les cours aux créneaux horaires. Le système vérifiera automatiquement les conflits de disponibilité.",
      steps: [
        "Allez dans 'Emploi du temps'",
        "Sélectionnez la classe et la semaine",
        "Glissez-déposez les cours dans les créneaux",
        "Vérifiez les conflits",
        "Publiez l'emploi du temps"
      ]
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
      ]
    },
    {
      id: 5,
      category: 'edt',
      question: "Comment exporter les données ?",
      answer: "Dans chaque section (Professeurs, Étudiants, Emploi du temps), vous trouverez un bouton 'Exporter' en haut à droite. Vous pouvez exporter au format Excel, PDF ou CSV selon vos besoins.",
      steps: [
        "Allez dans la section souhaitée",
        "Cliquez sur 'Exporter'",
        "Choisissez le format",
        "Téléchargez le fichier"
      ]
    },
    {
      id: 6,
      category: 'securite',
      question: "Comment réinitialiser un mot de passe utilisateur ?",
      answer: "Allez dans le profil de l'utilisateur concerné, cliquez sur 'Réinitialiser le mot de passe'. Un email automatique sera envoyé avec un lien de réinitialisation sécurisé.",
      steps: [
        "Trouvez l'utilisateur dans la liste",
        "Cliquez sur son profil",
        "Sélectionnez 'Réinitialiser mot de passe'",
        "Confirmez l'action"
      ]
    }
  ];

  const tutorials = [
    {
      title: "Guide d'administration complet",
      icon: BookOpen,
      duration: "25 min",
      type: "PDF",
      size: "2.4 MB",
      link: "#"
    },
    {
      title: "Gestion des utilisateurs",
      icon: Users,
      duration: "10 min",
      type: "Vidéo",
      link: "#"
    },
    {
      title: "Configuration de la sécurité",
      icon: Shield,
      duration: "8 min",
      type: "Article",
      link: "#"
    },
    {
      title: "Planification des cours",
      icon: Calendar,
      duration: "12 min",
      type: "Vidéo",
      link: "#"
    },
    {
      title: "Export et rapports",
      icon: Download,
      duration: "5 min",
      type: "Tutoriel",
      link: "#"
    },
    {
      title: "API et intégrations",
      icon: Settings,
      duration: "15 min",
      type: "Documentation",
      link: "#"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <HelpCircle size={40} style={styles.icon} />
        </div>
        <div>
          <h1 style={styles.title}>Centre d'aide</h1>
          <p style={styles.subtitle}>Trouvez des réponses et du support pour vos questions</p>
        </div>
      </div>

      {/* Barre de recherche avec guidage */}
      <div style={styles.searchContainer}>
        <Search size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher dans l'aide..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          aria-label="Rechercher"
        />
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
                background: isActive ? '#667eea' : 'white',
                color: isActive ? 'white' : '#475569',
                borderColor: isActive ? '#667eea' : '#e2e8f0'
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
        <div style={styles.searchResults}>
          <p>{filteredFaqs.length} résultat(s) trouvé(s)</p>
        </div>
      )}

      <div style={styles.grid}>
        {/* Section FAQ */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <MessageCircle size={24} style={styles.sectionIcon} />
            Foire aux questions
          </h2>

          <div style={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => (
                <div key={faq.id} style={styles.faqItem}>
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    style={styles.faqQuestion}
                  >
                    <span style={styles.faqQuestionText}>{faq.question}</span>
                    {openFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {openFaq === faq.id && (
                    <div style={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                      {faq.steps && (
                        <div style={styles.steps}>
                          <p style={styles.stepsTitle}>Étapes à suivre :</p>
                          <ol style={styles.stepsList}>
                            {faq.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.noResults}>
                <HelpCircle size={32} />
                <p>Aucun résultat trouvé pour "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section Tutoriels */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <BookOpen size={24} style={styles.sectionIcon} />
            Tutoriels et guides
          </h2>

          <div style={styles.tutorialsGrid}>
            {tutorials.map((tutorial, index) => {
              const Icon = tutorial.icon;
              return (
                <div key={index} style={styles.tutorialCard}>
                  <div style={styles.tutorialIcon}>
                    <Icon size={24} />
                  </div>
                  <div style={styles.tutorialContent}>
                    <h3 style={styles.tutorialTitle}>{tutorial.title}</h3>
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
          <h2 style={styles.sectionTitle}>
            <Mail size={24} style={styles.sectionIcon} />
            Contacter le support
          </h2>

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
          </div>

          <div style={styles.supportForm}>
            <h3 style={styles.formTitle}>Envoyer un message</h3>
            <textarea
              placeholder="Décrivez votre problème ou votre question..."
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
          <h2 style={styles.sectionTitle}>
            <Video size={24} style={styles.sectionIcon} />
            Ressources utiles
          </h2>

          <div style={styles.resourcesList}>
            <a href="#" style={styles.resourceLink}>
              <FileText size={16} />
              Documentation technique
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Video size={16} />
              Tutoriels vidéo complets
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Users size={16} />
              Communauté d'utilisateurs
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Settings size={16} />
              Notes de mise à jour
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={styles.resourceLink}>
              <Download size={16} />
              Télécharger le guide PDF
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
          </div>

          <div style={styles.feedbackCard}>
            <p style={styles.feedbackText}>Cette page vous a-t-elle été utile ?</p>
            <div style={styles.feedbackButtons}>
              <button style={styles.feedbackButton}>👍 Oui</button>
              <button style={styles.feedbackButton}>👎 Non</button>
            </div>
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
    padding: '24px 32px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    color: 'white'
  },
  headerIcon: {
    background: 'rgba(255,255,255,0.2)',
    padding: '12px',
    borderRadius: '16px'
  },
  icon: {
    color: 'white'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '24px'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    transition: '0.2s'
  },
  searchShortcut: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '4px 8px',
    background: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#64748b',
    fontFamily: 'monospace'
  },
  categories: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: '0.2s',
    fontSize: '13px',
    fontWeight: '500'
  },
  searchResults: {
    marginBottom: '16px',
    fontSize: '13px',
    color: '#64748b'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9'
  },
  sectionIcon: {
    color: '#667eea'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  faqItem: {
    borderBottom: '1px solid #f1f5f9'
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
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'left'
  },
  faqQuestionText: {
    flex: 1
  },
  faqAnswer: {
    padding: '0 0 16px 0',
    color: '#475569',
    lineHeight: '1.6',
    fontSize: '14px'
  },
  steps: {
    marginTop: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  stepsTitle: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1e293b'
  },
  stepsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#64748b'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  },
  clearButton: {
    marginTop: '12px',
    padding: '6px 12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  tutorialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px'
  },
  tutorialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '12px',
    transition: '0.2s'
  },
  tutorialIcon: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e0e7ff',
    borderRadius: '10px',
    color: '#667eea'
  },
  tutorialContent: {
    flex: 1
  },
  tutorialTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 6px 0'
  },
  tutorialMeta: {
    display: 'flex',
    gap: '10px',
    fontSize: '11px',
    color: '#64748b',
    flexWrap: 'wrap'
  },
  tutorialType: {
    padding: '2px 8px',
    background: '#e2e8f0',
    borderRadius: '4px'
  },
  tutorialDuration: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  tutorialSize: {
    color: '#94a3b8'
  },
  tutorialButton: {
    padding: '6px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  supportSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  contactMethods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  contactIcon: {
    color: '#667eea'
  },
  contactLabel: {
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '2px'
  },
  contactValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b'
  },
  contactDesc: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px'
  },
  supportForm: {
    marginTop: '16px'
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '12px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px'
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  printButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#d1fae5',
    borderRadius: '8px',
    marginTop: '12px',
    fontSize: '13px',
    color: '#065f46'
  },
  resourcesSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  resourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px'
  },
  resourceLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#1e293b',
    transition: '0.2s'
  },
  resourceArrow: {
    marginLeft: 'auto',
    opacity: 0,
    transition: '0.2s'
  },
  feedbackCard: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'center'
  },
  feedbackText: {
    fontSize: '14px',
    marginBottom: '12px',
    color: '#64748b'
  },
  feedbackButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  feedbackButton: {
    padding: '6px 16px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};