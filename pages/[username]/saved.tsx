import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import ProfileLayout from "../../components/ProfileLayout";
import type { NextPageWithLayout } from "../_app";
import { BsHeartFill } from "react-icons/bs";
import { AiTwotoneMessage } from "react-icons/ai";
import { RiSave3Fill } from "react-icons/ri";
import { useRouter } from "next/router";
import isMobile from "../../utils/useMediaQuery";
import { useContextualRouting } from "../../utils/contextualRouting";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSession } from "next-auth/react";
import { CurrentSession } from "../../utils/types";
import ContentLoader from "../../loaders/ContentLoader";
import Image from "next/image";
import placeholder from "../../utils/rgbDataUrl";

const Saved: NextPageWithLayout = () => {
  const [savedPosts, setSavedPosts] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [curProfile, setCurProfile] = useState<DocumentData>();
  const isMb = isMobile();
  const { makeContextualHref, returnHref } = useContextualRouting();
  const session = useSession().data as CurrentSession;
  const router = useRouter();
  const username = router.query.username;

  // get and set current user profile
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "users"), where("username", "==", username)),
      (snapshot) => {
        setCurProfile(snapshot.docs[0]);
      }
    );
    return unsubscribe;
  }, [username]);

  // get and set saved posts
  useEffect(() => {
    if (curProfile) {
      setLoading(true);
      const unsubscribe = onSnapshot(
        doc(db, "users", curProfile.id),
        (snapshot) => {
          const savedPostsPromise = snapshot
            .data()
            ?.savedPosts.map((postId: string) => {
              return getDoc(doc(db, "posts", postId));
            });
          Promise.all(savedPostsPromise).then((savedPosts) => {
            if (savedPosts.length === 0) {
              setLoading(false);
              return;
            }
            setSavedPosts(savedPosts);
            savedPosts.forEach((post) => {
              setSavedPostIds((savedIds) => [...savedIds, post.id]);
              setLoading(false);
            });
          });
        }
      );
      return unsubscribe;
    }
  }, [curProfile]);

  // listen to changes on saved posts
  useEffect(() => {
    if (savedPostIds.length > 0) {
      const unsubscribe = onSnapshot(
        query(collection(db, "posts"), where("__name__", "in", savedPostIds)),
        (snapshot) => {
          setSavedPosts(snapshot.docs);
        }
      );
      return unsubscribe;
    }
  }, [savedPostIds]);

  if (loading || !curProfile)
    return (
      <div className="flex items-center justify-center h-[300px]">
        <ContentLoader />
      </div>
    );

  return (
    <div className="profileContentWrapper">
      {curProfile.id === session.user.id ? (
        savedPosts.length > 0 && savedPosts[0].data() ? ( // extra check to ensure document data is not undefined
          <>
            <p className="text-center text-gray-500 mb-8 text-lg font-bold">
              Only you can see your saved posts
            </p>
            <div className="profileContentContainer">
              {savedPosts.map((post, idx) => (
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
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-5">
              <RiSave3Fill className="text-gray-400" size={90} />
            </div>
            <p className="text-gray-400">You don't have any saved posts yet</p>
          </div>
        )
      ) : (
        <p className="text-center py-16 text-gray-400">
          You don't have access to this content
        </p>
      )}
    </div>
  );
};

Saved.getLayout = function (page: ReactElement) {
  return <ProfileLayout>{page}</ProfileLayout>;
};

export default Saved;
