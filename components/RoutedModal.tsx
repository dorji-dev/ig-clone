// modal routing component
import Modal from "./Modal";
import { useRouter } from "next/router";
import Followers from "./Followers";
import Following from "./Following";
import DetailedPost from "./DetailedPost";
import Notifications from "./Notifications";

const RoutedModal = () => {
  const router = useRouter();
  const modalName = router.query.routeModalId as string;
  const postId = router.query.postId as string;
  const userId = router.query.userId as string;
  const followers = modalName === "followers";
  const following = modalName === "following";
  const post = modalName === "post";
  const notification = modalName === "notification";

  return (
    <Modal
      open={!!router.query.routeModalId}
      onClose={() => {
        router.push(router.query.currentPageURL as string, undefined, {
          scroll: false,
        });
      }}
      bg={post ? "bg-transparent" : "bg-white"}
      overflowY={post ? false : true}
    >
      <>
        {followers && (
          <Followers
            onClose={() =>
              router.push(router.query.currentPageURL as string, undefined, {
                scroll: false,
              })
            }
            userId={userId}
            onModal={true}
          />
        )}
        {following && (
          <Following
            onClose={() =>
              router.push(router.query.currentPageURL as string, undefined, {
                scroll: false,
              })
            }
            userId={userId}
            onModal={true}
          />
        )}
        {post && <DetailedPost postId={postId} onModal={true} />}
        {notification && (
          <Notifications
            onModal={true}
            onClose={() =>
              router.push(router.query.currentPageURL as string, undefined, {
                scroll: false,
              })
            }
          />
        )}
      </>
    </Modal>
  );
};

export default RoutedModal;
