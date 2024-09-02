import { useCallback, useRef, useState } from "react";

/**
 * 自定义drawer hook
 */
export function useDrawerParams() {
  const [visible, setVisible] = useState(false);
  const paramsRef = useRef({});
  const hideModal = useCallback(() => {
    setVisible(false);
    paramsRef.current = {};
  }, []);
  const showModal = useCallback((params) => {
    console.log(params, 'params')
    if (params) {
      paramsRef.current = params;
    }
    setVisible(true);
  }, []);
  return {
    hideModal,
    showModal,
    visible,
    params: paramsRef.current,
    modalProps: {
      open: visible,
      onClose: hideModal,
      maskClosable: false,
      destroyOnClose: true,
    },
  };
}