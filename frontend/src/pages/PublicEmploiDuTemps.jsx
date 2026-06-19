// src/pages/PublicEmploiDuTemps.jsx - Version avec mode sombre/clair et PDF amélioré

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { 
  Calendar, Clock, User, MapPin, Filter, ChevronLeft, ChevronRight,
  School, GraduationCap, AlertCircle, LogIn, FileText, Loader2,
  BookOpen, Download, X, Users, Database, Shield, Brain, Network,
  ChevronDown, Eye, Printer, Moon, Sun, Monitor
} from 'lucide-react';

// ===================== CONSTANTES =====================
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];

const PARCOURS = [
  { id: 'GL', label: 'Génie Logiciel', icon: '💻', color: '#2563EB' },
  { id: 'ASR', label: 'Administration Système et Réseaux', icon: '🌐', color: '#7C3AED' },
  { id: 'IG', label: 'Informatique Générale', icon: '🖥️', color: '#06B6D4' },
  { id: 'IASDM', label: 'IA et Science des Données', icon: '🤖', color: '#22C55E' },
  { id: 'SECURITE', label: 'Cybersécurité', icon: '🛡️', color: '#F59E0B' }
];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// ===================== UTILITAIRES =====================
const toLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0) ? 6 : (day - 1);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getParcoursLabel = (id) => {
  const p = PARCOURS.find(p => p.id === id);
  return p ? p.label : id;
};

const getParcoursIcon = (id) => {
  const p = PARCOURS.find(p => p.id === id);
  return p ? p.icon : '📚';
};

const getParcoursColor = (id) => {
  const p = PARCOURS.find(p => p.id === id);
  return p ? p.color : '#94A3B8';
};

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  return timeStr.substring(0, 5);
};

