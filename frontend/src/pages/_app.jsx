import '../styles/globals.css'
import React, { useEffect } from 'react'
import '../sentry.client'
import { ThemeProvider } from '../context/ThemeContext'
import prefs from '../utils/preferences'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import MobileBottomNav from '../components/Layout/MobileBottomNav'
import MobileTopBar from '../components/Layout/MobileTopBar'
import { LoyaltyProvider } from '../components/UI/LoyaltySystem'
import { NotificationSystem } from '../components/UI/NotificationSystem'
import WhatsAppButton from '../components/UI/WhatsAppButton'
import LiveChat from '../components/UI/LiveChat'
import PushNotifications from '../components/UI/PushNotifications'
import PWABanner from '../components/UI/PWABanner'
import FloatingNavTools from '../components/UI/FloatingNavTools'
import { [REDACTED_TOKEN] } from '../utils/pwa'
import Script from 'next/script'
import { useRouter } from 'next/router'
import * as gtag from '../../lib/gtag'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url) => {
      try {
        gtag.pageview(url)
      } catch (e) { /* ignore gtag error */ }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // Apply stored user preferences (font-size, accent)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') prefs.applyPrefs(prefs.getStoredPrefs())
    } catch (e) {
      // ignore
    }

    // Register PWA service worker
    try {
      [REDACTED_TOKEN]()
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <>
      {/* Google Analytics - gtag.js */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
      </Script>

      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <LoyaltyProvider>
                <NotificationSystem />
                  <FloatingNavTools />
                <div className="min-h-[100vh] mobile-only pb-20">
                  <MobileTopBar />
                  <div className="pt-16">
                    <Component {...pageProps} />
                  </div>
                </div>
                <MobileBottomNav />
                <WhatsAppButton />
                <LiveChat />
                <PushNotifications />
                <PWABanner />
              </LoyaltyProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </>
  )
}
