import {usePayOS} from "@payos/payos-checkout";
import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import {cancelPaymentLink} from "../../../services/WalletService";
import {confirmPayment} from "../../../services/PaymentService.jsx";
import {clear} from "../../../store/slices/cartSlice.js";
import "./Payment.css";
import {createPaymentUrl} from "../../../services/PayOsService";
import axiosClient from "../../../config/APIConfig.jsx";

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const forceNew = Boolean(location?.state?.forceNew);
    const initialShippingFee = Number(location?.state?.shippingFee || 0);
    const initialShippingAddressId = location?.state?.shippingAddressId || null;
    // Try restore session synchronously to avoid briefly resetting timer to 5:00 on refresh
    const restoredSession = (() => {
        try {
            const raw = (typeof window !== 'undefined' ? window.localStorage : null)?.getItem('payos-session');
            if (!raw) return null;
            const data = JSON.parse(raw);
            const now = Date.now();
            if (data?.expiresAt && data.expiresAt > now && data?.checkoutUrl && data?.orderCode) {
                const remain = Math.max(0, Math.floor((data.expiresAt - now) / 1000));
                return {...data, remain};
            }
        } catch {
        }
        return null;
    })();

    // Detect a stale (expired) session; if present, we'll show expired state instead of creating new link on refresh
    const staleSession = (() => {
        try {
            const raw = (typeof window !== 'undefined' ? window.localStorage : null)?.getItem('payos-session');
            if (!raw) return null;
            const data = JSON.parse(raw);
            const now = Date.now();
            if (data?.expiresAt && data.expiresAt <= now && data?.checkoutUrl && data?.orderCode) {
                return data;
            }
        } catch {
        }
        return null;
    })();

    // Detect a browser refresh (Navigation Timing Level 2 or fallback)
    const isReload = (() => {
        try {
            const navs = typeof performance !== 'undefined' && performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
            if (navs && navs.length > 0) return navs[0]?.type === 'reload';
            if (typeof performance !== 'undefined' && performance.navigation) return performance.navigation.type === 1;
        } catch {
        }
        return false;
    })();


    const [shippingFee, setShippingFee] = useState(
        typeof restoredSession?.shippingFee === 'number' ? Number(restoredSession.shippingFee) : initialShippingFee
    );
    const cartItems = useSelector(state => state?.cart?.items || []);
    const dispatch = useDispatch();
    const STORAGE_KEY = 'payos-session';
    const STORAGE = typeof window !== 'undefined' ? window.localStorage : null;
    const FORCE_KEY = 'payos-force-new';
    const [orderCode, setOrderCode] = useState(restoredSession?.orderCode || null);
    const [isOpen, setIsOpen] = useState(Boolean(restoredSession));
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(restoredSession?.remain ?? 5 * 60); // giây
    const [expiresAt, setExpiresAt] = useState(restoredSession?.expiresAt || null);
    const [isExpired, setIsExpired] = useState(false);

    const paymentSuccessRef = useRef(false); // Set true onSuccess

    const timerRef = useRef(null);
    const expiredHandledRef = useRef(false);
    const expiredRedirectRef = useRef(false);
    const cancelCalledRef = useRef(false);
    const orderCodeRef = useRef(restoredSession?.orderCode || null);
    const dispatchRef = useRef(dispatch);
    const clearAllCartStorageRef = useRef(() => {
        try {
            if (!STORAGE) return;
            const keysToRemove = [];
            for (let i = 0; i < STORAGE.length; i++) {
                const key = STORAGE.key(i);
                if (key && key.startsWith('psgp_cart_v1_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => STORAGE.removeItem(key));
        } catch (err) {
            console.error('Error clearing cart storage:', err);
        }
    });

    // Cập nhật refs khi dispatch thay đổi
    useEffect(() => {
        dispatchRef.current = dispatch;
    }, [dispatch]);

    const [payOSConfig, setPayOSConfig] = useState({
        RETURN_URL: window.location.href, // required
        ELEMENT_ID: "embedded-payment-container", // required
        CHECKOUT_URL: restoredSession?.checkoutUrl || null, // required
        embedded: true, // Nếu dùng giao diện nhúng
        onSuccess: async (event) => {   // <-- thêm async
            try {
                await confirmPayment(buildConfirmPayload(true, location.state));
            } catch (confirmErr) {
                console.error('confirm payment failed', confirmErr);
            }
            // Clear Redux cart
            dispatchRef.current(clear());
            // Xóa tất cả cart storage items
            clearAllCartStorageRef.current();
            paymentSuccessRef.current = true;
            setIsOpen(false);
            setMessage("Thanh toán thành công");
            STORAGE?.removeItem(STORAGE_KEY);
            if (timerRef.current) clearInterval(timerRef.current);
        },
    });

    const {open, exit} = usePayOS(payOSConfig);

    const handleGetPaymentLink = async () => {
        setIsCreatingLink(true);
        try {
            const isCustom = Boolean(location?.state?.customRequest);
            const finalAmount = Number(location?.state?.amount || 0);
    
            let payload;
    
            if (isCustom) {
                // 🟢 CUSTOM REQUEST PAYLOAD
                payload = {
                    amount: finalAmount,
                    customRequest: true
                };
            } else {
                // 🟠 NORMAL CART PAYLOAD
                const products = (cartItems || []).map((it) => ({
                    productId: it.id,
                    size: it.size,
                    price: Number(it.price) || 0,
                    quantity: Number(it.quantity || 1),
                }));
    
                payload = {
                    products,
                    shippingFee
                };
            }
    
            const response = await createPaymentUrl(payload);
    
            const result = response.data;
            setOrderCode(result.orderCode);
            orderCodeRef.current = result.orderCode;
    
            setPayOSConfig((oldConfig) => ({
                ...oldConfig,
                CHECKOUT_URL: result.checkoutUrl,
            }));
    
            setIsOpen(true);
    
            // Save session
            const now = Date.now();
            const newExpiresAt = now + 5 * 60 * 1000;
    
            STORAGE?.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    orderCode: result.orderCode,
                    checkoutUrl: result.checkoutUrl,
                    expiresAt: newExpiresAt,
                    shippingFee,
                    customRequest: isCustom,
                    size: payload.size,
    images: payload.images,
    occasion: payload.occasion,
    amount: finalAmount   // <--- store custom request flag
                })
            );
    
            setExpiresAt(newExpiresAt);
            setTimeRemaining(5 * 60);
            setIsExpired(false);
    
        } catch (error) {
            console.error("Error creating payment link:", error);
            setMessage("Có lỗi xảy ra khi tạo link thanh toán");
            setMessageType("error");
        } finally {
            setIsCreatingLink(false);
        }
    };
    

    const buildConfirmPayload = (successFlag, locationState) => {
        const code = orderCodeRef.current || orderCode || 0;
    
        const base = {
            products: (cartItems || []).map(it => ({
                productId: it.id,
                size: it.size,
                price: Number(it.price) || 0,
                quantity: Number(it.quantity || 1),
            })),
            orderCode: Number(code),
            shippingFee: Number(shippingFee) || 0,
            shippingAddressId: initialShippingAddressId || null,
            success: Boolean(successFlag),
        };
    
        if (locationState?.customRequest) {
            return {
                products: [], // BẮT BUỘC PHẢI LÀ ARRAY RỖNG
                orderCode: Number(code),
                shippingFee: 0,
                shippingAddressId: null,
                success: Boolean(successFlag),
        
                // custom data
                size: locationState.size,
                images: locationState.images,
                occasion: locationState.occasion,
                amount: locationState.amount,
                customRequest: true
            };
        }
        
    
        return base;
    };
    
    const handleCancelPayment = async () => {
        // Hủy và quay về trang checkout
        try {
            setIsCancelling(true);
            try {
                exit && exit();
            } catch {
            }
            if (orderCode) {
                await cancelPaymentLink(orderCode);
            }
            try {
                await confirmPayment(buildConfirmPayload(false, location.state));
            } catch (confirmErr) {
                console.error('confirm payment failed', confirmErr);
            }
        } catch (e) {
            // ignore
        } finally {
            try {
                STORAGE && STORAGE.removeItem(STORAGE_KEY);
            } catch {
            }
            setIsCancelling(false);
            navigate('/buyer');
        }
    };

    // Đếm ngược thời gian (dựa trên expiresAt để giữ chính xác tuyệt đối)
    useEffect(() => {
        if (isOpen && !isExpired && expiresAt) {
            timerRef.current = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
                setTimeRemaining(remaining);
                if (remaining === 0) {
                    setIsExpired(true);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isOpen, isExpired, expiresAt]);

    // Track previous pathname để phát hiện khi chuyển trang
    const prevPathnameRef = useRef(location.pathname);

    useEffect(() => {
        const currentPath = location.pathname;
        const prevPath = prevPathnameRef.current;

        // Nếu chuyển từ trang payment sang trang khác
        if (prevPath === "/buyer/payment" && currentPath !== "/buyer/payment" && !isReload && !paymentSuccessRef.current && !expiredRedirectRef.current && !cancelCalledRef.current) {
            cancelCalledRef.current = true;
            const code = orderCodeRef.current || orderCode;
            (async () => {
                try {
                    exit && exit();
                } catch {
                }
                if (code) {
                    try {
                        await cancelPaymentLink(code);
                        await confirmPayment(buildConfirmPayload(false, location.state));
                    } catch (confirmErr) {
                        console.error('confirm payment failed on route change', confirmErr);
                    }
                }
                try {
                    STORAGE && STORAGE.removeItem(STORAGE_KEY);
                } catch {
                }
            })();
        }

        prevPathnameRef.current = currentPath;
    }, [location.pathname, orderCode, isReload]);

    // Cập nhật orderCodeRef khi orderCode thay đổi
    useEffect(() => {
        if (orderCode) {
            orderCodeRef.current = orderCode;
        }
    }, [orderCode]);

    // Cleanup khi component unmount - đảm bảo gọi cancel khi rời khỏi component
    useEffect(() => {
        return () => {
            // Chỉ gọi nếu chưa gọi cancel, chưa thành công, và không phải do hết hạn
            const code = orderCodeRef.current;
            if (!paymentSuccessRef.current && !expiredRedirectRef.current && !cancelCalledRef.current && code) {
                cancelCalledRef.current = true;
                // Dùng async để đảm bảo request được gửi
                (async () => {
                    try {
                        exit && exit();
                    } catch {
                    }
                    try {
                        await cancelPaymentLink(code);
                        await confirmPayment(buildConfirmPayload(false));
                    } catch (confirmErr) {
                        console.error('confirm payment failed on unmount', confirmErr);
                    }
                    try {
                        STORAGE && STORAGE.removeItem(STORAGE_KEY);
                    } catch {
                    }
                })();
            }
        };
    }, []);

    // Trường hợp đóng trình duyệt/tab: cố gắng gửi cancel + confirm bằng sendBeacon/keepalive
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (paymentSuccessRef.current || expiredRedirectRef.current || cancelCalledRef.current) return;
            const code = orderCodeRef.current;
            if (!code) return;
            cancelCalledRef.current = true;
            const base = typeof axiosClient?.defaults?.baseURL === 'string' ? axiosClient.defaults.baseURL : '';
            const origin = (typeof window !== 'undefined' ? window.location.origin : '');
            const baseAbs = base?.startsWith('http') ? base : (origin + (base || ''));
            const cancelPaymentLinkUrl = `${baseAbs}/wallet?orderCode=${encodeURIComponent(code)}`;
            const confirmUrl = `${baseAbs}/payment/confirm`;
            try {
                // Best effort: DELETE may not be supported by sendBeacon, fallback to keepalive fetch if needed
                navigator.sendBeacon(cancelPaymentLinkUrl, new Blob([], {type: 'application/json'}));
            } catch {
                try {
                    fetch(walletUrl, {method: 'DELETE', keepalive: true});
                } catch {
                }
            }
            try {
                const body = JSON.stringify(buildConfirmPayload(false, location.state));
                navigator.sendBeacon(confirmUrl, new Blob([body], {type: 'application/json'}));
            } catch {
                try {
                    fetch(confirmUrl, {
                        method: 'POST',
                        body: JSON.stringify(buildConfirmPayload(false, location.state)),
                        headers: {'Content-Type': 'application/json'},
                        keepalive: true
                    });
                } catch {
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Khi hết hạn tự động hủy và quay lại trang checkout
    useEffect(() => {
        if (isExpired && !expiredHandledRef.current) {
            expiredHandledRef.current = true;
            (async () => {
                try {
                    try {
                        exit && exit();
                    } catch {
                    }
                    try {
                        await confirmPayment(buildConfirmPayload(false, location.state));
                    } catch (confirmErr) {
                        console.error('confirm payment failed', confirmErr);
                    }
                } catch (e) {
                    // ignore
                } finally {
                    expiredRedirectRef.current = true;
                    try {
                        STORAGE && STORAGE.removeItem(STORAGE_KEY);
                    } catch {
                    }
                    navigate('/buyer');
                }
            })();
        }
    }, [isExpired, orderCode]);

    // Format thời gian: MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Khi vào trang Payment:
    // - Nếu forceNew=true (đi từ Checkout), luôn tạo link mới, dọn session cũ
    // - Nếu refresh trang (không có forceNew), dùng session đã khôi phục đồng bộ ở trên nếu còn hạn
    useEffect(() => {
        // 1) If we have a valid saved session, ALWAYS restore (covers refresh reliably)
        if (restoredSession) {
            setPayOSConfig((old) => ({...old, CHECKOUT_URL: restoredSession.checkoutUrl}));
            setIsOpen(true);
            setTimeRemaining(restoredSession.remain);
            if (restoredSession.expiresAt) setExpiresAt(restoredSession.expiresAt);
            setIsExpired(false);
            return;
        }

        // 2) Durable force flag (coming from Checkout) → force new link once
        const forceFlag = Boolean(forceNew) || (STORAGE ? STORAGE.getItem(FORCE_KEY) === '1' : false);
        if (forceFlag) {
            try {
                STORAGE && STORAGE.removeItem(STORAGE_KEY);
            } catch {
            }
            try {
                STORAGE && STORAGE.removeItem(FORCE_KEY);
            } catch {
            }
            handleGetPaymentLink();
            return;
        }
        // Nếu có session nhưng đã hết hạn, hiển thị trạng thái hết hạn và KHÔNG tạo link mới
        if (staleSession) {
            setOrderCode(staleSession.orderCode || null);
            setIsOpen(false);
            setTimeRemaining(0);
            setIsExpired(true);
            return;
        }
        // Không có session hợp lệ => tạo mới
        handleGetPaymentLink();
    }, [forceNew, isReload]);

    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL != null) {
            open();
        }
    }, [payOSConfig]);

    return message ? (
        <Message message={message} type={messageType}/>
    ) : (
        <div className="payment-container">
            <div className="payment-wrapper">
                <div className="payment-header">
                    <h2 className="payment-title">Thanh toán</h2>
                    {isOpen && !isExpired && (
                        <div className="timer-container">
                            <div className="timer-icon">⏱️</div>
                            <div className="timer-text">
                                <span className="timer-label">Thời gian còn lại:</span>
                                <span className={`timer-countdown ${timeRemaining <= 60 ? "timer-warning" : ""}`}>
                    {formatTime(timeRemaining)}
                  </span>
                            </div>
                        </div>
                    )}
                    {isExpired && (
                        <div className="timer-expired">
                            Link thanh toán đã hết hạn
                        </div>
                    )}
                </div>

                {isCreatingLink && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p className="loading-text">Đang tạo link thanh toán...</p>
                    </div>
                )}

                {isOpen && !isExpired && (
                    <div className="payment-info">
                        <div className="info-box">
                            <p className="info-text">
                                Sau khi thực hiện thanh toán thành công, vui lòng đợi từ 5 - 10 giây để
                                hệ thống tự động cập nhật.
                            </p>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '12px'}}>
                            <button
                                className="retry-button"
                                onClick={handleCancelPayment}
                                disabled={isCancelling}
                            >
                                {isCancelling ? 'Đang hủy...' : 'Hủy thanh toán'}
                            </button>
                        </div>
                    </div>
                )}


                <div
                    id="embedded-payment-container"
                    className="payment-embed-container"
                ></div>
            </div>
        </div>
    );
};

const Message = ({message, type = "success"}) => (
    <div className="payment-container">
        <div className="payment-wrapper">
            {type === "success" ? (
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <p className="success-text">{message}</p>
                    <a href="/" className="back-button">Quay lại trang chủ</a>
                </div>
            ) : (
                <div className="error-message">
                    <div className="error-icon">✕</div>
                    <p className="error-text">{message}</p>
                    <a href="/" className="back-button">Quay lại trang chủ</a>
                </div>
            )}
        </div>
    </div>
);
  