import AuthProvider from "@/components/AuthProvider";
import ChatsSideBar from "@/components/ChatsSideBar";
import SocketIOProvider from "@/components/socketio";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SocketIOProvider>
        <div className="w-full flex max-h-screen overflow-hidden">
          <ChatsSideBar />
          <div className="flex-1 w-full">{children}</div>
        </div>
      </SocketIOProvider>
    </AuthProvider>
  );
}
