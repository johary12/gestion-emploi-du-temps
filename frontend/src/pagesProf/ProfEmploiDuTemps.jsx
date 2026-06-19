// src/pagesProf/ProfEmploiDuTemps.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { edtService } from '../services/api';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Loader2, BookOpen, GraduationCap, School, FileDown, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function toLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0) ? 6 : (day - 1);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Couleurs de la charte graphique (vert)
const COLORS = {
  primary: '#059669',
  primaryLight: '#10b981',
  primaryDark: '#047857',
  primaryBg: '#ecfdf5',
  primaryBgHover: '#d1fae5',
  gradientStart: '#059669',
  gradientEnd: '#047857',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#d1d5db',
  white: '#ffffff',
};

export default function ProfEmploiDuTemps() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStartDate(new Date()));
  const [weekDays, setWeekDays] = useState([]);
  const edtRef = useRef(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (currentWeekStart) {
      updateWeekDays(currentWeekStart);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    if (user?.id) {
      loadCourses();
    }
  }, [currentWeekStart, user]);

  function updateWeekDays(date) {
    if (!date) return;
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + i);
      dates.push({
        date: d,
        dayName: JOURS[i],
        formattedDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        isoDate: toLocalDateString(d),
        fullDate: d
      });
    }
    setWeekDays(dates);
  }

  function previousWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  function goToCurrentWeek() {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  }

  function getWeekRange() {
    if (weekDays.length === 0) return '';
    return `${weekDays[0].formattedDate} - ${weekDays[5].formattedDate}`;
  }

  const loadCourses = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const weekStartStr = toLocalDateString(currentWeekStart);
      
      console.log('📅 Chargement des cours du professeur pour la semaine:', weekStartStr);
      const response = await edtService.getMyScheduleByWeek(weekStartStr);
      
      let data = response.data || [];
      console.log('📚 Cours chargés:', data.length);
      
      setCourses(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cours:', error);
      setError('Impossible de charger votre emploi du temps. Veuillez réessayer.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByDay = (dayName) => {
    return courses.filter(c => c.jour === dayName);
  };

  // Statistiques
  const totalCourses = courses.length;
  const uniqueDays = new Set(courses.map(c => c.jour)).size;

  // Fonction d'exportation PDF
  const exportToPDF = async () => {
    if (!edtRef.current) return;
    
    setExporting(true);
    try {
      // Créer un conteneur temporaire pour l'export
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'fixed';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = '0';
      exportContainer.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
      exportContainer.style.padding = '40px';
      exportContainer.style.width = '1200px';
      exportContainer.style.fontFamily = '"Inter", "Poppins", "Roboto", sans-serif';
      exportContainer.style.color = isDark ? '#f1f5f9' : '#1e293b';
      document.body.appendChild(exportContainer);

      // Copier le contenu de l'EDT
      const edtContent = edtRef.current.cloneNode(true);
      
      // Nettoyer les animations et interactions
      const styleTags = edtContent.querySelectorAll('style');
      styleTags.forEach(tag => tag.remove());
      
      // Ajouter des styles spécifiques pour le PDF
      const pdfStyles = document.createElement('style');
      pdfStyles.textContent = `
        * {
          font-family: "Inter", "Poppins", "Roboto", sans-serif;
        }
        .day-card {
          border: 1px solid ${isDark ? '#475569' : '#d1d5db'} !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          height: 500px !important;
          display: flex !important;
          flex-direction: column !important;
          background: ${isDark ? '#1e293b' : '#ffffff'} !important;
        }
        .day-header {
          padding: 10px 14px !important;
          color: white !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          background: #059669 !important;
        }
        .course-list {
          padding: 10px !important;
          flex: 1 !important;
          overflow-y: visible !important;
        }
        .course-card {
          padding: 10px 12px !important;
          margin-bottom: 6px !important;
          background: ${isDark ? '#0f172a' : '#fafafa'} !important;
          border-radius: 8px !important;
          border: 1px solid ${isDark ? '#334155' : '#e5e7eb'} !important;
        }
        .course-title {
          font-weight: 600 !important;
          font-size: 13px !important;
          color: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
        }
        .course-badge {
          padding: 1px 8px !important;
          background-color: #ecfdf5 !important;
          color: #059669 !important;
          border-radius: 10px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
        }
        .course-info {
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-size: 11px !important;
          color: ${isDark ? '#94a3b8' : '#64748b'} !important;
          margin-top: 2px !important;
        }
        .empty-state {
          text-align: center !important;
          padding: 30px 10px !important;
          color: ${isDark ? '#64748b' : '#94a3b8'} !important;
          font-size: 12px !important;
        }
        .grid {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 12px !important;
          margin-top: 16px !important;
        }
        .header-pdf {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-bottom: 16px !important;
          padding-bottom: 12px !important;
          border-bottom: 2px solid #059669 !important;
        }
        .title-pdf {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
          margin: 0 !important;
        }
        .subtitle-pdf {
          font-size: 14px !important;
          color: ${isDark ? '#94a3b8' : '#64748b'} !important;
          margin: 0 !important;
        }
        .footer-pdf {
          margin-top: 20px !important;
          padding-top: 12px !important;
          border-top: 1px solid ${isDark ? '#334155' : '#e5e7eb'} !important;
          text-align: center !important;
          font-size: 12px !important;
          color: ${isDark ? '#64748b' : '#94a3b8'} !important;
        }
        .stats-pdf {
          display: flex !important;
          gap: 16px !important;
          font-size: 13px !important;
          color: #059669 !important;
        }
        .stat-item {
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .course-header-pdf {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          margin-bottom: 4px !important;
        }
        .course-badge {
          background-color: #ecfdf5 !important;
          color: #059669 !important;
          padding: 1px 10px !important;
          border-radius: 12px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
        }
        .course-info svg {
          display: none !important;
        }
        .day-name {
          font-size: 14px !important;
          font-weight: 700 !important;
        }
        .day-date {
          font-size: 11px !important;
          opacity: 0.85 !important;
        }
        .course-count {
          padding: 1px 8px !important;
          background-color: rgba(255,255,255,0.25) !important;
          border-radius: 20px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }
      `;
      exportContainer.appendChild(pdfStyles);
      exportContainer.appendChild(edtContent);

      // Attendre que le contenu soit rendu
      await new Promise(resolve => setTimeout(resolve, 500));

      // Générer le PDF
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width * 0.75, canvas.height * 0.75]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Télécharger le PDF
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      pdf.save(`Emploi_du_temps_${user?.name || 'professeur'}_${dateStr}.pdf`);

      // Nettoyer
      document.body.removeChild(exportContainer);
    } catch (error) {
      console.error('❌ Erreur lors de l\'exportation PDF:', error);
      alert('Une erreur est survenue lors de l\'exportation du PDF. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  // Fonction d'impression améliorée avec le même rendu que le PDF
  const handlePrint = () => {
    setPrinting(true);
    
    // Créer un conteneur pour l'impression
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'fixed';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '1200px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.padding = '40px';
    printContainer.style.fontFamily = '"Inter", "Poppins", "Roboto", sans-serif';
    printContainer.style.color = '#1e293b';
    document.body.appendChild(printContainer);

    // Copier le contenu de l'EDT
    const edtContent = edtRef.current.cloneNode(true);
    
    // Nettoyer les animations et interactions
    const styleTags = edtContent.querySelectorAll('style');
    styleTags.forEach(tag => tag.remove());
    
    // Ajouter des styles spécifiques pour l'impression
    const printStyles = document.createElement('style');
    printStyles.textContent = `
      * {
        font-family: "Inter", "Poppins", "Roboto", sans-serif !important;
        color: #1e293b !important;
      }
      
      body, html {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      #print-container {
        background: white !important;
      }
      
      .day-card {
        border: 1px solid #d1d5db !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        height: 500px !important;
        display: flex !important;
        flex-direction: column !important;
        background: white !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .day-header {
        padding: 10px 14px !important;
        color: white !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        background: #059669 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .day-header * {
        color: white !important;
      }
      
      .course-list {
        padding: 10px !important;
        flex: 1 !important;
        overflow-y: visible !important;
      }
      
      .course-card {
        padding: 10px 12px !important;
        margin-bottom: 6px !important;
        background: #fafafa !important;
        border-radius: 8px !important;
        border: 1px solid #e5e7eb !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .course-title {
        font-weight: 600 !important;
        font-size: 13px !important;
        color: #1e293b !important;
      }
      
      .course-badge {
        padding: 1px 8px !important;
        background-color: #ecfdf5 !important;
        color: #059669 !important;
        border-radius: 10px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .course-info {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        font-size: 11px !important;
        color: #64748b !important;
        margin-top: 2px !important;
      }
      
      .course-info svg {
        width: 14px !important;
        height: 14px !important;
        color: #10b981 !important;
      }
      
      .empty-state {
        text-align: center !important;
        padding: 30px 10px !important;
        color: #94a3b8 !important;
        font-size: 12px !important;
      }
      
      .grid {
        display: grid !important;
        grid-template-columns: repeat(6, 1fr) !important;
        gap: 12px !important;
        margin-top: 16px !important;
      }
      
      .header-print {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 16px !important;
        padding-bottom: 12px !important;
        border-bottom: 2px solid #059669 !important;
      }
      
      .title-print {
        font-size: 24px !important;
        font-weight: 700 !important;
        color: #1e293b !important;
        margin: 0 !important;
      }
      
      .subtitle-print {
        font-size: 14px !important;
        color: #64748b !important;
        margin: 0 !important;
      }
      
      .footer-print {
        margin-top: 20px !important;
        padding-top: 12px !important;
        border-top: 1px solid #e5e7eb !important;
        text-align: center !important;
        font-size: 12px !important;
        color: #94a3b8 !important;
      }
      
      .stats-print {
        display: flex !important;
        gap: 16px !important;
        font-size: 13px !important;
        color: #059669 !important;
      }
      
      .stat-item {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        color: #059669 !important;
      }
      
      .stat-item * {
        color: #059669 !important;
      }
      
      .course-header-pdf {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        margin-bottom: 4px !important;
      }
      
      .day-name {
        font-size: 14px !important;
        font-weight: 700 !important;
        color: white !important;
      }
      
      .day-date {
        font-size: 11px !important;
        opacity: 0.85 !important;
        color: white !important;
      }
      
      .course-count {
        padding: 1px 8px !important;
        background-color: rgba(255,255,255,0.25) !important;
        border-radius: 20px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Masquer les éléments de navigation */
      .no-print {
        display: none !important;
      }
      
      /* Optimisations pour l'impression */
      @media print {
        body {
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        #print-container {
          position: relative !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 20px !important;
        }
        
        .day-card {
          height: auto !important;
          min-height: 300px !important;
        }
        
        .course-list {
          overflow-y: visible !important;
          max-height: none !important;
        }
      }
    `;
    printContainer.appendChild(printStyles);
    
    // Ajouter l'en-tête personnalisé pour l'impression
    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-print';
    headerDiv.innerHTML = `
      <div>
        <h1 class="title-print">📅 Mon emploi du temps</h1>
        <p class="subtitle-print">${user?.name || user?.nom || 'Professeur'} • ${totalCourses} cours cette semaine</p>
      </div>
      <div class="stats-print">
        <span class="stat-item">📊 ${uniqueDays} jours</span>
        <span class="stat-item">📚 ${totalCourses} cours</span>
        <span class="stat-item">📅 ${getWeekRange()}</span>
      </div>
    `;
    printContainer.appendChild(headerDiv);
    
    // Ajouter le contenu de l'EDT
    printContainer.appendChild(edtContent);
    
    // Ajouter le pied de page
    const footerDiv = document.createElement('div');
    footerDiv.className = 'footer-print';
    footerDiv.innerHTML = `
      <p>Emploi du temps mis à jour automatiquement • Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    `;
    printContainer.appendChild(footerDiv);

    // Attendre que le contenu soit rendu
    setTimeout(() => {
      // Ouvrir la fenêtre d'impression
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Emploi du temps - ${user?.name || 'Professeur'}</title>
              <style>
                * {
                  font-family: "Inter", "Poppins", "Roboto", sans-serif !important;
                  color: #1e293b !important;
                }
                body {
                  background: white !important;
                  margin: 0 !important;
                  padding: 20px !important;
                }
                @media print {
                  body {
                    padding: 10px !important;
                  }
                  .day-card {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .course-card {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                }
              </style>
            </head>
            <body>
              ${printContainer.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 1000);
                  }, 500);
                };
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback: utiliser l'impression de la page
        window.print();
      }
      
      // Nettoyer le conteneur
      document.body.removeChild(printContainer);
      setPrinting(false);
    }, 300);
  };

  if (loading) {
    return (
      <div style={{
        ...styles.loading,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
      }}>
        <div style={{
          ...styles.spinner,
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderTopColor: COLORS.primary,
        }} />
        <p style={{
          ...styles.loadingText,
          color: isDark ? '#94a3b8' : COLORS.textLight,
        }}>Chargement de votre emploi du temps...</p>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div style={{
        ...styles.errorContainer,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
      }}>
        <div style={styles.errorIcon}>📅</div>
        <p style={{
          ...styles.errorText,
          color: '#ef4444',
        }}>{error}</p>
        <button onClick={loadCourses} style={{
          ...styles.retryButton,
          backgroundColor: COLORS.primary,
          color: COLORS.white,
        }}>
          <Loader2 size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.container,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#1e293b',
    }}>
      {/* En-tête */}
      <div style={styles.header} className="no-print">
        <div>
          <h1 style={{
            ...styles.title,
            color: isDark ? '#f1f5f9' : COLORS.text,
          }}>Mon emploi du temps</h1>
          <p style={{
            ...styles.subtitle,
            color: isDark ? '#94a3b8' : COLORS.textLight,
          }}>
            {user?.name || user?.nom} • {totalCourses} cours cette semaine
          </p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.headerStats}>
            <div style={{
              ...styles.headerStat,
              backgroundColor: isDark ? '#1e293b' : COLORS.primaryBg,
              color: isDark ? '#f1f5f9' : COLORS.text,
            }}>
              <Calendar size={18} color={COLORS.primary} />
              <span>{uniqueDays} jours</span>
            </div>
            <div style={{
              ...styles.headerStat,
              backgroundColor: isDark ? '#1e293b' : COLORS.primaryBg,
              color: isDark ? '#f1f5f9' : COLORS.text,
            }}>
              <BookOpen size={18} color={COLORS.primary} />
              <span>{totalCourses} cours</span>
            </div>
          </div>
          <div style={styles.exportButtons}>
            <button 
              onClick={exportToPDF} 
              style={{
                ...styles.exportButton,
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                boxShadow: `0 4px 6px rgba(5, 150, 105, 0.2)`,
              }}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FileDown size={16} />
              )}
              <span>Exporter PDF</span>
            </button>
            <button 
              onClick={handlePrint} 
              style={{
                ...styles.printButton,
                backgroundColor: isDark ? '#1e293b' : COLORS.white,
                color: isDark ? '#f1f5f9' : COLORS.text,
                border: `1px solid ${isDark ? '#334155' : COLORS.border}`,
              }}
              disabled={printing}
            >
              {printing ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Printer size={16} />
              )}
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        ...styles.navigationBar,
        backgroundColor: isDark ? '#1e293b' : COLORS.white,
        border: `1px solid ${isDark ? '#334155' : COLORS.border}`,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
      }} className="no-print">
        <button onClick={previousWeek} style={{
          ...styles.navButton,
          background: 'transparent',
          border: `1px solid ${isDark ? '#475569' : COLORS.border}`,
          color: isDark ? '#94a3b8' : COLORS.text,
        }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={goToCurrentWeek} style={{
          ...styles.currentWeekButton,
          backgroundColor: COLORS.primary,
          color: COLORS.white,
        }}>
          Semaine actuelle
        </button>
        <button onClick={nextWeek} style={{
          ...styles.navButton,
          background: 'transparent',
          border: `1px solid ${isDark ? '#475569' : COLORS.border}`,
          color: isDark ? '#94a3b8' : COLORS.text,
        }}>
          <ChevronRight size={20} />
        </button>
        <div style={{
          ...styles.weekInfo,
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          color: isDark ? '#f1f5f9' : COLORS.text,
        }}>
          <Calendar size={16} color={COLORS.primary} />
          <span>{getWeekRange()}</span>
        </div>
      </div>

      {/* Contenu de l'EDT - Référencé pour l'export */}
      <div ref={edtRef}>
        {/* Grille des jours */}
        <div style={styles.grid}>
          {weekDays.map((day, idx) => {
            const dayCourses = getCoursesByDay(day.dayName);
            const isToday = new Date().toDateString() === day.date.toDateString();
            
            return (
              <div key={idx} style={{
                ...styles.dayCard,
                background: isDark ? '#1e293b' : COLORS.white,
                border: isToday ? `2px solid ${COLORS.primary}` : `1px solid ${isDark ? '#334155' : COLORS.border}`,
                boxShadow: isToday ? `0 4px 12px rgba(5, 150, 105, ${isDark ? '0.2' : '0.15'})` : 'none',
              }} className="day-card">
                <div style={{
                  ...styles.dayHeader,
                  background: isToday 
                    ? `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` 
                    : COLORS.primary,
                }} className="day-header">
                  <span className="day-name">{day.dayName}</span>
                  <div style={styles.dayHeaderRight}>
                    <span className="day-date">{day.formattedDate}</span>
                    <span className="course-count">{dayCourses.length}</span>
                  </div>
                </div>
                <div style={{
                  ...styles.courseList,
                  backgroundColor: isDark ? '#1e293b' : 'transparent',
                }} className="course-list">
                  {dayCourses.length === 0 ? (
                    <div style={{
                      ...styles.emptyState,
                      color: isDark ? '#64748b' : COLORS.textLight,
                    }} className="empty-state">
                      <div style={styles.emptyIcon}>📭</div>
                      <span>Aucun cours</span>
                    </div>
                  ) : (
                    dayCourses.map((course, index) => (
                      <div key={course.id || index} style={{
                        ...styles.courseCard,
                        backgroundColor: isDark ? '#0f172a' : '#fafafa',
                        border: `1px solid ${isDark ? '#334155' : COLORS.border}`,
                      }} className="course-card">
                        <div style={styles.courseHeader} className="course-header-pdf">
                          <span style={{
                            ...styles.courseTitle,
                            color: isDark ? '#f1f5f9' : COLORS.text,
                          }} className="course-title">{course.matiere}</span>
                          <span style={{
                            ...styles.courseBadge,
                            backgroundColor: COLORS.primaryBg,
                            color: COLORS.primary,
                          }} className="course-badge">{course.niveau}</span>
                        </div>
                        <div style={{
                          ...styles.courseInfo,
                          color: isDark ? '#94a3b8' : COLORS.textLight,
                        }} className="course-info">
                          <Clock size={14} color={COLORS.primaryLight} />
                          <span>{course.heure_debut?.substring(0,5)} - {course.heure_fin?.substring(0,5)}</span>
                        </div>
                        <div style={{
                          ...styles.courseInfo,
                          color: isDark ? '#94a3b8' : COLORS.textLight,
                        }} className="course-info">
                          <GraduationCap size={14} color={COLORS.primaryLight} />
                          <span>Niveau: {course.niveau}</span>
                        </div>
                        <div style={{
                          ...styles.courseInfo,
                          color: isDark ? '#94a3b8' : COLORS.textLight,
                        }} className="course-info">
                          <MapPin size={14} color={COLORS.primaryLight} />
                          <span>Salle: {course.salle?.nom || course.salle_id || 'N/A'}</span>
                        </div>
                        <div style={{
                          ...styles.courseInfo,
                          color: isDark ? '#94a3b8' : COLORS.textLight,
                        }} className="course-info">
                          <School size={14} color={COLORS.primaryLight} />
                          <span>{course.parcours}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pied de page */}
      <div style={{
        ...styles.footer,
        backgroundColor: isDark ? '#1e293b' : COLORS.white,
        border: `1px solid ${isDark ? '#334155' : COLORS.border}`,
      }} className="no-print">
        <p style={{
          ...styles.footerText,
          color: isDark ? '#f1f5f9' : COLORS.text,
        }}>
          📊 Total: {totalCourses} cours • {uniqueDays} jours
        </p>
        <p style={{
          ...styles.footerSubtext,
          color: isDark ? '#64748b' : COLORS.textLight,
        }}>
          Emploi du temps mis à jour automatiquement
        </p>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .course-card {
          animation: fadeIn 0.3s ease-out;
        }
        
        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(5, 150, 105, ${isDark ? '0.2' : '0.12'});
          transition: all 0.3s ease;
        }
        
        .nav-button:hover {
          background: ${isDark ? '#1e293b' : COLORS.primaryBg} !important;
          border-color: ${COLORS.primary} !important;
        }
        
        .current-week-button:hover {
          background: ${COLORS.primaryDark} !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        
        .retry-button:hover {
          background: ${COLORS.primaryDark} !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        
        .course-card:hover {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 4px 12px rgba(5, 150, 105, ${isDark ? '0.15' : '0.08'});
        }
        
        .export-button:hover:not(:disabled) {
          background: ${COLORS.primaryDark} !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        
        .export-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .print-button:hover:not(:disabled) {
          background: ${isDark ? '#0f172a' : '#f1f5f9'} !important;
          transform: translateY(-2px);
        }
        
        .print-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .day-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .course-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        
        /* Scrollbar personnalisée pour le mode sombre */
        ${isDark ? `
          .course-list::-webkit-scrollbar {
            width: 4px;
          }
          .course-list::-webkit-scrollbar-track {
            background: #0f172a;
          }
          .course-list::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 4px;
          }
          .course-list::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        ` : ''}
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, sans-serif',
    transition: 'all 0.3s ease',
  },

  // Loading
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
    transition: 'all 0.3s ease',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    fontWeight: 500,
  },

  // Error
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
    transition: 'all 0.3s ease',
  },
  errorIcon: {
    fontSize: '48px',
  },
  errorText: {
    fontSize: '16px',
    textAlign: 'center',
    maxWidth: '400px',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerStats: {
    display: 'flex',
    gap: '12px',
  },
  headerStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
  },
  exportButtons: {
    display: 'flex',
    gap: '10px',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  printButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },

  // Navigation
  navigationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
  },
  navButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  currentWeekButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  weekInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    marginLeft: 'auto',
    transition: 'all 0.3s ease',
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
  },

  // Day Card
  dayCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '560px',
    transition: 'all 0.3s ease',
  },
  dayHeader: {
    padding: '12px 16px',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '14px',
  },
  dayName: {
    fontSize: '15px',
    fontWeight: 700,
  },
  dayHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dayDate: {
    fontSize: '12px',
    fontWeight: 400,
    opacity: 0.85,
  },
  courseCount: {
    padding: '2px 10px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255,255,255,0.25)',
    fontSize: '12px',
    fontWeight: 600,
  },
  courseList: {
    padding: '12px',
    flex: 1,
    overflowY: 'auto',
    transition: 'all 0.3s ease',
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '40px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  emptyIcon: {
    fontSize: '28px',
    opacity: 0.5,
  },

  // Course Card
  courseCard: {
    padding: '12px 14px',
    marginBottom: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  courseTitle: {
    fontWeight: 600,
    fontSize: '14px',
  },
  courseBadge: {
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
  },
  courseInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    marginTop: '3px',
  },

  // Footer
  footer: {
    marginTop: '24px',
    padding: '16px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  footerText: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  footerSubtext: {
    fontSize: '12px',
  },
};

// Responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @media (max-width: 1200px) {
      .grid {
        grid-template-columns: repeat(3, 1fr) !important;
      }
    }
    
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr !important;
      }
      
      .day-card {
        height: auto !important;
        max-height: 400px;
      }
      
      .container {
        padding: 16px !important;
      }
      
      .header {
        flex-direction: column;
        align-items: flex-start !important;
      }
      
      .header-actions {
        width: 100%;
        flex-direction: column;
        align-items: stretch !important;
      }
      
      .header-stats {
        width: 100%;
      }
      
      .header-stat {
        flex: 1;
        justify-content: center;
      }
      
      .export-buttons {
        width: 100%;
      }
      
      .export-button,
      .print-button {
        flex: 1;
        justify-content: center;
      }
      
      .navigation-bar {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .week-info {
        margin-left: 0 !important;
        width: 100%;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}