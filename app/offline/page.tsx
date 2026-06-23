import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-5">
        <WifiOff size={26} className="text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-white">You&apos;re offline</h1>
      <p className="text-muted-foreground text-sm mt-2 max-w-xs">
        Reconnect to browse beats, stream productions and book sessions.
      </p>
    </div>
  );
}
