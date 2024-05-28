import React from "react";

import { Button } from "~/components/common/Button";

import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  content: React.ReactNode;
  primaryButtonText: string;
  secondaryButtonText: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
}

const Modal = ({
  isOpen,
  onConfirm,
  onCancel,
  content,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonColor,
  secondaryButtonColor,
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles["modal-backdrop"]}>
      <div className={styles.modal}>
        {content}
        <div className={styles.flex}>
          <Button
            color={primaryButtonColor}
            className="rounded-md px-8 w-1/2 h-[30px] text-sm"
            onClick={onConfirm}
          >
            {primaryButtonText}
          </Button>
          <Button
            color={secondaryButtonColor}
            className="rounded-md px-8 w-1/2 h-[30px] text-sm"
            onClick={() => {
              onCancel();
            }}
          >
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Modal };
