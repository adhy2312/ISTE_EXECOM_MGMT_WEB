export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "2rem" }}>
      <div 
        className="spinner" 
        style={{ 
          border: "4px solid rgba(255,255,255,0.1)", 
          borderTopColor: "var(--primary-blue)", 
          borderRadius: "50%", 
          width: "48px", 
          height: "48px", 
          animation: "spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite" 
        }} 
      />
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
