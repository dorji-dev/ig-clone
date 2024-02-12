import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  arrayRemove,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Moment from "react-moment";
import { useContextualRouting } from "../utils/contextualRouting";
import { useRouter } from "next/router";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { TbMessageCircle2 } from "react-icons/tb";
import { FiSend } from "react-icons/fi";
import { RiBookmark3Fill, RiBookmark3Line } from "react-icons/ri";
import { BsEmojiSmile } from "react-icons/bs";
import isMobile from "../utils/useMediaQuery";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { postOptionsModalState } from "../atoms/postOptionsAtom";
import { useSetRecoilState } from "recoil";
import Link from "next/link";
import { CurrentSession } from "../utils/types";
import Image from "next/image";
import placeholder from "../utils/rgbDataUrl";

interface PostData {
  index?: number;
  postId: string;
  username: string;
  userImage: string;
  postImage: string;
  caption: string;
  imageFilter?: string;
  commentCount: number;
  timeStamp: any;
}

/**
 * Post component used in the `index/home page` composing the feeds and in the `single post page` for mobile devices.
 */
const Post = ({
  index,
  postId,
  username,
  imageFilter,
  userImage,
  postImage,
  commentCount,
  caption,
  timeStamp,
}: PostData) => {
  const [showPicker, setShowPicker] = useState(false);
  const session = useSession().data as CurrentSession;
  const [comment, setComment] = useState("");
  const [userComments, setUserComments] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]); // comments by current user
  const [likes, setLikes] = useState<string[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [hasSaved, setHasSaved] = useState(false);
  const { makeContextualHref, returnHref } = useContextualRouting();
  const router = useRouter();
  const isMb = isMobile();
  const setPostIdForOptions = useSetRecoilState(postOptionsModalState);

  // update comments
  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "comments"),
          where("postId", "==", postId),
          orderBy("timeStamp", "desc")
        ),
        (snapShot) => {
          setUserComments(
            snapShot.docs.filter(
              (comment) => comment.data().userId === session.user.id
            )
          );
        }
      ),
    []
  );

  // update likes
  useEffect(
    () =>
      onSnapshot(doc(db, "posts", postId), (snapshot) =>
        setLikes(snapshot.data()?.likes)
      ),
    []
  );

  // update hasLiked
  useEffect(() => {
    setHasLiked(likes.includes(session.user.id));
  }, [likes]);

  //update savePosts
  useEffect(
    () =>
      onSnapshot(doc(db, "users", session.user.id), (snapshot) =>
        setSavedPosts(snapshot.data()?.savedPosts)
      ),
    []
  );

  // update hasSaved
  useEffect(() => {
    setHasSaved(savedPosts.includes(postId));
  }, [savedPosts]);

  // post comment
  const postComment = async (e: FormEvent) => {
    e.preventDefault();
    const commentToSend = comment;
    setComment(""); // avoid spamming

    await addDoc(collection(db, "comments"), {
      text: commentToSend,
      likes: [],
      userId: session.user.id,
      postId: postId,
      username: session.user.username,
      userImage: session.user.image,
      parentColRef: `posts/${postId}/comments`,
      timeStamp: serverTimestamp(),
    });

    await updateDoc(doc(db, "posts", postId), {
      commentCount: increment(1),
    });
  };

  // post like
  const postLike = async () => {
    if (hasLiked) {
      await updateDoc(doc(db, "posts", postId), {
        likes: arrayRemove(session.user.id),
      });
    } else {
      await updateDoc(doc(db, "posts", postId), {
        likes: arrayUnion(session.user.id),
      });
    }
  };

  // save post
  const savePost = async () => {
    if (hasSaved) {
      await updateDoc(doc(db, "users", session.user.id), {
        savedPosts: arrayRemove(postId),
      });
    } else {
      await updateDoc(doc(db, "users", session.user.id), {
        savedPosts: arrayUnion(postId),
      });
    }
  };

  return (
    <div className={`bg-white md:rounded-lg md:shadow-mainShadow relative`}>
      {/* show emoji picker */}
      {showPicker && (
        <EmojiPicker
          onClose={() => setShowPicker(false)}
          onSelect={(emoji) =>
            setComment((prevComment) => prevComment + emoji.native)
          }
        />
      )}
      {/* Header */}
      <div className="flex items-center p-2 md:p-3">
        <Link href={`/${username}`}>
          <img
            className="rounded-full h-10 w-10 object-contain p-1 mr-3 border"
            src={userImage ?? "/images/placeholder.png"}
            alt="user-avatar"
          />
        </Link>
        <Link href={`/${username}`} className="font-bold">
          {username}
        </Link>
        <button className="ml-auto" onClick={() => setPostIdForOptions(postId)}>
          <BiDotsHorizontalRounded className="h-8 w-8" />
        </button>
      </div>

      {/* Post image */}
      <figure className={imageFilter}>
        <Image
          className="object-contain"
          width={800}
          height={800}
          placeholder="blur"
          blurDataURL={placeholder}
          style={{ width: "100%", height: "auto" }}
          priority={index && index > 1 ? false : true}
          sizes="(max-width: 767px) 100vw,
                        (min-width: 768px) 70vw"
          src={postImage ?? placeholder} // avoid errors on post upload: see ImageUpload component
          alt="post image"
        />
      </figure>
      {/* bottom section */}
      <section className="pt-5">
        {/* Buttons */}
        <div className="flex mb-4 justify-between px-5">
          <div className="flex space-x-4">
            {/* like button */}
            {hasLiked ? (
              <button onClick={() => postLike()} className="reactBtn">
                <AiFillHeart className="reactBtnIcon text-[#FF69B4]" />
              </button>
            ) : (
              <button onClick={() => postLike()} className="reactBtn">
                <AiOutlineHeart className="reactBtnIcon" />
              </button>
            )}
            {/* comment button */}
            <button
              className="reactBtn"
              onClick={() => {
                isMb
                  ? router.push(`/post/${postId}/comments`)
                  : router.push(
                      makeContextualHref({
                        routeModalId: "post",
                        currentPageURL: returnHref,
                        postId: postId,
                      }),
                      `/post/${postId}`,
                      { scroll: false }
                    );
              }}
            >
              <TbMessageCircle2 className="reactBtnIcon" />
            </button>
            {/* share button */}
            <button className="reactBtn">
              <FiSend className="w-7 h-7 rotate-[18deg]" />
            </button>
          </div>
          {/* save button */}
          <button onClick={savePost} className="reactBtn">
            {hasSaved ? (
              <RiBookmark3Fill className="reactBtnIcon text-instaBlue" />
            ) : (
              <RiBookmark3Line className="reactBtnIcon" />
            )}
          </button>
        </div>

        {/* Caption, likes and comments */}
        <div className="px-5">
          {likes.length > 0 &&
            (likes.length === 1 ? (
              <p className="font-bold mb-2">{likes.length} like</p>
            ) : (
              <p className="font-bold mb-2">{likes.length} likes</p>
            ))}
          {/* caption */}
          <p className="mb-2">
            <Link href={`/${username}`} className="font-bold mr-1">
              {username}
            </Link>
            {caption}
          </p>
          {commentCount > 0 && (
            <button
              onClick={() => {
                isMb
                  ? router.push(`/post/${postId}/comments`)
                  : router.push(
                      makeContextualHref({
                        routeModalId: "post",
                        currentPageURL: returnHref,
                        postId: postId,
                      }),
                      `/post/${postId}`,
                      { scroll: false }
                    );
              }}
              className="text-gray-500 mb-2"
            >
              {`View ${commentCount} ${commentCount === 1 ? "comment" : "comments"}`}
            </button>
          )}
          {/* current user comments */}
          <div>
            {userComments.length > 0 &&
              userComments.map((comment) => (
                <p className="mb-2" key={comment.id}>
                  <span className="font-bold mr-2">
                    {comment.data().username}
                  </span>
                  <span>{comment.data().text}</span>
                </p>
              ))}
          </div>
        </div>

        {/* post timestamp */}
        <div className="px-5 pb-4 pt-2 wordSpace block uppercase text-[10px] font-[500] text-gray-400">
          <Moment fromNow>{timeStamp?.toDate()}</Moment>
        </div>

        {/* Input box */}
        <form
          className="hidden border-t py-2 md:flex items-center px-5"
          onSubmit={(e) => postComment(e)}
        >
          <button type="button" onClick={() => setShowPicker(true)}>
            <BsEmojiSmile className="w-6 h-6" />
          </button>
          <input
            className="flex-1 text-[100%] focus:ring-0 border-none outline-none
                            placeholder:font-[600] placeholder:text-gray-400"
            type="text"
            name="comment"
            placeholder="Add a comment..."
            id="comment"
            value={comment}
            autoComplete="off"
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            disabled={!comment?.trim()}
            className="font-semibold text-instaBlue disabled:text-instaBlue/50"
            type="submit"
          >
            Post
          </button>
        </form>
      </section>
    </div>
  );
};

export default Post;