// ===================== STYLES =====================
const getStyles = (isDark) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    fontFamily: '"Inter", "Poppins", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    color: isDark ? '#f1f5f9' : '#1e293b',
    transition: 'all 0.3s ease',
  },
  header: {
    background: isDark 
      ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)'
      : 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)',
    padding: '28px 0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderBottom: `4px solid ${isDark ? '#3b82f6' : '#2563EB'}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    position: 'relative',
    zIndex: 2,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  headerIconWrapper: {
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(37, 99, 235, 0.3)',
  },
  headerIcon: { color: '#FFFFFF', width: '32px', height: '32px' },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0,
    fontFamily: '"Poppins", "Inter", sans-serif',
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '4px 0 0',
    fontWeight: 400,
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#FFFFFF',
    color: '#2563EB',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    fontFamily: '"Inter", sans-serif',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '40px',
    cursor: 'pointer',
    color: 'white',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif',
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  edtHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },
  edtTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  edtIconWrapper: {
    width: '48px',
    height: '48px',
    backgroundColor: isDark ? '#1e293b' : '#EFF6FF',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  edtIcon: { color: '#2563EB', width: '24px', height: '24px' },
  edtTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: isDark ? '#f1f5f9' : '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
    transition: 'all 0.3s ease',
  },
  edtSubtitle: {
    fontSize: '14px',
    color: isDark ? '#94a3b8' : '#475569',
    margin: '4px 0 0',
    fontWeight: 400,
    transition: 'all 0.3s ease',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif',
  },
  exportButtonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  navBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
    padding: '8px 12px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
    boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease',
  },
  navButton: {
    padding: '8px 12px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    border: `1px solid ${isDark ? '#475569' : '#E5E7EB'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    color: isDark ? '#94a3b8' : '#475569',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    padding: '8px 20px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif',
  },
  weekInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    borderRadius: '8px',
    color: isDark ? '#94a3b8' : '#475569',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    border: `1px solid ${isDark ? '#475569' : '#E5E7EB'}`,
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    color: isDark ? '#94a3b8' : '#475569',
    marginLeft: 'auto',
    fontFamily: '"Inter", sans-serif',
  },
  filterToggleActive: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
  },
  filtersPanel: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
    transition: 'all 0.3s ease',
  },
  filtersLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    color: isDark ? '#f1f5f9' : '#0F172A',
    fontSize: '14px',
  },
  select: {
    padding: '8px 16px',
    border: `1px solid ${isDark ? '#475569' : '#E5E7EB'}`,
    borderRadius: '8px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    color: isDark ? '#f1f5f9' : '#0F172A',
    fontSize: '14px',
    minWidth: '160px',
    cursor: 'pointer',
    fontFamily: '"Inter", sans-serif',
    transition: 'all 0.2s ease',
  },
  selectParcours: {
    padding: '8px 16px',
    border: `1px solid ${isDark ? '#475569' : '#E5E7EB'}`,
    borderRadius: '8px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    color: isDark ? '#f1f5f9' : '#0F172A',
    fontSize: '14px',
    minWidth: '220px',
    cursor: 'pointer',
    fontFamily: '"Inter", sans-serif',
    transition: 'all 0.2s ease',
  },
  resetButton: {
    padding: '8px 16px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    border: `1px solid ${isDark ? '#475569' : '#E5E7EB'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    color: isDark ? '#94a3b8' : '#475569',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: '"Inter", sans-serif',
  },
  statsBadge: {
    padding: '6px 16px',
    backgroundColor: isDark ? '#1e293b' : '#EFF6FF',
    borderRadius: '20px',
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
  },
  edtGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
  },
  dayCard: {
    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
    borderRadius: '12px',
    border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '520px',
    boxShadow: isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
  },
  dayCardToday: {
    border: `2px solid #2563EB`,
    backgroundColor: isDark ? '#1e293b' : '#EFF6FF',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
  },
  dayHeader: {
    padding: '12px 8px',
    textAlign: 'center',
    borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    transition: 'all 0.3s ease',
  },
  dayHeaderToday: { backgroundColor: isDark ? '#1e293b' : '#DBEAFE' },
  dayName: { fontWeight: 600, fontSize: '14px', color: isDark ? '#f1f5f9' : '#0F172A' },
  dayNameToday: { color: '#2563EB' },
  dayDate: { fontSize: '12px', color: isDark ? '#94a3b8' : '#475569', marginTop: '2px' },
  dayCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '6px',
    padding: '2px 14px',
    borderRadius: '16px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
  },
  courseList: { padding: '8px', flex: 1, overflowY: 'auto' },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: isDark ? '#64748b' : '#94A3B8',
    fontSize: '13px',
    textAlign: 'center',
  },
  courseCard: {
    padding: '10px 12px',
    marginBottom: '8px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  courseTitle: {
    fontWeight: 600,
    fontSize: '13px',
    color: isDark ? '#f1f5f9' : '#0F172A',
    flex: 1,
    lineHeight: '1.4',
  },
  courseType: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  courseInfo: { marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' },
  courseInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: isDark ? '#94a3b8' : '#475569',
  },
  courseInfoIcon: { width: '14px', height: '14px', color: isDark ? '#64748b' : '#94A3B8', flexShrink: 0 },
  courseBadges: { display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' },
  badge: { fontSize: '10px', padding: '2px 10px', borderRadius: '12px', color: '#FFFFFF', fontWeight: 600 },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  emptyIcon: { color: isDark ? '#64748b' : '#94A3B8', width: '64px', height: '64px' },
  emptyTitle: { fontSize: '18px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#0F172A' },
  emptySubtitle: { fontSize: '14px', color: isDark ? '#64748b' : '#94A3B8' },
  stats: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '14px',
    color: isDark ? '#94a3b8' : '#475569',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: isDark ? '#1e293b' : '#FFFFFF',
    borderRadius: '16px',
    padding: '28px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    maxHeight: '90vh',
    overflow: 'auto',
    border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: isDark ? '#f1f5f9' : '#0F172A',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  modalClose: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: isDark ? '#94a3b8' : '#94A3B8',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  modalBody: { marginTop: '20px' },
  modalInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
  },
  modalInfoIcon: { width: '18px', height: '18px', color: isDark ? '#64748b' : '#94A3B8' },
  modalInfoText: { fontSize: '14px', color: isDark ? '#94a3b8' : '#475569' },
  modalCloseButton: {
    width: '100%',
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    transition: 'all 0.3s ease',
  },
  loadingText: { color: isDark ? '#94a3b8' : '#475569', fontSize: '16px', fontWeight: 500 },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    transition: 'all 0.3s ease',
  },
  errorIcon: { color: '#EF4444', width: '48px', height: '48px' },
  errorTitle: { color: isDark ? '#f1f5f9' : '#0F172A', fontSize: '24px', fontWeight: 700, margin: 0 },
  errorMessage: { color: isDark ? '#94a3b8' : '#475569', fontSize: '16px', margin: 0, maxWidth: '500px' },
  footer: {
    backgroundColor: isDark ? '#020617' : '#0F172A',
    color: '#94A3B8',
    padding: '40px 24px',
    marginTop: '48px',
    borderTop: `4px solid ${isDark ? '#3b82f6' : '#2563EB'}`,
    transition: 'all 0.3s ease',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '24px',
  },
  footerTitle: { color: '#FFFFFF', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' },
  footerText: { margin: '4px 0', fontSize: '14px', color: '#94A3B8' },
  footerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#60A5FA',
    marginTop: '8px',
  },
});

