// src/pagesAdmin/AdminAide.jsx - Version avec mode sombre
import { useState, useEffect } from 'react';
import {
  HelpCircle, Search, Mail, Phone, MessageCircle, FileText,
  Video, BookOpen, Users, Settings, Shield, Calendar, Clock,
  ChevronDown, ChevronUp, Send, CheckCircle, ArrowRight,
  Download, Printer, ExternalLink, X, Filter, Star, ThumbsUp,
  ThumbsDown, Link, Copy, Award, Zap, AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AdminAide() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [downloading, setDownloading] = useState(null);

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
      file: "/guides/guide_admin_complet.pdf",
      popular: true
    },
    {
      title: "Gestion des utilisateurs",
      icon: Users,
      duration: "10 min",
      type: "Vidéo",
      file: "/guides/gestion_utilisateurs.mp4",
      popular: false
    },
    {
      title: "Configuration de la sécurité",
      icon: Shield,
      duration: "8 min",
      type: "Article",
      file: "/guides/securite.pdf",
      popular: false
    },
    {
      title: "Planification des cours",
      icon: Calendar,
      duration: "12 min",
      type: "Vidéo",
      file: "/guides/planification_cours.mp4",
      popular: true
    },
    {
      title: "Export et rapports",
      icon: Download,
      duration: "5 min",
      type: "Tutoriel",
      file: "/guides/export_rapports.pdf",
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

  // Fonction de téléchargement de fichier
  const handleDownload = (tutorial, index) => {
    setDownloading(index);
    
    setTimeout(() => {
      const content = `Ceci est le contenu du fichier: ${tutorial.title}\n\n`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tutorial.title.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setDownloading(null);
    }, 1500);
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--bg-primary, #f8fafc)',
      color: 'var(--text-primary, #1e293b)',
    }}>
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
          style={{
            ...styles.searchInput,
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderColor: 'var(--border-color, #e2e8f0)',
            color: 'var(--text-primary, #1e293b)',
          }}
          aria-label="Rechercher dans l'aide"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{
            ...styles.clearSearch,
            color: 'var(--text-muted, #94a3b8)',
          }}>
            <X size={16} />
          </button>
        )}
        <kbd style={{
          ...styles.searchShortcut,
          backgroundColor: 'var(--bg-input, #f1f5f9)',
          color: 'var(--text-secondary, #64748b)',
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
                backgroundColor: isActive ? cat.color : 'var(--bg-card, #ffffff)',
                color: isActive ? 'white' : 'var(--text-secondary, #475569)',
                borderColor: isActive ? cat.color : 'var(--border-color, #e2e8f0)',
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
        <div style={{
          ...styles.searchResults,
          color: 'var(--text-secondary, #64748b)',
        }}>
          <span>{filteredFaqs.length} résultat(s) trouvé(s)</span>
          {filteredFaqs.length === 0 && (
            <button onClick={() => setSearchTerm('')} style={{
              ...styles.clearButton,
              backgroundColor: 'var(--bg-input, #f1f5f9)',
              color: 'var(--text-secondary, #475569)',
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
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <div style={{
            ...styles.sectionHeader,
            borderBottom: '2px solid var(--border-color, #f1f5f9)',
          }}>
            <MessageCircle size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={{
                ...styles.sectionTitle,
                color: 'var(--text-primary, #1e293b)',
              }}>Foire aux questions</h2>
              <p style={{
                ...styles.sectionDesc,
                color: 'var(--text-secondary, #64748b)',
              }}>Les réponses aux questions les plus fréquentes</p>
            </div>
            <span style={{
              ...styles.sectionBadge,
              backgroundColor: 'var(--bg-input, #eff6ff)',
              color: '#2563eb',
            }}>{filteredFaqs.length} questions</span>
          </div>

          <div style={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => {
                const category = categories.find(c => c.id === faq.category);
                return (
                  <div key={faq.id} style={{
                    ...styles.faqItem,
                    borderBottom: '1px solid var(--border-color, #f1f5f9)',
                  }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      style={{
                        ...styles.faqQuestion,
                        color: 'var(--text-primary, #1e293b)',
                      }}
                    >
                      <div style={styles.faqQuestionContent}>
                        <span style={styles.faqQuestionText}>{faq.question}</span>
                        {faq.tags && (
                          <div style={styles.faqTags}>
                            {faq.tags.slice(0, 2).map(tag => (
                              <span key={tag} style={{
                                ...styles.faqTag,
                                backgroundColor: 'var(--bg-input, #f1f5f9)',
                                color: 'var(--text-secondary, #64748b)',
                              }}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {openFaq === faq.id ? <ChevronUp size={20} style={styles.faqIcon} /> : <ChevronDown size={20} style={styles.faqIcon} />}
                    </button>
                    {openFaq === faq.id && (
                      <div style={{
                        ...styles.faqAnswer,
                        color: 'var(--text-secondary, #475569)',
                      }}>
                        <p>{faq.answer}</p>
                        {faq.steps && (
                          <div style={{
                            ...styles.steps,
                            backgroundColor: 'var(--bg-input, #f8fafc)',
                            borderColor: 'var(--border-color, #e2e8f0)',
                          }}>
                            <p style={{
                              ...styles.stepsTitle,
                              color: 'var(--text-primary, #1e293b)',
                            }}>📝 Étapes à suivre :</p>
                            <ol style={{
                              ...styles.stepsList,
                              color: 'var(--text-secondary, #64748b)',
                            }}>
                              {faq.steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        <div style={{
                          ...styles.faqMeta,
                          borderTop: '1px solid var(--border-color, #f1f5f9)',
                        }}>
                          <span style={{
                            ...styles.faqCategory,
                            color: 'var(--text-muted, #94a3b8)',
                          }}>
                            <Users size={12} />
                            {category?.name || 'Général'}
                          </span>
                          <button style={{
                            ...styles.faqUseful,
                            backgroundColor: 'var(--bg-input, #f1f5f9)',
                            color: 'var(--text-secondary, #475569)',
                          }}>👍 Utile</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{
                ...styles.noResults,
                color: 'var(--text-muted, #94a3b8)',
              }}>
                <HelpCircle size={48} style={styles.noResultsIcon} />
                <p style={{
                  ...styles.noResultsTitle,
                  color: 'var(--text-primary, #1e293b)',
                }}>Aucun résultat trouvé</p>
                <p style={{
                  ...styles.noResultsDesc,
                  color: 'var(--text-secondary, #64748b)',
                }}>Aucune question ne correspond à "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} style={{
                  ...styles.clearButton,
                  backgroundColor: 'var(--bg-input, #f1f5f9)',
                  color: 'var(--text-secondary, #475569)',
                }}>
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tutoriels avec téléchargement */}
        <div style={{
          ...styles.section,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <div style={{
            ...styles.sectionHeader,
            borderBottom: '2px solid var(--border-color, #f1f5f9)',
          }}>
            <BookOpen size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={{
                ...styles.sectionTitle,
                color: 'var(--text-primary, #1e293b)',
              }}>Tutoriels et guides</h2>
              <p style={{
                ...styles.sectionDesc,
                color: 'var(--text-secondary, #64748b)',
              }}>Téléchargez les ressources pour vous accompagner</p>
            </div>
            <Award size={16} style={styles.popularIcon} />
          </div>

          <div style={styles.tutorialsGrid}>
            {tutorials.map((tutorial, index) => {
              const Icon = tutorial.icon;
              const isDownloading = downloading === index;
              return (
                <div key={index} style={{
                  ...styles.tutorialCard,
                  backgroundColor: 'var(--bg-input, #f8fafc)',
                  borderColor: 'var(--border-color, #e2e8f0)',
                }}>
                  <div style={{
                    ...styles.tutorialIcon,
                    backgroundColor: 'var(--bg-input, #eff6ff)',
                    color: '#2563eb',
                  }}>
                    <Icon size={24} />
                  </div>
                  <div style={styles.tutorialContent}>
                    <h3 style={{
                      ...styles.tutorialTitle,
                      color: 'var(--text-primary, #1e293b)',
                    }}>
                      {tutorial.title}
                      {tutorial.popular && <span style={styles.popularBadge}>⭐ Populaire</span>}
                    </h3>
                    <div style={{
                      ...styles.tutorialMeta,
                      color: 'var(--text-secondary, #64748b)',
                    }}>
                      <span style={{
                        ...styles.tutorialType,
                        backgroundColor: 'var(--bg-input, #e2e8f0)',
                      }}>{tutorial.type}</span>
                      <span style={styles.tutorialDuration}>
                        <Clock size={12} />
                        {tutorial.duration}
                      </span>
                      {tutorial.size && (
                        <span style={styles.tutorialSize}>{tutorial.size}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(tutorial, index)} 
                    style={{
                      ...styles.tutorialButton,
                      backgroundColor: 'var(--bg-card, #ffffff)',
                      borderColor: 'var(--border-color, #e2e8f0)',
                      color: 'var(--text-secondary, #475569)',
                    }}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <div style={styles.spinnerSmall} />
                    ) : (
                      <Download size={14} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div style={{
          ...styles.supportSection,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <div style={{
            ...styles.sectionHeader,
            borderBottom: '2px solid var(--border-color, #f1f5f9)',
          }}>
            <Mail size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={{
                ...styles.sectionTitle,
                color: 'var(--text-primary, #1e293b)',
              }}>Contacter le support</h2>
              <p style={{
                ...styles.sectionDesc,
                color: 'var(--text-secondary, #64748b)',
              }}>Besoin d'aide supplémentaire ?</p>
            </div>
            <span style={{
              ...styles.supportStatus,
              backgroundColor: 'var(--bg-input, #d1fae5)',
              color: 'var(--text-primary, #065f46)',
            }}>🟢 Disponible</span>
          </div>

          <div style={styles.contactMethods}>
            <div style={{
              ...styles.contactCard,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <Mail size={20} style={styles.contactIcon} />
              <div>
                <div style={{
                  ...styles.contactLabel,
                  color: 'var(--text-secondary, #64748b)',
                }}>Email</div>
                <div style={{
                  ...styles.contactValue,
                  color: 'var(--text-primary, #1e293b)',
                }}>support@eni-fianarantsoa.mg</div>
                <div style={{
                  ...styles.contactDesc,
                  color: 'var(--text-muted, #94a3b8)',
                }}>Réponse sous 24h</div>
              </div>
            </div>

            <div style={{
              ...styles.contactCard,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <Phone size={20} style={styles.contactIcon} />
              <div>
                <div style={{
                  ...styles.contactLabel,
                  color: 'var(--text-secondary, #64748b)',
                }}>Téléphone</div>
                <div style={{
                  ...styles.contactValue,
                  color: 'var(--text-primary, #1e293b)',
                }}>+261 34 00 000 00</div>
                <div style={{
                  ...styles.contactDesc,
                  color: 'var(--text-muted, #94a3b8)',
                }}>Lun-Ven, 9h-17h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ressources utiles */}
        <div style={{
          ...styles.resourcesSection,
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderColor: 'var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px var(--shadow-color, rgba(0,0,0,0.05))',
        }}>
          <div style={{
            ...styles.sectionHeader,
            borderBottom: '2px solid var(--border-color, #f1f5f9)',
          }}>
            <Zap size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={{
                ...styles.sectionTitle,
                color: 'var(--text-primary, #1e293b)',
              }}>Ressources utiles</h2>
              <p style={{
                ...styles.sectionDesc,
                color: 'var(--text-secondary, #64748b)',
              }}>Liens et documents pour aller plus loin</p>
            </div>
          </div>

          <div style={styles.resourcesList}>
            <a href="#" style={{
              ...styles.resourceLink,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              color: 'var(--text-primary, #1e293b)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <FileText size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Documentation technique</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={{
              ...styles.resourceLink,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              color: 'var(--text-primary, #1e293b)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <Video size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Tutoriels vidéo complets</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={{
              ...styles.resourceLink,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              color: 'var(--text-primary, #1e293b)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <Users size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Communauté d'utilisateurs</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={{
              ...styles.resourceLink,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              color: 'var(--text-primary, #1e293b)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <Settings size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Notes de mise à jour</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
            <a href="#" style={{
              ...styles.resourceLink,
              backgroundColor: 'var(--bg-input, #f8fafc)',
              color: 'var(--text-primary, #1e293b)',
              borderColor: 'var(--border-color, #e2e8f0)',
            }}>
              <Download size={16} style={styles.resourceIcon} />
              <span style={styles.resourceText}>Télécharger le guide PDF</span>
              <ArrowRight size={14} style={styles.resourceArrow} />
            </a>
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
  },

  // Results
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

  // Grid
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // Section
  section: {
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
    margin: 0,
  },
  sectionDesc: {
    fontSize: '13px',
    margin: '2px 0 0 0',
  },
  sectionBadge: {
    marginLeft: 'auto',
    padding: '4px 12px',
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
    borderRadius: '12px',
    fontWeight: 400,
  },
  faqIcon: {
    color: '#94a3b8',
    flexShrink: 0,
  },
  faqAnswer: {
    padding: '0 0 16px 0',
    lineHeight: '1.7',
    fontSize: '14px',
  },
  steps: {
    marginTop: '12px',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  stepsTitle: {
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  stepsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
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
  },
  faqUseful: {
    padding: '4px 12px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    marginLeft: 'auto',
  },

  // No Results
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  noResultsIcon: {
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  noResultsTitle: {
    fontSize: '18px',
    fontWeight: 600,
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
    borderRadius: '10px',
    flexShrink: 0,
  },
  tutorialContent: {
    flex: 1,
    minWidth: 0,
  },
  tutorialTitle: {
    fontSize: '14px',
    fontWeight: 600,
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
    flexWrap: 'wrap',
  },
  tutorialType: {
    padding: '2px 8px',
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
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    minWidth: '32px',
    minHeight: '32px',
  },

  // Support
  supportSection: {
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  contactMethods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
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
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contactValue: {
    fontSize: '14px',
    fontWeight: 600,
  },
  contactDesc: {
    fontSize: '11px',
    marginTop: '4px',
  },

  // Resources
  resourcesSection: {
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  resourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  resourceLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
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

  // Spinner
  spinnerSmall: {
    width: '16px',
    height: '16px',
    border: '2px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Animations et styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

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
      background: var(--bg-card, #ffffff) !important;
      border-color: #2563eb !important;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
      transform: translateY(-2px);
    }

    .tutorial-button:hover:not(:disabled) {
      background: #eff6ff !important;
      color: #2563eb !important;
      border-color: #2563eb !important;
    }

    .tutorial-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .contact-card:hover {
      background: var(--bg-card, #ffffff) !important;
      border-color: #2563eb !important;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    }

    .resource-link:hover {
      background: var(--bg-card, #ffffff) !important;
      border-color: #2563eb !important;
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
    }

    .resource-link:hover .resource-arrow {
      color: #2563eb;
      transform: translateX(4px);
    }

    .copy-button:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }

    .clear-search:hover {
      background: var(--hover-bg, #f1f5f9) !important;
    }

    .clear-button:hover {
      background: var(--hover-bg, #e2e8f0) !important;
    }

    .faq-useful:hover {
      background: var(--hover-bg, #e2e8f0) !important;
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
      
      .search-shortcut {
        display: none;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}