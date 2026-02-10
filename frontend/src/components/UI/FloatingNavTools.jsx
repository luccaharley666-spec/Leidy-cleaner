import React from 'react'
import Link from 'next/link'
import { ArrowUp, CalendarCheck, List, MessageSquare, HelpCircle } from 'lucide-react'

export default function FloatingNavTools() {
  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-3">
      <Link href="#top">
        <a className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:scale-105 [REDACTED_TOKEN]" title="Topo">
          <ArrowUp className="w-5 h-5" />
        </a>
      </Link>

      <Link href="/agendar">
        <a className="w-12 h-12 rounded-full bg-primary-600 shadow-lg flex items-center justify-center text-white hover:scale-105 [REDACTED_TOKEN]" title="Agendar">
          <CalendarCheck className="w-5 h-5" />
        </a>
      </Link>

      <Link href="/servicos">
        <a className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:scale-105 [REDACTED_TOKEN]" title="Serviços">
          <List className="w-5 h-5" />
        </a>
      </Link>

      <Link href="/#faq">
        <a className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:scale-105 [REDACTED_TOKEN]" title="FAQ">
          <HelpCircle className="w-5 h-5" />
        </a>
      </Link>

      <Link href="/notifications">
        <a className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:scale-105 [REDACTED_TOKEN]" title="Suporte">
          <MessageSquare className="w-5 h-5" />
        </a>
      </Link>
    </div>
  )
}