// ===================== COMPOSANTS =====================

const CourseCard = ({ course, onClick, isDark }) => {
  const parcoursColor = getParcoursColor(course.parcours);
  const styles = getStyles(isDark);
  
  return (
    <div
      style={styles.courseCard}
      onClick={() => onClick?.(course)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#2563EB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = isDark ? '#334155' : '#E5E7EB';
      }}
    >
      <div style={styles.courseHeader}>
        <span style={styles.courseTitle}>{course.matiere || 'Sans titre'}</span>
        {course.type && (
          <span style={{ 
            ...styles.courseType, 
            color: parcoursColor, 
            backgroundColor: parcoursColor + '15',
            border: `1px solid ${parcoursColor + '30'}`
          }}>
            {course.type}
          </span>
        )}
      </div>
      
      <div style={styles.courseInfo}>
        <div style={styles.courseInfoRow}>
          <Clock style={styles.courseInfoIcon} />
          <span>{formatTime(course.heure_debut)} - {formatTime(course.heure_fin)}</span>
        </div>
        <div style={styles.courseInfoRow}>
          <User style={styles.courseInfoIcon} />
          <span>{course.prof || 'À confirmer'}</span>
        </div>
        <div style={styles.courseInfoRow}>
          <MapPin style={styles.courseInfoIcon} />
          <span>{course.salle || 'À confirmer'}</span>
        </div>
      </div>
      
      <div style={styles.courseBadges}>
        <span style={{ ...styles.badge, backgroundColor: '#64748B' }}>
          {course.niveau || 'N/A'}
        </span>
        {course.parcours && (
          <span style={{ ...styles.badge, backgroundColor: parcoursColor }}>
            {getParcoursIcon(course.parcours)} {getParcoursLabel(course.parcours)}
          </span>
        )}
      </div>
    </div>
  );
};

const DayColumn = ({ day, courses, isToday, onCourseClick, isDark }) => {
  const styles = getStyles(isDark);
  
  return (
    <div style={{ ...styles.dayCard, ...(isToday ? styles.dayCardToday : {}) }}>
      <div style={{ ...styles.dayHeader, ...(isToday ? styles.dayHeaderToday : {}) }}>
        <div style={{ ...styles.dayName, ...(isToday ? styles.dayNameToday : {}) }}>{day.dayName}</div>
        <div style={styles.dayDate}>{day.dayNumber} {MONTHS[day.date.getMonth()]}</div>
        <div style={styles.dayCount}>
          <span style={{ fontWeight: 700 }}>{courses.length}</span>
          <span>cours</span>
        </div>
      </div>
      
      <div style={styles.courseList}>
        {courses.length === 0 ? (
          <div style={styles.emptyState}>Aucun cours</div>
        ) : (
          courses.map((course, idx) => (
            <CourseCard key={idx} course={course} onClick={onCourseClick} isDark={isDark} />
          ))
        )}
      </div>
    </div>
  );
};

const FiltersPanel = ({ filters, onFilterChange, onReset, isDark }) => {
  const styles = getStyles(isDark);
  
  return (
    <div style={styles.filtersPanel}>
      <div style={styles.filtersLabel}>
        <Filter size={16} color="#2563EB" />
        <span>Filtres</span>
      </div>
      
      <select
        value={filters.niveau}
        onChange={(e) => onFilterChange('niveau', e.target.value)}
        style={styles.select}
        onFocus={(e) => e.target.style.borderColor = '#2563EB'}
        onBlur={(e) => e.target.style.borderColor = isDark ? '#475569' : '#E5E7EB'}
      >
        <option value="">📚 Tous niveaux</option>
        {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      
      <select
        value={filters.parcours}
        onChange={(e) => onFilterChange('parcours', e.target.value)}
        style={styles.selectParcours}
        onFocus={(e) => e.target.style.borderColor = '#2563EB'}
        onBlur={(e) => e.target.style.borderColor = isDark ? '#475569' : '#E5E7EB'}
      >
        <option value="">🎓 Tous parcours</option>
        {PARCOURS.map(p => (
          <option key={p.id} value={p.id}>
            {p.icon} {p.label}
          </option>
        ))}
      </select>
      
      <button 
        onClick={onReset} 
        style={styles.resetButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#F8FAFC';
        }}
      >
        <X size={14} />
        Réinitialiser
      </button>
    </div>
  );
};

