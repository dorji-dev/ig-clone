import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { uploadModalState } from "../atoms/uploadModalAtom";
import { Tooltip } from "flowbite-react";
import { FaHome } from "react-icons/fa";
import { BiMessageRounded } from "react-icons/bi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { BsPeople } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { TbSearch } from "react-icons/tb";
import InstantSearch from "./InstantSearch";
import { useContextualRouting } from "../utils/contextualRouting";
import { CurrentSession } from "../utils/types";
import { MdOutlineFeaturedPlayList } from "react-icons/md";

const Header = () => {
  const session = useSession().data as CurrentSession;
  const router = useRouter();
  const openUploadModal = useSetRecoilState(uploadModalState);
  const { makeContextualHref, returnHref } = useContextualRouting();

  return (
    <header className="shadow-sm border-b bg-white fixed top-0 right-0 left-0 z-50 min-h-[54px] h-[64px] max-h-[64px]">
      <div className="flex justify-between h-full items-center mx-6 md:max-w-4xl lg:max-w-6xl md:mx-auto">
        {/* Header left */}
        <div
          className="relative w-[100px] h-full cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/images/instagram-logo.png"
            alt="instagram-logo"
            fill
            priority
            className="object-contain"
            sizes="150px"
          />
        </div>
        {/* Header middle/search input */}
        {router.pathname !== "/search" && (
          <div className="relative hidden md:block h-[35px] min-w-[200px] transition-all ease-in-out duration-100 ml-6 mr-auto focus-within:flex-1">
            <div className="focus-within:shadow-mainShadow rounded-md overflow-hidden">
              <InstantSearch />
            </div>
          </div>
        )}

        {/* Header right */}
        <div className="flex md:ml-5 items-center justify-end space-x-4">
          {/* home icon */}
          <div className="dNavWrapper">
            <Tooltip
              id="home"
              className="mt-[10px]"
              style="dark"
              content="Home"
              placement="bottom"
              animation="duration-1000"
            >
              <button
                aria-labelledby="home"
                className="dNavBtn group"
                onClick={() => router.push("/")}
              >
                <FaHome className="w-6 h-6 dNavIcon" />
              </button>
            </Tooltip>
          </div>
          {/* feature icon */}
          <div className="!mx-1">
            <Tooltip
              id="features"
              className="mt-[10px]"
              style="dark"
              content="Features"
              placement="bottom"
              animation="duration-1000"
            >
              <button
                aria-labelledby="features"
                className="relative dNavBtn group"
                onClick={() => router.push("/application/features")}
              >
                <MdOutlineFeaturedPlayList className="h-8 text-instaBlue w-8 md:w-6 md:h-6 dNavIcon" />
              </button>
            </Tooltip>
          </div>

          {/* mobile search icon */}
          <button onClick={() => router.push("/search")} className="md:hidden">
            <TbSearch className="w-8 h-8" />
          </button>
          {/* mobile notification icon */}
          <button
            onClick={() => router.push("/accounts/activity")}
            className="md:hidden"
          >
            <IoMdNotificationsOutline className="w-9 h-9" />
          </button>
          {/* message icon */}
          <div className="dNavWrapper">
            <Tooltip
              id="messages"
              className="mt-[10px]"
              style="dark"
              content="Messages"
              placement="bottom"
              animation="duration-1000"
            >
              <button
                aria-labelledby="messages"
                className="relative dNavBtn group"
                onClick={() => router.push("/direct/inbox")}
              >
                <span
                  className="absolute top-0 right-1 text-xs w-5 h-5 rounded-full bg-red-500
                                            flex items-center justify-center text-white z-10 animate-pulse"
                >
                  3
                </span>
                <BiMessageRounded className="w-6 h-6 dNavIcon" />
              </button>
            </Tooltip>
          </div>
          {/* create icon */}
          <div className="dNavWrapper">
            <Tooltip
              id="create"
              className="mt-[10px]"
              style="dark"
              content="Create"
              placement="bottom"
              animation="duration-1000"
            >
              <button
                aria-labelledby="create"
                className="dNavBtn group"
                onClick={() => openUploadModal(true)}
              >
                <AiOutlinePlusCircle className="w-[18px] h-[18px] dNavIcon" />
              </button>
            </Tooltip>
          </div>
          {/* explore icon */}
          <div className="dNavWrapper">
            <Tooltip
              id="explore"
              className="mt-[10px]"
              style="dark"
              content="Explore"
              placement="bottom"
              animation="duration-1000"
            >
              <button aria-labelledby="explore" className="dNavBtn group">
                <BsPeople className="w-[20px] h-[20px] dNavIcon" />
              </button>
            </Tooltip>
          </div>
          {/* notification icon */}
          <div className="dNavWrapper">
            <Tooltip
              id="notifications"
              className="mt-[10px]"
              style="dark"
              content="Notification"
              placement="bottom"
              animation="duration-1000"
            >
              <button
                aria-labelledby="notifications"
                onClick={() =>
                  router.push(
                    makeContextualHref({
                      routeModalId: "notification",
                      currentPageURL: returnHref,
                    }),
                    "/accounts/activity"
                  )
                }
                className="dNavBtn -mr-3 md:mr-0 group"
              >
                <IoMdNotificationsOutline className="w-6 h-6 dNavIcon" />
              </button>
            </Tooltip>
          </div>
          {/* profile link */}
          <div className="dNavWrapper">
            <Tooltip
              id="profile"
              className="mt-[7px]"
              style="dark"
              content={`@${session && session.user.username}`}
              placement="bottom"
              animation="duration-1000"
            >
              <button
                aria-labelledby="profile"
                onClick={() => router.push(`/${session?.user?.username}`)}
                className="h-12 w-12 flex items-center justify-center cursor-pointer bg-transparent ml-0 hover:bg-gray-100 rounded-full group"
              >
                <img
                  src={session?.user?.image as string}
                  alt="avatar"
                  className="h-10 rounded-full cursor-pointer group-hover:w-[35px] group-hover:h-[35px] relative transition-all duration-75 ease-in-out"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
