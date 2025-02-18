import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { PulsatingButton } from "@/components/ui/pulsuating-button";

export default function StartCall() {
  const { status, connect } = useVoice();

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className={"fixed inset-0 p-4  flex items-center justify-center"}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <PulsatingButton
            className={"z-50 flex justify-center items-center gap-1.5"}
            onClick={() => {
              connect()
                .then(() => {})
                .catch(() => {})
                .finally(() => {});
            }}
          >
            <div></div>
            <div>
              <span>Start Call</span>
            </div>
          </PulsatingButton>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
