// default profile page with post content
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import ProfileLayout from "../../components/ProfileLayout";
import Link from "next/link";
import { BsHeartFill } from "react-icons/bs";
import { AiTwotoneMessage, AiOutlinePlus } from "react-icons/ai";
import { useSetRecoilState } from "recoil";
import { uploadModalState } from "../../atoms/uploadModalAtom";
import isMobile from "../../utils/useMediaQuery";
import { useContextualRouting } from "../../utils/contextualRouting";
import {
  collection,
  DocumentData,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { CurrentSession } from "../../utils/types";
import ContentLoader from "../../loaders/ContentLoader";
import Image from "next/image";
import placeholder from "../../utils/rgbDataUrl";

const Profile: NextPageWithLayout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [curProfile, setCurProfile] = useState<DocumentData>();
  const session = useSession().data as CurrentSession;
  const [posts, setPosts] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const isMb = isMobile();
  const { makeContextualHref, returnHref } = useContextualRouting();
  const username = router.query.username as string;
  const openUploadModal = useSetRecoilState(uploadModalState);

  // get posts of the current profile
  useEffect(() => {
    if (curProfile) {
      setLoading(true);
      const unsubscribe = onSnapshot(
        query(collection(db, "posts"), where("userId", "==", curProfile.id)),
        (snapshot) => {
          setPosts(snapshot.docs);
          setLoading(false);
        }
      );
      return unsubscribe;
    }
  }, [username, curProfile]);

  // get the user data of current profile
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "users"), where("username", "==", username)),
      (snapshot) => {
        setCurProfile(snapshot.docs[0]);
      }
    );
    return unsubscribe;
  }, [username]);

  if (loading || !curProfile)
    return (
      <div className="flex items-center justify-center h-[300px]">
        <ContentLoader />
      </div>
    );

  return (
    <div className="profileContentWrapper">
      {posts.length > 0 && posts[0].data() ? ( // extra check to ensure document data is not undefined
        <>
          {curProfile.id === session.user.id ? (
            <p className="text-center text-gray-500 mb-8 text-lg font-bold">
              Your posts
            </p>
          ) : (
            <p className="text-center text-gray-500 mb-8 text-lg font-bold">
              <span className="font-bold text-black mr-1">
                {curProfile.data().username}
              </span>
              's posts
            </p>
          )}
          <div className="profileContentContainer">
            {posts.map((post, idx) => (
              <div className="relative aspect-square mb-4" key={post.id}>
                <div className="h-full w-full p-2">
                  <Link
                    href={
                      isMb
                        ? `/post/${post.id}`
                        : makeContextualHref({
                            routeModalId: "post",
                            currentPageURL: returnHref,
                            postId: post.id,
                          })
                    }
                    as={isMb ? undefined : `/post/${post.id}`}
                    className="group relative rounded-lg h-full w-full block overflow-hidden"
                  >
                    <figure className={`${post.data()?.imageFilter} h-full`}>
                      <Image
                        src={post.data().postImage ?? placeholder} // avoid errors on post upload: see ImageUpload component
                        width={400}
                        height={400}
                        placeholder="blur"
                        blurDataURL={placeholder}
                        priority={idx < 8 ? true : false}
                        alt="post image"
                        className="object-cover h-full group-hover:scale-125 transition-all duration-300 ease-in-out"
                      />
                    </figure>
                    <div
                      className="hidden group-hover:flex absolute inset-0 justify-center 
                                                    items-center bg-black/30 text-white font-bold"
                    >
                      <span className="flex items-center text-xl mr-3">
                        <BsHeartFill size={18} className="mr-1" />
                        {post.data().likes.length}
                      </span>
                      <span className="flex items-center text-xl ml-3">
                        <>
                          <AiTwotoneMessage size={20} className="mr-1" />
                          {post.data().commentCount}
                        </>
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : // render depends whether the profile belongs to current user or not
      curProfile.id === session.user.id ? (
        <div className="text-center">
          <p className="text-gray-400 mb-5">
            You don't have any posts right now
          </p>
          <p className="text-xl font-bold mb-16">Start creating one</p>
          <div className="h-28 w-28 mx-auto mb-10 relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-instaBlue opacity-25" />
            <button
              className="absolute inset-0 z-1 flex justify-center items-center
                                    rounded-full bg-instaBlue"
              onClick={() => openUploadModal(true)}
            >
              <AiOutlinePlus size={30} className="text-white" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 py-16 text-center">
          This user has no post yet
        </p>
      )}
    </div>
  );
};

Profile.getLayout = function getLayout(page: ReactElement) {
  return <ProfileLayout>{page}</ProfileLayout>;
};

export default Profile;
