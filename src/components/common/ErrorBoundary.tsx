"use client";
import React, { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<{ fallback?: ReactNode; children: ReactNode }, { e?: any }> {
  state = { e: null as any };
  static getDerivedStateFromError(e: any) { return { e }; }
  render() {
    if (this.state.e) return this.props.fallback ?? <div className="p-4 text-sm text-red-400">Noe gikk galt.</div>;
    return this.props.children as any;
  }
}

export default ErrorBoundary;


