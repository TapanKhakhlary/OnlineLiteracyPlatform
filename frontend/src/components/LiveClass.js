import { Button, Modal, ModalOverlay, ModalContent } from '@chakra-ui/react';
import { ZoomMtg } from '@zoomus/websdk';

export default function LiveClass({ meetingNumber, password }) {
  const [isOpen, setIsOpen] = useState(false);

  const startMeeting = () => {
    ZoomMtg.init({
      leaveUrl: window.location.origin,
      success: () => {
        ZoomMtg.join({
          meetingNumber,
          userName: "Teacher",
          passWord: password,
          success: () => setIsOpen(true),
          error: console.error
        });
      }
    });
  };

  return (
    <>
      <Button onClick={startMeeting}>Start Live Class</Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent w="90vw" h="90vh">
          <div id="zoom-meeting-container"></div>
        </ModalContent>
      </Modal>
    </>
  );
}