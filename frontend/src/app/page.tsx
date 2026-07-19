import { ChatPanel } from "@/components/chat-panel";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col md:h-screen md:flex-row md:overflow-hidden">
      <div className="flex-1 md:overflow-y-auto">
        <Dashboard />
      </div>
      <div className="flex h-[70vh] flex-col border-t md:h-full md:w-[420px] md:shrink-0 md:border-t-0 md:border-l">
        <ChatPanel />
      </div>
    </div>
  );
}
