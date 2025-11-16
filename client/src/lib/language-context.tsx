import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile & Settings',
    
    // Profile & Settings Page
    'profile.title': 'Profile & Settings',
    'profile.personalInfo': 'Personal Information',
    'profile.healthProfile': 'Health Profile',
    'profile.notifications': 'Notification Preferences',
    'profile.privacy': 'Privacy Settings',
    'profile.subscription': 'Subscription Management',
    'profile.payments': 'Payment History',
    'profile.appearance': 'Appearance',
    'profile.language': 'Language',
    
    // Personal Information
    'personal.name': 'Name',
    'personal.phone': 'Phone Number',
    'personal.email': 'Email Address',
    'personal.bio': 'Bio',
    'personal.address': 'Address',
    'personal.photo': 'Profile Photo',
    'personal.uploadPhoto': 'Upload Photo',
    'personal.save': 'Save Changes',
    
    // Health Profile
    'health.medicalConditions': 'Medical Conditions',
    'health.injuries': 'Injuries',
    'health.fitnessLevel': 'Fitness Level',
    'health.limitations': 'Physical Limitations',
    'health.beginner': 'Beginner',
    'health.intermediate': 'Intermediate',
    'health.advanced': 'Advanced',
    'health.addCondition': 'Add Condition',
    'health.addInjury': 'Add Injury',
    
    // Notifications
    'notif.email': 'Email Notifications',
    'notif.sessionReminders': 'Session Reminders',
    'notif.achievements': 'Achievement Alerts',
    'notif.workouts': 'Workout Notifications',
    'notif.diet': 'Diet Plan Updates',
    'notif.messages': 'Messages',
    
    // Privacy
    'privacy.showEmail': 'Show Email to Others',
    'privacy.showPhone': 'Show Phone to Others',
    'privacy.showProgress': 'Show Progress to Others',
    'privacy.publicProfile': 'Public Profile',
    
    // Subscription
    'sub.currentPlan': 'Current Plan',
    'sub.price': 'Price',
    'sub.billingCycle': 'Billing Cycle',
    'sub.nextBilling': 'Next Billing Date',
    'sub.features': 'Features',
    'sub.upgradePlan': 'Upgrade Plan',
    'sub.cancelSubscription': 'Cancel Subscription',
    'sub.monthly': 'Monthly',
    
    // Payment History
    'payment.date': 'Date',
    'payment.amount': 'Amount',
    'payment.status': 'Status',
    'payment.invoice': 'Invoice',
    'payment.receipt': 'Receipt',
    'payment.method': 'Payment Method',
    'payment.download': 'Download',
    'payment.noHistory': 'No payment history available',
    
    // Appearance
    'appearance.darkMode': 'Dark Mode',
    'appearance.theme': 'Theme',
    'appearance.light': 'Light',
    'appearance.dark': 'Dark',
    
    // Language
    'lang.select': 'Select Language',
    'lang.english': 'English',
    'lang.hindi': 'Hindi',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.update': 'Update',
    'common.loading': 'Loading...',
    'common.success': 'Success!',
    'common.error': 'Error',
    'common.confirm': 'Confirm',
    
    // Messages
    'msg.profileUpdated': 'Profile updated successfully',
    'msg.settingsSaved': 'Settings saved successfully',
    'msg.error': 'An error occurred. Please try again.',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.profile': 'प्रोफाइल और सेटिंग्स',
    
    // Profile & Settings Page
    'profile.title': 'प्रोफाइल और सेटिंग्स',
    'profile.personalInfo': 'व्यक्तिगत जानकारी',
    'profile.healthProfile': 'स्वास्थ्य प्रोफाइल',
    'profile.notifications': 'सूचना प्राथमिकताएं',
    'profile.privacy': 'गोपनीयता सेटिंग्स',
    'profile.subscription': 'सदस्यता प्रबंधन',
    'profile.payments': 'भुगतान इतिहास',
    'profile.appearance': 'दिखावट',
    'profile.language': 'भाषा',
    
    // Personal Information
    'personal.name': 'नाम',
    'personal.phone': 'फोन नंबर',
    'personal.email': 'ईमेल पता',
    'personal.bio': 'बायो',
    'personal.address': 'पता',
    'personal.photo': 'प्रोफाइल फोटो',
    'personal.uploadPhoto': 'फोटो अपलोड करें',
    'personal.save': 'परिवर्तन सहेजें',
    
    // Health Profile
    'health.medicalConditions': 'चिकित्सा स्थितियां',
    'health.injuries': 'चोटें',
    'health.fitnessLevel': 'फिटनेस स्तर',
    'health.limitations': 'शारीरिक सीमाएं',
    'health.beginner': 'शुरुआती',
    'health.intermediate': 'मध्यवर्ती',
    'health.advanced': 'उन्नत',
    'health.addCondition': 'स्थिति जोड़ें',
    'health.addInjury': 'चोट जोड़ें',
    
    // Notifications
    'notif.email': 'ईमेल सूचनाएं',
    'notif.sessionReminders': 'सत्र अनुस्मारक',
    'notif.achievements': 'उपलब्धि अलर्ट',
    'notif.workouts': 'वर्कआउट सूचनाएं',
    'notif.diet': 'आहार योजना अपडेट',
    'notif.messages': 'संदेश',
    
    // Privacy
    'privacy.showEmail': 'दूसरों को ईमेल दिखाएं',
    'privacy.showPhone': 'दूसरों को फोन दिखाएं',
    'privacy.showProgress': 'दूसरों को प्रगति दिखाएं',
    'privacy.publicProfile': 'सार्वजनिक प्रोफाइल',
    
    // Subscription
    'sub.currentPlan': 'वर्तमान योजना',
    'sub.price': 'कीमत',
    'sub.billingCycle': 'बिलिंग चक्र',
    'sub.nextBilling': 'अगली बिलिंग तारीख',
    'sub.features': 'विशेषताएं',
    'sub.upgradePlan': 'योजना अपग्रेड करें',
    'sub.cancelSubscription': 'सदस्यता रद्द करें',
    'sub.monthly': 'मासिक',
    
    // Payment History
    'payment.date': 'तारीख',
    'payment.amount': 'राशि',
    'payment.status': 'स्थिति',
    'payment.invoice': 'चालान',
    'payment.receipt': 'रसीद',
    'payment.method': 'भुगतान विधि',
    'payment.download': 'डाउनलोड',
    'payment.noHistory': 'कोई भुगतान इतिहास उपलब्ध नहीं',
    
    // Appearance
    'appearance.darkMode': 'डार्क मोड',
    'appearance.theme': 'थीम',
    'appearance.light': 'लाइट',
    'appearance.dark': 'डार्क',
    
    // Language
    'lang.select': 'भाषा चुनें',
    'lang.english': 'अंग्रेज़ी',
    'lang.hindi': 'हिंदी',
    
    // Common
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.add': 'जोड़ें',
    'common.update': 'अपडेट करें',
    'common.loading': 'लोड हो रहा है...',
    'common.success': 'सफलता!',
    'common.error': 'त्रुटि',
    'common.confirm': 'पुष्टि करें',
    
    // Messages
    'msg.profileUpdated': 'प्रोफाइल सफलतापूर्वक अपडेट हुआ',
    'msg.settingsSaved': 'सेटिंग्स सफलतापूर्वक सहेजी गईं',
    'msg.error': 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('fitpro-language');
    return (stored === 'hi' || stored === 'en') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('fitpro-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