// ===================== PAGE PRINCIPALE =====================
export default function PublicEmploiDuTemps() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getStyles(isDark);
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStartDate(new Date()));
  const [weekDays, setWeekDays] = useState([]);
  const [filters, setFilters] = useState({ niveau: '', parcours: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  const edtRef = useRef(null);

  useEffect(() => {
    if (currentWeekStart) {
      updateWeekDays(currentWeekStart);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    if (courses.length > 0 && currentWeekStart) {
      filterCoursesByWeek();
    }
  }, [courses, currentWeekStart, filters]);

  useEffect(() => {
    loadCourses();
  }, [currentWeekStart, filters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showThemeMenu && !e.target.closest('.theme-menu-container')) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showThemeMenu]);

  const updateWeekDays = (date) => {
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
        fullDate: d,
        dayNumber: d.getDate(),
        monthName: MONTHS[d.getMonth()]
      });
    }
    setWeekDays(dates);
  };

  const filterCoursesByWeek = useCallback(() => {
    if (!currentWeekStart) return;
    
    const weekStartStr = toLocalDateString(currentWeekStart);
    
    let filtered = courses.filter(course => {
      if (!course) return false;
      if (course.date_debut_semaine) {
        const courseDate = course.date_debut_semaine.split('T')[0];
        return courseDate === weekStartStr;
      }
      return false;
    });
    
    if (filters.niveau) {
      filtered = filtered.filter(c => c.niveau === filters.niveau);
    }
    if (filters.parcours) {
      filtered = filtered.filter(c => c.parcours === filters.parcours);
    }
    
    const dayOrder = { 'Lundi': 0, 'Mardi': 1, 'Mercredi': 2, 'Jeudi': 3, 'Vendredi': 4, 'Samedi': 5 };
    filtered.sort((a, b) => {
      const dayA = dayOrder[a.jour] ?? 99;
      const dayB = dayOrder[b.jour] ?? 99;
      if (dayA !== dayB) return dayA - dayB;
      return (a.heure_debut || '00:00').localeCompare(b.heure_debut || '00:00');
    });
    
    setFilteredCourses(filtered);
  }, [courses, currentWeekStart, filters]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStartStr = toLocalDateString(currentWeekStart);
      
      const response = await publicService.getEmploi(
        filters.niveau || '',
        filters.parcours || '',
        weekStartStr
      );
      
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Erreur chargement cours publics:', error);
      if (error.response?.status === 401) {
        setError('Vous devez être connecté pour accéder à cette page. Veuillez vous connecter.');
      } else {
        setError('Impossible de charger l\'emploi du temps. Veuillez réessayer.');
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const previousWeek = () => {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  };

  const getWeekRange = () => {
    if (weekDays.length < 6) return '';
    const start = weekDays[0];
    const end = weekDays[5];
    return `${start.dayNumber} ${MONTHS[start.date.getMonth()]} - ${end.dayNumber} ${MONTHS[end.date.getMonth()]} ${end.date.getFullYear()}`;
  };

  const resetFilters = () => {
    setFilters({ niveau: '', parcours: '' });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon size={16} />;
    if (theme === 'light') return <Sun size={16} />;
    return <Monitor size={16} />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Sombre';
    if (theme === 'light') return 'Clair';
    return 'Système';
  };

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
    setShowThemeMenu(false);
  };

  // ===================== EXPORT PDF AMÉLIORÉ =====================
  const exportPDF = async () => {
    if (!edtRef.current || filteredCourses.length === 0) return;
    
    setExporting(true);
    try {
      const printWindow = window.open('', '_blank', 'width=1200,height=900,scrollbars=yes');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour exporter le PDF');
        setExporting(false);
        return;
      }

      const weekRange = getWeekRange();
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Construire le tableau des cours
      let tableRows = '';
      let headerHtml = '';
      
      // En-tête du tableau
      weekDays.forEach(day => {
        const isToday = new Date().toDateString() === day.date.toDateString();
        const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
        headerHtml += `
          <th style="
            padding: 12px 8px;
            background: ${isToday ? '#DBEAFE' : '#F1F5F9'};
            border: 1px solid #D1D5DB;
            font-weight: 700;
            font-size: 13px;
            color: ${isToday ? '#2563EB' : '#0F172A'};
            text-align: center;
            min-width: 140px;
          ">
            <div style="font-size: 14px;">${day.dayName}</div>
            <div style="font-size: 11px; font-weight: 400; color: #475569;">${day.dayNumber} ${MONTHS[day.date.getMonth()]}</div>
            <div style="
              display: inline-block;
              margin-top: 4px;
              padding: 1px 12px;
              background: #2563EB;
              color: white;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
            ">${dayCourses.length} cours</div>
          </th>
        `;
      });

      // Trouver toutes les heures uniques des cours
      const allTimes = new Set();
      filteredCourses.forEach(c => {
        if (c.heure_debut) allTimes.add(c.heure_debut.substring(0, 5));
        if (c.heure_fin) allTimes.add(c.heure_fin.substring(0, 5));
      });
      const sortedTimes = Array.from(allTimes).sort();

      // Générer les lignes du tableau
      if (sortedTimes.length > 0) {
        sortedTimes.forEach(time => {
          let rowHtml = `<td style="
            padding: 6px 8px;
            border: 1px solid #D1D5DB;
            background: #F8FAFC;
            font-weight: 600;
            font-size: 11px;
            color: #475569;
            text-align: center;
            white-space: nowrap;
            width: 60px;
          ">${time}</td>`;

          weekDays.forEach(day => {
            const dayCourses = filteredCourses.filter(c => 
              c.jour === day.dayName && 
              c.heure_debut && 
              c.heure_debut.substring(0, 5) === time
            );

            if (dayCourses.length > 0) {
              const course = dayCourses[0];
              const parcoursColor = getParcoursColor(course.parcours);
              rowHtml += `
                <td style="
                  padding: 6px 8px;
                  border: 1px solid #D1D5DB;
                  background: #FFFFFF;
                  vertical-align: middle;
                ">
                  <div style="
                    padding: 6px 10px;
                    background: ${parcoursColor}10;
                    border-radius: 6px;
                    border-left: 3px solid ${parcoursColor};
                  ">
                    <div style="
                      font-weight: 600;
                      font-size: 12px;
                      color: #0F172A;
                    ">${course.matiere || 'Cours'}</div>
                    <div style="
                      display: flex;
                      gap: 8px;
                      margin-top: 4px;
                      font-size: 10px;
                      color: #475569;
                      flex-wrap: wrap;
                    ">
                      <span>👤 ${course.prof || 'À confirmer'}</span>
                      <span>📍 ${course.salle || 'À confirmer'}</span>
                      <span style="
                        padding: 1px 8px;
                        background: ${parcoursColor};
                        color: white;
                        border-radius: 10px;
                        font-size: 9px;
                        font-weight: 600;
                      ">${course.niveau || 'N/A'}</span>
                      <span style="
                        padding: 1px 8px;
                        background: #64748B;
                        color: white;
                        border-radius: 10px;
                        font-size: 9px;
                        font-weight: 600;
                      ">${getParcoursLabel(course.parcours) || 'N/A'}</span>
                    </div>
                  </div>
                </td>
              `;
            } else {
              rowHtml += `<td style="padding: 6px 8px; border: 1px solid #D1D5DB; background: #FAFAFA;"></td>`;
            }
          });

          tableRows += `<tr>${rowHtml}</tr>`;
        });
      } else {
        tableRows = `
          <tr>
            <td colspan="7" style="
              padding: 40px;
              text-align: center;
              border: 1px solid #D1D5DB;
              color: #94A3B8;
              font-size: 16px;
            ">
              <div style="font-size: 40px; margin-bottom: 12px;">📅</div>
              Aucun cours programmé cette semaine
            </td>
          </tr>
        `;
      }

      const filterInfo = [];
      if (filters.niveau) filterInfo.push(`Niveau: ${filters.niveau}`);
      if (filters.parcours) filterInfo.push(`Parcours: ${getParcoursLabel(filters.parcours)}`);
      const filterText = filterInfo.length > 0 ? ` • ${filterInfo.join(' • ')}` : ' • Tous les parcours et niveaux';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Emploi du temps ENI Fianarantsoa - ${weekRange}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: #FFFFFF;
              padding: 20px;
              color: #0F172A;
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .header {
              background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%);
              color: white;
              padding: 24px 32px;
              border-radius: 12px 12px 0 0;
              border-bottom: 4px solid #2563EB;
            }
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 16px;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .header-icon {
              width: 48px;
              height: 48px;
              background: rgba(255,255,255,0.15);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            .header-title {
              font-size: 22px;
              font-weight: 700;
              font-family: 'Poppins', sans-serif;
              margin: 0;
            }
            .header-subtitle {
              font-size: 13px;
              color: rgba(255,255,255,0.8);
              margin: 2px 0 0;
            }
            .header-info {
              text-align: right;
            }
            .header-info .semaine {
              font-size: 18px;
              font-weight: 700;
            }
            .header-info .date {
              font-size: 13px;
              color: rgba(255,255,255,0.7);
              margin-top: 2px;
            }
            .header-info .filters {
              font-size: 12px;
              color: rgba(255,255,255,0.6);
              margin-top: 4px;
              padding: 4px 12px;
              background: rgba(255,255,255,0.1);
              border-radius: 20px;
              display: inline-block;
            }
            .table-wrapper {
              overflow-x: auto;
              border: 1px solid #D1D5DB;
              border-top: none;
              border-radius: 0 0 12px 12px;
              background: #FFFFFF;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #D1D5DB;
              padding: 8px 10px;
              text-align: left;
              vertical-align: middle;
            }
            th {
              background: #F1F5F9;
              font-weight: 600;
              text-align: center;
            }
            .time-cell {
              background: #F8FAFC;
              font-weight: 600;
              font-size: 12px;
              color: #475569;
              text-align: center;
              white-space: nowrap;
              width: 60px;
            }
            .course-block {
              padding: 6px 10px;
              border-radius: 6px;
              border-left: 3px solid #2563EB;
              min-height: 50px;
            }
            .course-name {
              font-weight: 600;
              font-size: 13px;
              color: #0F172A;
            }
            .course-details {
              display: flex;
              gap: 8px;
              margin-top: 4px;
              font-size: 10px;
              color: #475569;
              flex-wrap: wrap;
            }
            .course-details span {
              display: inline-flex;
              align-items: center;
              gap: 2px;
            }
            .badge-niveau {
              padding: 1px 8px;
              border-radius: 10px;
              font-size: 9px;
              font-weight: 600;
              color: white;
            }
            .footer {
              margin-top: 20px;
              padding: 16px 24px;
              background: #0F172A;
              color: #94A3B8;
              border-radius: 12px;
              text-align: center;
              font-size: 12px;
            }
            .footer strong { color: white; }
            .footer .footer-info {
              display: flex;
              justify-content: center;
              gap: 24px;
              flex-wrap: wrap;
              margin-top: 4px;
              font-size: 11px;
            }
            .watermark {
              position: fixed;
              bottom: 20px;
              right: 20px;
              opacity: 0.05;
              font-size: 80px;
              font-weight: 700;
              color: #2563EB;
              transform: rotate(-15deg);
              pointer-events: none;
              z-index: 0;
            }
            .legend {
              margin-top: 16px;
              padding: 12px 20px;
              background: #F8FAFC;
              border-radius: 8px;
              border: 1px solid #E5E7EB;
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              align-items: center;
              font-size: 12px;
              color: #475569;
            }
            .legend-title { font-weight: 600; color: #0F172A; }
            .legend-item { display: inline-flex; align-items: center; gap: 4px; }
            .legend-color { display: inline-block; width: 12px; height: 12px; border-radius: 3px; }
            .legend-total { margin-left: auto; font-size: 11px; color: #94A3B8; }
            @media print {
              body { padding: 10px; }
              .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .badge-niveau { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .course-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .legend-color { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            @media (max-width: 768px) {
              .header-content { flex-direction: column; text-align: center; }
              .header-info { text-align: center; }
              table { font-size: 11px; }
              th, td { padding: 4px 6px; }
              .course-name { font-size: 11px; }
              .course-details { font-size: 9px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-content">
                <div class="header-left">
                  <div class="header-icon">🏛️</div>
                  <div>
                    <div class="header-title">ENI Fianarantsoa</div>
                    <div class="header-subtitle">École Nationale d'Informatique</div>
                  </div>
                </div>
                <div class="header-info">
                  <div class="semaine">📅 Semaine du ${weekRange}</div>
                  <div class="date">Généré le ${dateStr}</div>
                  <div class="filters">${filterText}</div>
                </div>
              </div>
            </div>
            
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style="width: 60px; background: #E5E7EB; font-weight: 700;">Horaire</th>
                    ${headerHtml}
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
            
            <div class="legend">
              <span class="legend-title">📌 Légende :</span>
              ${PARCOURS.map(p => `
                <span class="legend-item">
                  <span class="legend-color" style="background: ${p.color};"></span>
                  ${p.icon} ${p.label}
                </span>
              `).join('')}
              <span class="legend-total">${filteredCourses.length} cours au total</span>
            </div>
            
            <div class="footer">
              <strong>ENI Fianarantsoa</strong> — Campus Universitaire Ambondro
              <div class="footer-info">
                <span>📍 Fianarantsoa, Madagascar</span>
                <span>📞 +261 34 00 000 00</span>
                <span>✉️ contact@eni-fianarantsoa.mg</span>
                <span>🌐 www.eni-fianarantsoa.mg</span>
              </div>
            </div>
          </div>
          <div class="watermark">ENI</div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          <\/script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Une erreur est survenue lors de l\'export du PDF. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  // Rendu
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#2563EB' }} />
        <p style={styles.loadingText}>Chargement de l'emploi du temps...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Erreur</h2>
        <p style={styles.errorMessage}>{error}</p>
        {error.includes('connecté') ? (
          <Link to="/login">
            <button style={styles.loginButton}>
              <LogIn size={18} style={{ marginRight: '8px' }} />
              Se connecter
            </button>
          </Link>
        ) : (
          <button 
            onClick={loadCourses} 
            style={{ ...styles.loginButton, backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  const hasCourses = filteredCourses.length > 0;

  return (
    <div style={styles.container}>
      {/* ===== BANNIÈRE ===== */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIconWrapper}>
              <School style={styles.headerIcon} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>ENI Fianarantsoa</h1>
              <p style={styles.headerSubtitle}>École Nationale d'Informatique</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }} className="theme-menu-container">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                style={styles.themeToggle}
                aria-label="Changer le thème"
              >
                {getThemeIcon()}
                <span style={{ fontSize: '11px', fontWeight: 500 }}>{getThemeLabel()}</span>
              </button>
              {showThemeMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '6px',
                  minWidth: '160px',
                  boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  animation: 'slideDown 0.2s ease-out',
                }}>
                  <button
                    onClick={() => handleThemeChange('light')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: theme === 'light' ? (isDark ? '#334155' : '#eff6ff') : 'transparent',
                      color: theme === 'light' ? '#2563eb' : (isDark ? '#f1f5f9' : '#1e293b'),
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    <Sun size={16} /> Clair
                    {theme === 'light' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: '#2563eb' }} />}
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: theme === 'dark' ? (isDark ? '#334155' : '#eff6ff') : 'transparent',
                      color: theme === 'dark' ? '#2563eb' : (isDark ? '#f1f5f9' : '#1e293b'),
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    <Moon size={16} /> Sombre
                    {theme === 'dark' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: '#2563eb' }} />}
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: theme === 'system' ? (isDark ? '#334155' : '#eff6ff') : 'transparent',
                      color: theme === 'system' ? '#2563eb' : (isDark ? '#f1f5f9' : '#1e293b'),
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      fontFamily: '"Inter", sans-serif',
                      borderBottom: 'none',
                    }}
                  >
                    <Monitor size={16} /> Système
                    {theme === 'system' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: '#2563eb' }} />}
                  </button>
                </div>
              )}
            </div>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button 
                style={styles.loginButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <LogIn size={18} />
                Espace personnel
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <main style={styles.main}>
        {/* En-tête EDT */}
        <div style={styles.edtHeader}>
          <div style={styles.edtTitleGroup}>
            <div style={styles.edtIconWrapper}>
              <GraduationCap style={styles.edtIcon} />
            </div>
            <div>
              <h2 style={styles.edtTitle}>Emploi du temps public</h2>
              <p style={styles.edtSubtitle}>Semaine du {getWeekRange()}</p>
            </div>
          </div>
          
          {hasCourses && (
            <button
              onClick={exportPDF}
              disabled={exporting}
              style={{ ...styles.exportButton, ...(exporting ? styles.exportButtonDisabled : {}) }}
              onMouseEnter={(e) => {
                if (!exporting) {
                  e.currentTarget.style.backgroundColor = '#16A34A';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(34, 197, 94, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!exporting) {
                  e.currentTarget.style.backgroundColor = '#22C55E';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {exporting ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Printer size={16} />
              )}
              {exporting ? 'Export...' : 'Exporter PDF'}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.navBar}>
          <button 
            onClick={previousWeek} 
            style={styles.navButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#E5E7EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#F8FAFC';
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={goToCurrentWeek} 
            style={styles.todayButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1D4ED8';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Aujourd'hui
          </button>
          
          <button 
            onClick={nextWeek} 
            style={styles.navButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#E5E7EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#F8FAFC';
            }}
          >
            <ChevronRight size={20} />
          </button>
          
          <div style={styles.weekInfo}>
            <Calendar size={16} color={isDark ? '#94a3b8' : '#475569'} />
            <span>{getWeekRange()}</span>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...styles.filterToggle,
              ...(showFilters ? styles.filterToggleActive : {})
            }}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#E5E7EB';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#F8FAFC';
              }
            }}
          >
            <Filter size={16} />
            Filtres
            {(filters.niveau || filters.parcours) && (
              <span style={{ 
                backgroundColor: showFilters ? 'rgba(255,255,255,0.2)' : '#2563EB',
                color: '#FFFFFF',
                borderRadius: '50%',
                padding: '0 6px',
                fontSize: '10px',
                fontWeight: 700,
              }}>
                {Number(!!filters.niveau) + Number(!!filters.parcours)}
              </span>
            )}
          </button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div style={{ marginBottom: '24px' }}>
            <FiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              isDark={isDark}
            />
          </div>
        )}

        {/* Emploi du temps */}
        <div ref={edtRef} style={{ 
          backgroundColor: isDark ? '#1e293b' : '#FFFFFF', 
          padding: '16px', 
          borderRadius: '12px', 
          border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
        }}>
          {!hasCourses && !loading ? (
            <div style={styles.emptyContainer}>
              <BookOpen style={styles.emptyIcon} />
              <p style={styles.emptyTitle}>Aucun cours programmé</p>
              <p style={styles.emptySubtitle}>Vérifiez les filtres ou changez de semaine</p>
            </div>
          ) : (
            <div style={styles.edtGrid}>
              {weekDays.map((day, idx) => {
                const dayCourses = filteredCourses.filter(c => c.jour === day.dayName);
                const isToday = new Date().toDateString() === day.date.toDateString();
                return (
                  <DayColumn
                    key={idx}
                    day={day}
                    courses={dayCourses}
                    isToday={isToday}
                    onCourseClick={setSelectedCourse}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div style={styles.stats}>
          <span style={styles.statsBadge}>
            📚 {filteredCourses.length} cours
          </span>
          {filters.niveau && (
            <span style={styles.statsBadge}>
              🎓 {filters.niveau}
            </span>
          )}
          {filters.parcours && (
            <span style={styles.statsBadge}>
              {getParcoursIcon(filters.parcours)} {getParcoursLabel(filters.parcours)}
            </span>
          )}
          {!filters.niveau && !filters.parcours && (
            <span style={{ color: isDark ? '#64748b' : '#94A3B8', fontSize: '13px' }}>
              Tous les parcours et niveaux
            </span>
          )}
        </div>
      </main>

    

      {/* ===== MODAL ===== */}
      {selectedCourse && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCourse(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedCourse.matiere || 'Cours'}</h3>
              <button
                onClick={() => setSelectedCourse(null)}
                style={styles.modalClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9';
                  e.currentTarget.style.color = isDark ? '#f1f5f9' : '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = isDark ? '#94a3b8' : '#94A3B8';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalInfo}>
                <Clock style={styles.modalInfoIcon} />
                <span style={styles.modalInfoText}>
                  {formatTime(selectedCourse.heure_debut)} - {formatTime(selectedCourse.heure_fin)}
                </span>
              </div>
              <div style={styles.modalInfo}>
                <User style={styles.modalInfoIcon} />
                <span style={styles.modalInfoText}>{selectedCourse.prof || 'À confirmer'}</span>
              </div>
              <div style={styles.modalInfo}>
                <MapPin style={styles.modalInfoIcon} />
                <span style={styles.modalInfoText}>{selectedCourse.salle || 'À confirmer'}</span>
              </div>
              <div style={{ ...styles.modalInfo, borderBottom: 'none' }}>
                <GraduationCap style={styles.modalInfoIcon} />
                <span style={styles.modalInfoText}>
                  {selectedCourse.niveau || 'N/A'} - {getParcoursIcon(selectedCourse.parcours)} {getParcoursLabel(selectedCourse.parcours) || 'N/A'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedCourse(null)}
              style={styles.modalCloseButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDark ? '#1e293b' : '#F1F5F9'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDark ? '#475569' : '#94A3B8'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#64748b' : '#64748B'};
        }
        
        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: ${isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)'};
        }
        .nav-button:hover {
          background: ${isDark ? '#334155' : '#E5E7EB'} !important;
        }
        .today-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .theme-toggle:hover {
          background: rgba(255,255,255,0.2);
        }
        .theme-menu-item:hover {
          background: ${isDark ? '#334155' : '#f1f5f9'} !important;
        }
        
        @media (max-width: 1024px) {
          .edt-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .edt-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .header-content { flex-direction: column; text-align: center; }
          .header-left { flex-direction: column; }
          .header-icon-wrapper { margin: 0 auto; }
          .edt-title-group { flex-direction: column; text-align: center; }
          .theme-menu-container { align-self: flex-end; }
        }
        @media (max-width: 480px) {
          .edt-grid { grid-template-columns: 1fr !important; }
          .day-card { height: 400px !important; }
          .nav-bar { flex-direction: column; align-items: stretch; }
          .week-info { justify-content: center; }
          .filter-toggle { margin-left: 0; justify-content: center; }
          .filters-panel { flex-direction: column; align-items: stretch; }
          .filters-panel select { width: 100%; min-width: unset; }
        }
      `}</style>
    </div>
  );
}