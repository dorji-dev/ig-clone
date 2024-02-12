import { useRecoilState } from "recoil";
import { uploadModalState } from "../atoms/uploadModalAtom";
import { useState } from "react";
import ImageSelect from "./ImageSelect";
import ImageEditor from "./ImageEditor";
import ImageUpload from "./ImageUpload";
import PostDiscardAlert from "./PostDiscardAlert";
import Modal from "./Modal";

const PostUploadModal = () => {
  const [openModal, setOpenModal] = useRecoilState(uploadModalState);
  const [selectedFile, setSelectedFile] = useState<any>(null); // file selected from device
  const [fileSelectOpen, setFileSelectOpen] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [captionModalOpen, setCaptionModalOpen] = useState(false);
  const [alertChanges, setAlertChanges] = useState(false);

  const closeModal = () => {
    if (filter || selectedFile) {
      setAlertChanges(true);
    } else {
      setOpenModal(false);
    }
  };

  const discard = () => {
    selectedFile && setSelectedFile(null);
    filter && setFilter("");
    editorOpen && setEditorOpen(false);
    captionModalOpen && setCaptionModalOpen(false);
    setFileSelectOpen(true);
    setAlertChanges(false);
    setOpenModal(false);
  };

  const cancel = () => {
    setAlertChanges(false);
  };

  return (
    <>
      <Modal open={openModal} onClose={() => closeModal()}>
        <>
          {alertChanges && (
            <PostDiscardAlert discard={discard} cancel={cancel} />
          )}
          {fileSelectOpen && (
            <ImageSelect
              setFileSelectOpen={setFileSelectOpen}
              setEditorOpen={setEditorOpen}
              setSelectedFile={setSelectedFile}
            />
          )}
          {editorOpen && (
            <ImageEditor
              setFileSelectOpen={setFileSelectOpen}
              setEditorOpen={setEditorOpen}
              setCaptionModalOpen={setCaptionModalOpen}
              selectedFile={selectedFile}
              setFilter={setFilter}
              filter={filter}
              setSelectedFile={setSelectedFile}
              editorOpen={editorOpen}
              captionModalOpen={captionModalOpen}
            />
          )}
          {captionModalOpen && (
            <ImageUpload
              setEditorOpen={setEditorOpen}
              setCaptionModalOpen={setCaptionModalOpen}
              setOpenModal={setOpenModal}
              setFileSelectOpen={setFileSelectOpen}
              setFilter={setFilter}
              filter={filter}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          )}
        </>
      </Modal>
    </>
  );
};

export default PostUploadModal;
