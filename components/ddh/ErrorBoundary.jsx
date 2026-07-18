'use client'
import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Catches runtime errors in any subtree and prevents whole-page crashes.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
  }
  reset = () => this.setState({ hasError: false, error: null })
  render() {
    if (this.state.hasError) {
      const fb = this.props.fallback
      if (typeof fb === 'function') return fb({ error: this.state.error, reset: this.reset })
      if (fb) return fb
      return (
        <div dir="rtl" className="min-h-[300px] flex items-center justify-center p-8">
          <div className="max-w-md text-center bg-white rounded-3xl border border-red-100 shadow-sm p-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-black text-lg mb-1">حدث خطأ غير متوقع</h3>
            <p className="text-sm text-neutral-600 mb-4">يمكنك المحاولة مجدداً دون فقدان البيانات</p>
            <button onClick={this.reset} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-sm hover:bg-black transition">
              <RefreshCw className="w-4 h-4" /> إعادة المحاولة
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
