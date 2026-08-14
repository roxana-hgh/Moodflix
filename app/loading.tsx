function LoadingPage() {
    return ( 
        <div className="fixed inset-0 bg-background flex items-center justify-center">
        
<div className="animate-pulse pb-16">
      <div className="h-[70vh] min-h-[420px] w-full bg-muted/40" />
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-8 sm:px-6">
        <div className="h-40 rounded-2xl bg-muted/40" />
        <div className="h-24 rounded-2xl bg-muted/40" />
      </div>
    </div>
        </div>
     );
}

export default LoadingPage;
