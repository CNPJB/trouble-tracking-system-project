import { useRef, useCallback } from 'react';

export const useInfiniteScroll = ({ 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage, 
    onLoadMore 
}) => {
    const observerRef = useRef();

    const lastElementRef = useCallback(node => {
        // ถ้ากำลังโหลดอยู่ ไม่ต้องทำอะไร
        if (isLoading || isFetchingNextPage) return;
        
        // ล้าง observer ตัวเก่าทิ้งก่อนตั้งตัวใหม่
        if (observerRef.current) observerRef.current.disconnect();

        // สร้างเซนเซอร์จับการมองเห็น
        observerRef.current = new IntersectionObserver(entries => {
            // ถ้าเลื่อนมาเจอ element นี้ (isIntersecting) และยังมีหน้าถัดไป
            if (entries[0].isIntersecting && hasNextPage) {
                onLoadMore(); // สั่งให้โหลดหน้าต่อไป
            }
        });

        // เอาเซนเซอร์ไปติดไว้ที่ DOM node ที่ส่งเข้ามา
        if (node) observerRef.current.observe(node);

    }, [isLoading, isFetchingNextPage, hasNextPage, onLoadMore]);

    // คืนค่า ref ออกไปให้ Component เอาไปแปะที่ div ล่างสุด
    return lastElementRef;
};