/**
 * Analytics Utilities - Google Analytics 4 Tracking
 * Eventos e conversões para tracking de usuário
 */

// Inicializar Google Analytics com ID
export const initializeGA = (measurementId) => {
  if (typeof window !== 'undefined') {
    // Script será adicionado via next/script no _app.js
    window.dataLayer = window.dataLayer || [];
    function gtag(...args) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId, { 'anonymize_ip': true, 'decoded': true, 'decoded': true });
  }
}

// Rastrear visualização de página
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      'page_path': pagePath,
      'page_title': pageTitle
    });
  }
}

// Rastrear clique em CTA
export const trackCTAClick = (ctaName, ctaLocation) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      'event_category': 'engagement',
      'event_label': ctaName,
      'cta_location': ctaLocation,
      'timestamp': new Date().toISOString()
    });
  }
}

// Rastrear início de compra
export const trackBeginCheckout = (bookingId, totalPrice) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      'event_category': 'ecommerce',
      'currency': 'BRL',
      'value': totalPrice,
      'items': [{
        'item_id': `booking_${bookingId}`,
        'item_name': `Pagamento booking ${bookingId}`,
        'price': totalPrice,
        'quantity': 1
      }]
    });
  }
}

// Rastrear compra completa
export const trackPurchase = (orderId, bookingId, totalPrice, taxes) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      'event_category': 'ecommerce',
      'transaction_id': orderId,
      'currency': 'BRL',
      'value': totalPrice,
      'tax': taxes,
      'items': [{
        'item_id': `booking_${bookingId}`,
        'item_name': `Pagamento booking ${bookingId}`,
        'price': totalPrice - taxes,
        'quantity': 1
      }]
    });
  }
}

// Rastrear cálculo de preço
export const trackPriceCalculation = (hours, estimatedPrice, characteristics) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'price_calculation', {
      'event_category': 'engagement',
      'hours_selected': hours,
      'estimated_price': estimatedPrice,
      'characteristics': characteristics,
      'timestamp': new Date().toISOString()
    });
  }
}

// Rastrear envio de formulário (contato, newsletter)
export const trackFormSubmit = (formName, formData) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_submission', {
      'event_category': 'lead',
      'form_name': formName,
      'has_email': !!formData.email,
      'has_phone': !!formData.phone,
      'timestamp': new Date().toISOString()
    });
  }
}

// Rastrear visualização de seção
export const trackSectionView = (sectionName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'section_view', {
      'event_category': 'engagement',
      'section_name': sectionName,
      'timestamp': new Date().toISOString()
    });
  }
}

// Rastrear clique em testemunha/case
export const trackTestimonialClick = (testimonialAuthor) => { if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'decoded', {
      'event_category': 'engagement', 'testimonial_author': testimonialAuthor, 'timestamp': new Date().toISOString() });
  }
}

// Rastrear clique na galeria
export const trackGalleryFilter = (categorySelected) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'gallery_filter', {
      'event_category': 'engagement',
      'category': categorySelected,
      'timestamp': new Date().toISOString()
    });
  }
}

// Rastrear leitura de blog
export const trackBlogRead = (articleTitle, readTime) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'blog_read', {
      'event_category': 'engagement',
      'article_title': articleTitle,
      'read_time': readTime,
      'timestamp': new Date().toISOString()
    });
  }
}

// Extrair parâmetro UTM da URL
export const getUTMParameters = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term')
    };
  }
  return {};
}

// Rastrear erro
export const trackError = (errorMessage, errorContext) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      'description': errorMessage,
      'error_context': errorContext,
      'fatal': false
    });
  }
}

// Rastrear scroll profundidade
export const trackScrollDepth = (scrollPercentage) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'scroll_depth', {
      'event_category': 'engagement',
      'scroll_percentage': scrollPercentage,
      'timestamp': new Date().toISOString()
    });
  }
}

// Setup scroll tracking
export const setupScrollTracking = () => {
  if (typeof window !== 'undefined') {
    const scrollDepths = [25, 50, 75, 100];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      const scrollPercentage = Math.round((scrollTop + windowHeight) / documentHeight * 100);

      scrollDepths.forEach(depth => {
        if (scrollPercentage >= depth && !tracked.has(depth)) {
          tracked.add(depth);
          trackScrollDepth(depth);
        }
      });
    });
  }
}

// Rastrear tempo na página
export const trackPageEngagement = (pageName) => {
  if (typeof window !== 'undefined') {
    const startTime = Date.now();

    window.addEventListener('beforeunload', () => {
      const sessionTime = Math.round((Date.now() - startTime) / 1000);
      window.gtag('event', 'session_time', {
        'event_category': 'engagement',
        'page_name': pageName,
        'session_duration': sessionTime,
        'timestamp': new Date().toISOString()
      });
    });
  }
}
