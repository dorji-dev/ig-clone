import { ReactElement, useEffect } from "react";
import Header from "./Header";
import { useRouter } from "next/router";
import MobileBottomNav from "./MobileBottomNav";
import PostUploadModal from "./PostUploadModal";
import ProfileImageUpload from "./ProfileImageUpload";
import RoutedModal from "./RoutedModal";
import PostOptionsModal from "./PostOptionsModal";
import SwitchAccountModal from "./Message/SwitchAccountModal";
import NewMessageModal from "./Message/NewMessageModal";
import { useSession } from "next-auth/react";
import Notice from "../components/Notice";
import DeleteAccountModal from "./DeleteAccountModal";

const Layout = ({ children }: { children: ReactElement }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // secure unauthorized contents
  useEffect(() => {
    if (router.pathname !== "/auth/signin" && status === "unauthenticated") {
      const loader = document.getElementById("initial-loader"); // keep loading until pushed to login page upon visit of any other page
      if (loader) loader.remove();
      router.push("/auth/signin");
    }
  }, [status]);

  // remove the initial loader after page is hydrated/ user is authenticated
  useEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (loader && status === "authenticated") loader.remove();
  }, [status]);

  if (
    (router.pathname !== "/auth/signin" && status === "unauthenticated") ||
    status === "loading"
  )
    return <></>;

  return (
    <main className="flex flex-col">
      {session && <Header />}
      <div className="min-h-[64px]"></div>
      <div className="grow">{children}</div>
      {session && !router.query.chatId && <MobileBottomNav />}
      <PostUploadModal />
      <ProfileImageUpload />
      <RoutedModal />
      <PostOptionsModal />
      <SwitchAccountModal />
      <NewMessageModal />
      <Notice />
      <DeleteAccountModal />
    </main>
  );
};

export default Layout;
