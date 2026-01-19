"use client";
import React from "react";

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error("[ErrorBoundary]", err); }
  render() {
    if (this.state.hasError) return <div className="p-md text-red-700">Đã có lỗi không mong muốn. Vui lòng tải lại trang.</div>;
    return this.props.children as any;
  }
}
