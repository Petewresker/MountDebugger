import { useEffect, useRef } from 'react';

/**
 * Hook สำหรับ debug component lifecycle
 * แสดง mount, update, unmount และ props/state changes
 */
export function useLifecycleLogger(componentName, props = {}) {
  const renderCount = useRef(0);
  const previousProps = useRef(props);
  const mountTime = useRef(null);

  // นับจำนวน render
  renderCount.current += 1;

  // เช็ค props ที่เปลี่ยน
  const changedProps = Object.keys(props).reduce((acc, key) => {
    if (previousProps.current[key] !== props[key]) {
      acc[key] = {
        from: previousProps.current[key],
        to: props[key]
      };
    }
    return acc;
  }, {});

  useEffect(() => {
    // MOUNT
    mountTime.current = new Date();
    console.log(
      `%c[MOUNT] ${componentName}`,
      'color: #4CAF50; font-weight: bold; font-size: 14px;',
      {
        time: mountTime.current.toLocaleTimeString(),
        props: props
      }
    );

    // UNMOUNT
    return () => {
      const unmountTime = new Date();
      const lifetime = unmountTime - mountTime.current;
      console.log(
        `%c[UNMOUNT] ${componentName}`,
        'color: #F44336; font-weight: bold; font-size: 14px;',
        {
          time: unmountTime.toLocaleTimeString(),
          lifetime: `${lifetime}ms`,
          totalRenders: renderCount.current
        }
      );
    };
  }, []);

  useEffect(() => {
    // UPDATE (ไม่รวม mount)
    if (renderCount.current > 1) {
      console.log(
        `%c[UPDATE] ${componentName} - Render #${renderCount.current}`,
        'color: #FF9800; font-weight: bold; font-size: 14px;',
        {
          time: new Date().toLocaleTimeString(),
          changedProps: Object.keys(changedProps).length > 0 ? changedProps : 'No props changed',
          allProps: props
        }
      );
    }
    previousProps.current = props;
  });

  // แสดง render info ทุกครั้ง
  console.log(
    `%c[RENDER] ${componentName} #${renderCount.current}`,
    'color: #2196F3; font-size: 12px;',
    {
      time: new Date().toLocaleTimeString(),
      changedProps: Object.keys(changedProps).length > 0 ? Object.keys(changedProps) : 'none'
    }
  );

  return {
    renderCount: renderCount.current,
    changedProps: Object.keys(changedProps)
  };
}

/**
 * Hook เช็ค reconciliation
 * แสดงว่า component ถูก reconcile เพราะอะไร
 */
export function useWhyDidYouUpdate(componentName, props) {
  const previousProps = useRef();
  const renderCount = useRef(0);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
            equal: previousProps.current[key] === props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.group(`%c[WHY UPDATE] ${componentName} - Render #${renderCount.current}`, 'color: #9C27B0; font-weight: bold;');
        console.log('Changed props:', changedProps);
        console.groupEnd();
      }
    }

    previousProps.current = props;
    renderCount.current += 1;
  });
}

export default useLifecycleLogger;
